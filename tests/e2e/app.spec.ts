import { createHmac } from "node:crypto";
import { expect, test } from "@playwright/test";
import { sampleVenues } from "../../src/data/sampleVenues";

test("地図・検索・複数フィルター・詳細共有URLが動く", async (
  { page },
  testInfo
) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "やさしい東京マップ ホーム" })).toBeVisible();
  await expect(page.getByTestId("venue-map")).toBeVisible();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "一覧" }).click();
  }
  await expect(page.getByText(/\d+件見つかりました/)).toBeVisible();

  const search = page.getByPlaceholder("場所・駅名・キーワードで検索");
  await search.fill("浅草");
  await expect(page.getByText("1件見つかりました")).toBeVisible();
  await expect(page.getByText("浅草 喫茶こもれび")).toBeVisible();

  await search.fill("");
  await page.getByRole("button", { name: "段差なし" }).click();
  await page.getByRole("button", { name: "聴覚・筆談" }).click();
  await expect(page.getByText("2件見つかりました")).toBeVisible();
  await expect(page).toHaveURL(/features=step_free%2Chearing_writing_support/);

  await page
    .getByRole("region", { name: "検索結果一覧" })
    .getByRole("button", { name: /浅草 喫茶こもれび/ })
    .click();
  if (testInfo.project.name === "mobile") {
    await page.getByRole("button", { name: "地図" }).click();
  }
  await expect(page.getByTestId("venue-detail")).toContainText("Access Card");
  await expect(page.getByTestId("venue-detail")).toContainText("証拠日時");
  await expect(page).toHaveURL(/venue=asakusa-kissa-komorebi/);
});

test("OPEN DOOR契約はexact body署名とcardId upsertで冪等", async ({
  request
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "API contract is exercised once");

  const card = {
    ...sampleVenues[0],
    id: "od-e2e-unique-card",
    name: { ja: "E2E 検証施設", en: "E2E Verification Venue" }
  };
  const payload = {
    event: "access_card.published",
    schemaVersion: 1,
    cardId: card.id,
    publicUrl: `https://cards.example.org/${card.id}`,
    card
  };
  const body = JSON.stringify(payload);
  const signature = createHmac(
    "sha256",
    "e2e-open-door-secret-at-least-24-characters"
  )
    .update(body)
    .digest("hex");
  const headers = {
    "content-type": "application/json",
    "idempotency-key": `open-door:${card.id}`,
    "x-open-door-event": "access_card.published",
    "x-open-door-signature": `sha256=${signature}`
  };

  const first = await request.post("/api/webhooks/open-door", {
    data: body,
    headers
  });
  expect(first.status()).toBe(200);
  expect((await first.json()).duplicate).toBe(false);

  const duplicate = await request.post("/api/webhooks/open-door", {
    data: body,
    headers
  });
  expect(duplicate.status()).toBe(200);
  expect((await duplicate.json()).duplicate).toBe(true);

  const updatedPayload = {
    ...payload,
    card: { ...card, name: { ja: "E2E 更新済み施設", en: "Updated E2E Venue" } }
  };
  const updatedBody = JSON.stringify(updatedPayload);
  const updatedSignature = createHmac(
    "sha256",
    "e2e-open-door-secret-at-least-24-characters"
  )
    .update(updatedBody)
    .digest("hex");
  const update = await request.post("/api/webhooks/open-door", {
    data: updatedBody,
    headers: {
      ...headers,
      "x-open-door-signature": `sha256=${updatedSignature}`
    }
  });
  expect(update.status()).toBe(200);
  expect((await update.json()).updated).toBe(true);

  const venuesResponse = await request.get("/api/venues");
  const venuesBody = (await venuesResponse.json()) as {
    venues: Array<{ id: string; name: { ja: string } }>;
  };
  const matching = venuesBody.venues.filter((venue) => venue.id === card.id);
  expect(matching).toHaveLength(1);
  expect(matching[0].name.ja).toBe("E2E 更新済み施設");
});

test("管理画面は手動インポートと失敗ログ再送を提供する", async ({ page }) => {
  await page.goto("/admin");
  await expect(
    page.getByRole("heading", { name: "OPEN DOOR TOKYO 取り込み管理" })
  ).toBeVisible();
  await expect(
    page.getByRole("button", { name: "JSONを検証して取り込む" })
  ).toBeVisible();
  await expect(page.getByRole("heading", { name: "未解決の失敗ログ" })).toBeVisible();
});
