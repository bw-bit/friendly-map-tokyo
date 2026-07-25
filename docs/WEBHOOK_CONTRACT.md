# OPEN DOOR TOKYO publish webhook contract

## Endpoint

```text
POST https://friendly-map-tokyo.loveworks-x-harness.workers.dev/api/webhooks/open-door
```

## OPEN DOOR variables

```text
LISTING_WEBHOOK_URL      # non-secret
LISTING_WEBHOOK_SECRET   # secret
```

## Headers

```text
content-type: application/json
idempotency-key: open-door:<cardId>
x-open-door-event: access_card.published
x-open-door-signature: sha256=<lowercase HMAC-SHA256 hex of exact raw body>
```

## Body

```json
{
  "event": "access_card.published",
  "schemaVersion": 1,
  "cardId": "card-id",
  "publicUrl": "https://publisher.example/cards/card-id",
  "card": {}
}
```

`card.id` must equal `cardId`. The Access Card schema is defined by Zod in `src/domain/accessCard.ts`.

## Responses

- `200`, `duplicate: false`: inserted or updated
- `200`, `duplicate: true`: exact body already processed
- `400`: header or schema mismatch
- `401`: invalid signature
- `503`: receiver secret not configured

The same `cardId` and a changed payload updates the existing venue. A changed payload does not create a second venue.

