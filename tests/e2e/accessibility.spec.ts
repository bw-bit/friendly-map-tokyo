import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test("公開地図に重大・深刻な自動検出アクセシビリティ違反がない", async ({
  page
}) => {
  await page.goto("/");
  await page.getByTestId("venue-map").waitFor({ state: "visible" });
  const results = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  const blocking = results.violations.filter(
    (violation) =>
      violation.impact === "critical" || violation.impact === "serious"
  );
  expect(blocking).toEqual([]);
});

