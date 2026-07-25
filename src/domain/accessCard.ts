import { z } from "zod";

export const featureKeys = [
  "wheelchair_access",
  "stroller_access",
  "hearing_writing_support",
  "english_menu",
  "step_free",
  "wide_entrance",
  "movable_seating"
] as const;

export type FeatureKey = (typeof featureKeys)[number];
export type Locale = "ja" | "en";

export const localizedTextSchema = z.object({
  ja: z.string().trim().min(1).max(240),
  en: z.string().trim().min(1).max(240)
});

export const evidenceSchema = z.object({
  sourceType: z.enum([
    "owner_submission",
    "staff_statement",
    "on_site_observation",
    "public_document",
    "public_card"
  ]),
  sourceLabel: localizedTextSchema,
  observedAt: z.string().datetime(),
  url: z.string().url().optional()
});

export const featureSchema = z.object({
  key: z.enum(featureKeys),
  status: z.enum(["confirmed", "unconfirmed", "not_available"]),
  detail: localizedTextSchema,
  evidence: evidenceSchema
});

export const accessCardSchema = z
  .object({
    id: z.string().trim().min(1).max(120),
    name: localizedTextSchema,
    category: localizedTextSchema,
    address: localizedTextSchema,
    location: z.object({
      lat: z.number().min(35.4).max(35.95),
      lng: z.number().min(138.9).max(140.1)
    }),
    googleMapsUrl: z.string().url(),
    accessCards: z.object({
      ja: z.object({ summary: z.string().trim().min(1).max(320) }),
      en: z.object({ summary: z.string().trim().min(1).max(320) })
    }),
    features: z.array(featureSchema).min(1).max(featureKeys.length),
    lastReviewedAt: z.string().datetime()
  })
  .superRefine((card, context) => {
    const seen = new Set<FeatureKey>();
    card.features.forEach((feature, index) => {
      if (seen.has(feature.key)) {
        context.addIssue({
          code: z.ZodIssueCode.custom,
          path: ["features", index, "key"],
          message: `duplicate feature key: ${feature.key}`
        });
      }
      seen.add(feature.key);
    });
  });

export const openDoorPublishSchema = z
  .object({
    event: z.literal("access_card.published"),
    schemaVersion: z.literal(1),
    cardId: z.string().trim().min(1).max(120),
    publicUrl: z.string().url(),
    card: accessCardSchema
  })
  .superRefine((payload, context) => {
    if (payload.card.id !== payload.cardId) {
      context.addIssue({
        code: z.ZodIssueCode.custom,
        path: ["card", "id"],
        message: "card.id must match cardId"
      });
    }
  });

export type AccessCard = z.infer<typeof accessCardSchema>;
export type AccessFeature = z.infer<typeof featureSchema>;
export type OpenDoorPublishPayload = z.infer<typeof openDoorPublishSchema>;

export const featureLabels: Record<
  FeatureKey,
  { ja: string; en: string; shortJa: string }
> = {
  wheelchair_access: {
    ja: "車椅子で入りやすい情報あり",
    en: "Wheelchair access information",
    shortJa: "車椅子"
  },
  stroller_access: {
    ja: "ベビーカーで入りやすい情報あり",
    en: "Stroller access information",
    shortJa: "ベビーカー"
  },
  hearing_writing_support: {
    ja: "聴覚・筆談サポート情報あり",
    en: "Hearing / written support information",
    shortJa: "聴覚・筆談"
  },
  english_menu: {
    ja: "英語メニュー",
    en: "English menu",
    shortJa: "英語メニュー"
  },
  step_free: {
    ja: "段差なし",
    en: "Step-free entrance",
    shortJa: "段差なし"
  },
  wide_entrance: {
    ja: "広い入口",
    en: "Wide entrance",
    shortJa: "広い入口"
  },
  movable_seating: {
    ja: "可動席",
    en: "Movable seating",
    shortJa: "可動席"
  }
};

export function confirmedFeatureKeys(card: AccessCard): FeatureKey[] {
  return card.features
    .filter((feature) => feature.status === "confirmed")
    .map((feature) => feature.key);
}

export function filterCards(
  cards: AccessCard[],
  query: string,
  selectedFeatures: FeatureKey[]
): AccessCard[] {
  const normalizedQuery = query.trim().toLocaleLowerCase("ja");

  return cards.filter((card) => {
    const haystack = [
      card.name.ja,
      card.name.en,
      card.category.ja,
      card.category.en,
      card.address.ja,
      card.address.en
    ]
      .join(" ")
      .toLocaleLowerCase("ja");

    const matchesQuery = normalizedQuery.length === 0 || haystack.includes(normalizedQuery);
    const confirmed = new Set(confirmedFeatureKeys(card));
    const matchesFeatures = selectedFeatures.every((key) => confirmed.has(key));
    return matchesQuery && matchesFeatures;
  });
}
