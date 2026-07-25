import { sampleVenues } from "../data/sampleVenues";
import { openDoorPublishSchema, type AccessCard } from "../domain/accessCard";
import { verifyHmacSha256 } from "./crypto";
import type { Env } from "./env";
import {
  ImportError,
  logAuthenticatedFailure,
  parsePublishPayload,
  processPublishPayload
} from "./importer";

const jsonHeaders = {
  "content-type": "application/json; charset=utf-8",
  "cache-control": "no-store"
};

function json(data: unknown, status = 200, extraHeaders?: HeadersInit): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...jsonHeaders, ...extraHeaders }
  });
}

function secure(response: Response): Response {
  const secured = new Response(response.body, response);
  secured.headers.set("x-content-type-options", "nosniff");
  secured.headers.set("x-frame-options", "DENY");
  secured.headers.set("referrer-policy", "strict-origin-when-cross-origin");
  secured.headers.set(
    "permissions-policy",
    "camera=(), microphone=(), geolocation=(self)"
  );
  secured.headers.set(
    "content-security-policy",
    "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline' https://unpkg.com; img-src 'self' data: https://*.tile.openstreetmap.org https://unpkg.com; connect-src 'self' https://*.tile.openstreetmap.org; font-src 'self' data:; object-src 'none'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'"
  );
  return secured;
}

function adminAuthorized(request: Request, env: Env): boolean {
  const authorization = request.headers.get("authorization");
  return Boolean(
    env.ADMIN_TOKEN &&
      env.ADMIN_TOKEN.length >= 24 &&
      authorization === `Bearer ${env.ADMIN_TOKEN}`
  );
}

async function listVenues(env: Env): Promise<Response> {
  const rows = await env.DB.prepare(
    "SELECT card_json FROM venues ORDER BY updated_at DESC LIMIT 500"
  ).all<{ card_json: string }>();

  const merged = new Map<string, AccessCard>(sampleVenues.map((card) => [card.id, card]));
  for (const row of rows.results) {
    try {
      const parsed = JSON.parse(row.card_json) as AccessCard;
      merged.set(parsed.id, parsed);
    } catch {
      // A malformed stored row is excluded rather than breaking the public list.
    }
  }

  return json({
    venues: [...merged.values()],
    sampleDataActive: rows.results.length === 0,
    generatedAt: new Date().toISOString()
  });
}

async function handleWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.LISTING_WEBHOOK_SECRET) {
    return json({ error: "webhook_not_configured" }, 503);
  }

  const rawBody = await request.text();
  const validSignature = await verifyHmacSha256(
    rawBody,
    request.headers.get("x-open-door-signature"),
    env.LISTING_WEBHOOK_SECRET
  );
  if (!validSignature) {
    return json({ error: "invalid_signature" }, 401);
  }

  let payload;
  try {
    payload = parsePublishPayload(rawBody);
    const expectedKey = `open-door:${payload.cardId}`;
    if (request.headers.get("idempotency-key") !== expectedKey) {
      throw new ImportError(
        "invalid_idempotency_key",
        `idempotency-key must be ${expectedKey}`
      );
    }
    if (request.headers.get("x-open-door-event") !== payload.event) {
      throw new ImportError(
        "event_header_mismatch",
        "x-open-door-event must match body.event"
      );
    }
    return json(await processPublishPayload(env, payload, rawBody, "open-door-webhook"));
  } catch (error) {
    const importError =
      error instanceof ImportError
        ? error
        : new ImportError("unexpected_import_error", "Unexpected import error.", 500);
    await logAuthenticatedFailure(
      env,
      rawBody,
      "open-door-webhook",
      importError,
      payload?.cardId ? `open-door:${payload.cardId}` : undefined
    );
    return json(
      { error: importError.code, message: importError.message },
      importError.status
    );
  }
}

async function handleAdminImport(request: Request, env: Env): Promise<Response> {
  const rawBody = await request.text();
  try {
    const payload = parsePublishPayload(rawBody);
    return json(await processPublishPayload(env, payload, rawBody, "admin-import"));
  } catch (error) {
    const importError =
      error instanceof ImportError
        ? error
        : new ImportError("unexpected_import_error", "Unexpected import error.", 500);
    await logAuthenticatedFailure(env, rawBody, "admin-import", importError);
    return json(
      { error: importError.code, message: importError.message },
      importError.status
    );
  }
}

