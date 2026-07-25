# やさしい東京マップ

東京の店舗・施設のアクセシビリティ情報を、一覧と地図から具体的な条件・根拠・確認日付きで探せる消費者向けWebアプリです。

公開URL: [https://friendly-map-tokyo.loveworks-x-harness.workers.dev](https://friendly-map-tokyo.loveworks-x-harness.workers.dev)

## このサイトが守る表示原則

- 「車椅子フレンドリー」などを公的な認定・保証として表示しません。
- 絞り込みには `confirmed` の根拠だけを使います。
- 各条件に具体情報、根拠種別、証拠日時、最終確認日を表示します。
- 回答待ちや再確認中は「未確認」「一部未確認」と明示します。
- 利用者は施設ごとに情報修正を依頼できます。

## 主な機能

- モバイル優先の一覧・OpenStreetMap地図
- 場所、駅名、施設名、カテゴリの検索
- 車椅子、ベビーカー、聴覚・筆談、英語メニュー、段差なし、広い入口、可動席の複数絞り込み
- 日英Access Card、証拠日時、最終確認日、Google Maps導線
- URLへ検索条件と選択施設を保持する共有URL
- OPEN DOOR TOKYO publish webhook
- HMAC-SHA256署名、スキーマ検証、`cardId` upsert、完全重複の抑止
- 失敗ログ、管理画面からの手動JSON/公開URL取り込み、失敗payload再送
- 自動連携前でも動く組み込みサンプルデータ

## 2分デモ

1. 公開URLを開く（10秒）。
2. 「段差なし」と「聴覚・筆談」を選び、確認済み根拠のある施設だけに絞られることを見る（20秒）。
3. 施設を選び、Access Cardの具体情報、証拠日時、未確認表示、最終確認日を開く（30秒）。
4. 「ENGLISH」で英語表示、「Google Mapsで開く」「情報修正を依頼」を確認する（20秒）。
5. `/admin` を開き、同梱のversion 1 payload、公開カードURL取り込み、失敗ログ再送UIを確認する（25秒）。
6. `POST /api/webhooks/open-door` へ同じ署名済みbodyを2回送り、2回目が `duplicate: true` かつ一覧に1件だけ存在することを見る（15秒）。

## OPEN DOOR TOKYO 送信設定

受信URL:

```text
https://friendly-map-tokyo.loveworks-x-harness.workers.dev/api/webhooks/open-door
```

OPEN DOOR側へ設定する変数:

```text
LISTING_WEBHOOK_URL      # 非秘密
LISTING_WEBHOOK_SECRET   # 秘密
```

契約:

```http
POST /api/webhooks/open-door
content-type: application/json
idempotency-key: open-door:<cardId>
x-open-door-event: access_card.published
x-open-door-signature: sha256=<HMAC-SHA256 of exact raw body>
```

```json
{
  "event": "access_card.published",
  "schemaVersion": 1,
  "cardId": "venue-card-id",
  "publicUrl": "https://open-door.example/cards/venue-card-id",
  "card": {
    "id": "venue-card-id",
    "name": { "ja": "施設名", "en": "Venue name" }
  }
}
```

`card` の完全スキーマは [src/domain/accessCard.ts](src/domain/accessCard.ts) を参照してください。署名はJSONの再整形前のexact bodyに対して計算します。署名比較はWeb CryptoのHMAC verifyを使います。

同じ `cardId`・同じbodyは `duplicate: true`。同じ `cardId` でもbodyが更新されていれば同一行をupsertします。

## ローカル開発

前提: Node.js 22以上、npm、Cloudflare Wranglerログイン（デプロイ時のみ）。

```bash
npm install
cp .env.example .dev.vars
npm run build
npx wrangler d1 migrations apply friendly-map-tokyo-db --local
npm run dev:worker
```

別ターミナルでViteのHMRを使う場合:

```bash
npm run dev
```

## 検証

```bash
npm run typecheck
npm run test
npm run test:e2e
npm run build
npm run deploy:dry
```

E2Eはデスクトップ/モバイルの検索・複数絞り込み・詳細・共有URL・管理画面と、exact body署名の初回配送・完全重複・同じcardIdの内容更新を検証します。

## 構成

- React 19 + Vite: 消費者UIと管理画面
- Leaflet + OpenStreetMap: APIキー不要の地図
- Cloudflare Worker: API、署名検証、静的配信
- Cloudflare D1: venue、配送台帳、失敗ログ、修正依頼
- Zod: version 1 payloadとAccess Cardスキーマ
- Vitest / Playwright: ユニット・ブラウザ・API契約テスト

## 環境変数

| 変数 | 秘密 | 用途 |
| --- | --- | --- |
| `LISTING_WEBHOOK_SECRET` | はい | OPEN DOOR webhookのHMAC共有秘密 |
| `ADMIN_TOKEN` | はい | 管理用インポート・失敗ログ再送 |
| `IMPORT_ALLOWED_HOSTS` | いいえ | 公開カードURL取り込みを許可するHTTPSホスト（カンマ区切り） |

実値はCloudflare Secretまたはローカルの `.dev.vars` に保存し、Gitへコミットしません。

## 外部権限・運用上の残件

- Google Business Profile APIは未使用です。Google側施設情報の自動同期には、別途Google Cloud project、OAuth同意、対象プロフィール権限が必要です。
- OPEN DOOR本番送信元へ `LISTING_WEBHOOK_URL` と、受信側と同じ `LISTING_WEBHOOK_SECRET` を設定する作業が残ります。
- 公開カードURL取り込みを使う場合は、実際のOPEN DOOR配信ホストを `IMPORT_ALLOWED_HOSTS` に追加します。未設定時も署名付きpayload連携とサンプルデータは動作します。
- OpenStreetMapタイルの利用規約・負荷方針に従ってください。大規模トラフィック時は専用タイルプロバイダを検討します。

## ライセンス

MIT

