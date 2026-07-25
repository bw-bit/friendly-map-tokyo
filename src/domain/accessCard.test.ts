import { describe, expect, it } from "vitest";
import { filterCards, openDoorPublishSchema } from "./accessCard";
import { sampleVenues } from "../data/sampleVenues";

describe("OPEN DOOR publish schema", () => {
  it("accepts the version 1 publishing contract", () => {
    const result = openDoorPublishSchema.safeParse({
      event: "access_card.published",
      schemaVersion: 1,
      cardId: sampleVenues[0].id,
      publicUrl: "https://cards.example.org/shibuya-machino-shokudo",
      card: sampleVenues[0]
    });
    expect(result.success).toBe(true);
  });

  it("rejects unsupported schema versions and duplicate feature evidence", () => {
    const card = {
      ...sampleVenues[0],
      features: [sampleVenues[0].features[0], sampleVenues[0].features[0]]
    };
    const result = openDoorPublishSchema.safeParse({
      event: "access_card.published",
      schemaVersion: 2,
      cardId: card.id,
      publicUrl: "https://cards.example.org/card",
      card
    });
    expect(result.success).toBe(false);
  });
});

describe("consumer filtering", () => {
  it("uses confirmed evidence only for multi-filter matching", () => {
    const result = filterCards(sampleVenues, "", [
      "step_free",
      "hearing_writing_support"
    ]);
    expect(result.map((card) => card.id)).toEqual([
      "asakusa-kissa-komorebi",
      "ueno-minna-cultural-hall"
    ]);
  });

  it("searches Japanese and English venue metadata", () => {
    expect(filterCards(sampleVenues, "cultural", []).map((card) => card.id)).toEqual([
      "ueno-minna-cultural-hall"
    ]);
  });
});