async function handleAdminUrlImport(request: Request, env: Env): Promise<Response> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }
  const publicUrl =
    typeof value === "object" && value !== null && "publicUrl" in value
      ? String(value.publicUrl)
      : "";
  let target: URL;
  try {
    target = new URL(publicUrl);
  } catch {
    return json({ error: "invalid_public_url" }, 400);
  }
  const allowedHosts = (env.IMPORT_ALLOWED_HOSTS ?? "")
    .split(",")
    .map((host) => host.trim().toLowerCase())
    .filter(Boolean);
  if (
    target.protocol !== "https:" ||
    !allowedHosts.includes(target.hostname.toLowerCase())
  ) {
    return json({ error: "public_url_host_not_allowed" }, 400);
  }

  const upstream = await fetch(target, {
    headers: { accept: "application/json" },
    redirect: "error"
  });
  if (!upstream.ok) return json({ error: "public_url_fetch_failed" }, 502);
  const rawBody = await upstream.text();
  return handleAdminImport(new Request(request.url, { method: "POST", body: rawBody }), env);
}

async function handleRetry(request: Request, env: Env, id: number): Promise<Response> {
  const failure = await env.DB.prepare(
    "SELECT raw_payload FROM failure_logs WHERE id = ? AND resolved_at IS NULL"
  )
    .bind(id)
    .first<{ raw_payload: string }>();
  if (!failure) return json({ error: "failure_not_found" }, 404);

  try {
    const payload = parsePublishPayload(failure.raw_payload);
    const result = await processPublishPayload(
      env,
      payload,
      failure.raw_payload,
      "admin-retry"
    );
    await env.DB.prepare(
      "UPDATE failure_logs SET retry_count = retry_count + 1, resolved_at = CURRENT_TIMESTAMP WHERE id = ?"
    )
      .bind(id)
      .run();
    return json(result);
  } catch (error) {
    await env.DB.prepare(
      "UPDATE failure_logs SET retry_count = retry_count + 1 WHERE id = ?"
    )
      .bind(id)
      .run();
    const importError =
      error instanceof ImportError
        ? error
        : new ImportError("retry_failed", "Retry failed.", 500);
    return json(
      { error: importError.code, message: importError.message },
      importError.status
    );
  }
}

async function handleCorrectionRequest(request: Request, env: Env): Promise<Response> {
  let value: unknown;
  try {
    value = await request.json();
  } catch {
    return json({ error: "invalid_json" }, 400);
  }

  const parsed = {
    venueId:
      typeof value === "object" && value !== null && "venueId" in value
        ? String(value.venueId).trim()
        : "",
    message:
      typeof value === "object" && value !== null && "message" in value
        ? String(value.message).trim()
        : "",
    contact:
      typeof value === "object" && value !== null && "contact" in value
        ? String(value.contact).trim()
        : ""
  };
  if (!parsed.venueId || parsed.message.length < 10 || parsed.message.length > 1500) {
    return json({ error: "invalid_correction_request" }, 400);
  }

  await env.DB.prepare(
    "INSERT INTO correction_requests (venue_id, message, contact) VALUES (?, ?, ?)"
  )
    .bind(parsed.venueId, parsed.message, parsed.contact.slice(0, 240) || null)
    .run();
  return json({ ok: true }, 201);
}

async function handleApi(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);

  if (request.method === "GET" && url.pathname === "/api/health") {
    return json({ ok: true, service: "friendly-map-tokyo" });
  }
  if (request.method === "GET" && url.pathname === "/api/venues") {
    return listVenues(env);
  }
  if (request.method === "POST" && url.pathname === "/api/webhooks/open-door") {
    return handleWebhook(request, env);
  }
  if (request.method === "POST" && url.pathname === "/api/corrections") {
    return handleCorrectionRequest(request, env);
  }

  if (url.pathname.startsWith("/api/admin/") && !adminAuthorized(request, env)) {
    return json({ error: "admin_unauthorized" }, 401);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/import") {
    return handleAdminImport(request, env);
  }
  if (request.method === "POST" && url.pathname === "/api/admin/import-url") {
    return handleAdminUrlImport(request, env);
  }
  if (request.method === "GET" && url.pathname === "/api/admin/failures") {
    const failures = await env.DB.prepare(
      `SELECT id, delivery_id, source, error_code, error_message, retry_count, created_at
       FROM failure_logs WHERE resolved_at IS NULL ORDER BY created_at DESC LIMIT 100`
    ).all();
    return json({ failures: failures.results });
  }
  const retryMatch = url.pathname.match(/^\/api\/admin\/failures\/(\d+)\/retry$/);
  if (request.method === "POST" && retryMatch) {
    return handleRetry(request, env, Number(retryMatch[1]));
  }
  return json({ error: "not_found" }, 404);
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    try {
      const url = new URL(request.url);
      const response = url.pathname.startsWith("/api/")
        ? await handleApi(request, env)
        : await env.ASSETS.fetch(request);
      return secure(response);
    } catch (error) {
      console.error("request_failed", {
        message: error instanceof Error ? error.message : "unknown",
        path: new URL(request.url).pathname
      });
      return secure(json({ error: "internal_server_error" }, 500));
    }
  }
} satisfies ExportedHandler<Env>;
