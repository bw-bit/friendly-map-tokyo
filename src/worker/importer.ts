import {
  openDoorPublishSchema,
  type OpenDoorPublishPayload
} from "../domain/accessCard";
import { sha256Hex } from "./crypto";
import type { Env } from "./env";

export interface ImportResult {
  ok: true;
  duplicate: boolean;
  updated: boolean;
  cardId: string;
  deliveryId: string;
}

export class ImportError extends Error {
  constructor(
    public readonly code: string,
    message: string,
    public readonly status = 400
  ) {
    super(message);
  }
}

export function parsePublishPayload(rawBody: string): OpenDoorPublishPayload {
  let input: unknown;
  try {
    input = JSON.parse(rawBody);
  } catch {
    throw new ImportError("invalid_json", "Request body must be valid JSON.");
  }

  const parsed = openDoorPublishSchema.safeParse(input);
  if (!parsed.success) {
    const message = parsed.error.issues
      .slice(0, 5)
      .map((issue) => `${issue.path.join(".") || "body"}: ${issue.message}`)
      .join("; ");
    throw new ImportError("schema_validation_failed", message);
  }
  return parsed.data;
}

export async function processPublishPayload(
  env: Env,
  payload: OpenDoorPublishPayload,
  rawBody: string,
  source: "open-door-webhook" | "admin-import" | "admin-retry"
): Promise<ImportResult> {
  const deliveryId = `open-door:${payload.cardId}`;
  const payloadHash = await sha256Hex(rawBody);
  const existing = await env.DB.prepare(
    "SELECT payload_hash, status FROM ingestion_deliveries WHERE delivery_id = ?"
  )
    .bind(deliveryId)
    .first<{ payload_hash: string; status: string }>();

  if (existing?.status === "success" && existing.payload_hash === payloadHash) {
    return {
      ok: true,
      duplicate: true,
      updated: false,
      cardId: payload.cardId,
      deliveryId
    };
  }

  if (existing) {
    await env.DB.prepare(
      `UPDATE ingestion_deliveries
       SET source = ?, payload_hash = ?, raw_payload = ?, status = 'pending',
           attempt_count = attempt_count + 1, error_message = NULL,
           received_at = CURRENT_TIMESTAMP, completed_at = NULL
       WHERE delivery_id = ?`
    )
      .bind(source, payloadHash, rawBody, deliveryId)
      .run();
  } else {
    await env.DB.prepare(
      `INSERT INTO ingestion_deliveries
       (delivery_id, source, payload_hash, raw_payload, status)
       VALUES (?, ?, ?, ?, 'pending')`
    )
      .bind(deliveryId, source, payloadHash, rawBody)
      .run();
  }

  try {
    const cardJson = JSON.stringify(payload.card);
    const venueBefore = await env.DB.prepare("SELECT id FROM venues WHERE id = ?")
      .bind(payload.cardId)
      .first();

    await env.DB.batch([
      env.DB.prepare(
        `INSERT INTO venues
         (id, source_id, source, card_json, payload_hash, published_at, updated_at)
         VALUES (?, ?, 'open-door-tokyo', ?, ?, ?, CURRENT_TIMESTAMP)
         ON CONFLICT(id) DO UPDATE SET
           source_id = excluded.source_id,
           source = excluded.source,
           card_json = excluded.card_json,
           payload_hash = excluded.payload_hash,
           published_at = excluded.published_at,
           updated_at = CURRENT_TIMESTAMP`
      ).bind(
        payload.cardId,
        payload.cardId,
        cardJson,
        payloadHash,
        payload.card.lastReviewedAt
      ),
      env.DB.prepare(
        `UPDATE ingestion_deliveries
         SET status = 'success', venue_id = ?, completed_at = CURRENT_TIMESTAMP
         WHERE delivery_id = ?`
      ).bind(payload.cardId, deliveryId),
      env.DB.prepare(
        `UPDATE failure_logs SET resolved_at = CURRENT_TIMESTAMP
         WHERE delivery_id = ? AND resolved_at IS NULL`
      ).bind(deliveryId)
    ]);

    return {
      ok: true,
      duplicate: false,
      updated: Boolean(venueBefore),
      cardId: payload.cardId,
      deliveryId
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown database error";
    await env.DB.batch([
      env.DB.prepare(
        `UPDATE ingestion_deliveries
         SET status = 'failed', error_message = ?, completed_at = CURRENT_TIMESTAMP
         WHERE delivery_id = ?`
      ).bind(message.slice(0, 600), deliveryId),
      env.DB.prepare(
        `INSERT INTO failure_logs
         (delivery_id, source, raw_payload, error_code, error_message)
         VALUES (?, ?, ?, 'database_write_failed', ?)`
      ).bind(deliveryId, source, rawBody.slice(0, 100_000), message.slice(0, 600))
    ]);
    throw new ImportError("database_write_failed", "The payload could not be stored.", 500);
  }
}

export async function logAuthenticatedFailure(
  env: Env,
  rawBody: string,
  source: string,
  error: ImportError,
  deliveryId?: string
): Promise<void> {
  await env.DB.prepare(
    `INSERT INTO failure_logs
     (delivery_id, source, raw_payload, error_code, error_message)
     VALUES (?, ?, ?, ?, ?)`
  )
    .bind(
      deliveryId ?? null,
      source,
      rawBody.slice(0, 100_000),
      error.code,
      error.message.slice(0, 600)
    )
    .run();
}

