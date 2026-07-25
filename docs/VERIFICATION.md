# 検証記録

## ローカル

- `npm run typecheck`: exit 0
- `npm run test`: 2 files / 6 tests passed
- `npm run build`: exit 0
- `npm run test:e2e`: 7 passed / 1 intentional skip
  - desktop and mobile: map, search, multi-filter, detail, share URL
  - admin: manual import and retry UI
  - API contract: first delivery, exact duplicate, changed body with same cardId
  - axe: desktop and mobileで重大度serious/criticalの違反0件
- `npm run deploy:dry`: exit 0

モバイルのAPI契約テストは同じデータ変更を重複実行しないため意図的にskipし、Chromiumプロジェクトで1回実行しています。

## 本番

公開URL:

```text
https://friendly-map-tokyo.loveworks-x-harness.workers.dev
```

2026-07-25の実地確認:

- `GET /api/health`: 200
- 署名済み初回 `POST /api/webhooks/open-door`: 200 / `duplicate: false`
- exact body再送: 200 / `duplicate: true`
- `GET /api/venues`: 対象cardIdは1件だけ

ローカルの秘密値を含まない実行記録は `work/evidence/live-verification.json` に保存しています。

## ビジュアル比較

- デスクトップ概念図: 1536×1024
- デスクトップ実装: 1536×1024
- モバイル概念図: 853×1844
- モバイル実装: 390×844
- Browser/IABで実画面を確認し、IABのviewport overrideが1280×720に固定されたため、同寸法撮影だけPlaywright Chromiumへフォールバック
- `view_image` で概念図と実装画像を同じQAパスで確認

確認点:

1. 一覧/地図の比率と選択状態
2. off-white、ink、moss、coral、amberの色体系
3. 日本語の文字階層とコントロール文字サイズ
4. 詳細シート、証拠行、未確認状態
5. デスクトップ/モバイルの地図と固定アクション
6. Above-the-fold copyに未承認の認定・保証表現がないこと

修正した差分:

- 地図マーカーの数字向きを補正
- デスクトップ詳細シートを地図が読める高さへ縮小
- モバイル詳細シートを地図面積が残る高さへ調整
- モバイル地図は選択施設を中心とした縮尺へ調整

残る意図的差分:

- 生成概念図は3件、実装は4件のサンプルを持つ
- 実装は要件を満たすため、概念図より具体条件を3項目多く表示する
- OpenStreetMapの実タイルは概念図と地物・ラベル密度が異なる
