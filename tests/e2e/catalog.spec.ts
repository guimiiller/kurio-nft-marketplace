import { expect, test } from "@playwright/test";

test.describe("Catálogo de NFTs", () => {
  test("deve carregar a página inicial", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/kurio/i);

    await expect(page.getByText("Emerald Ape #042").first()).toBeVisible();
  });

  test("deve abrir os detalhes de um NFT", async ({ page }) => {
    await page.goto("/nft/1");

    await expect(
      page.getByRole("heading", {
        name: "Emerald Ape #042",
      }),
    ).toBeVisible();

    await expect(page.getByText("Unidades disponíveis:")).toBeVisible();
  });

  test("não deve apresentar rolagem horizontal", async ({ page }) => {
    await page.goto("/nft/1");

    await expect(
      page.getByRole("heading", {
        name: "Emerald Ape #042",
      }),
    ).toBeVisible();

    const hasHorizontalOverflow = await page.evaluate(() => {
      return (
        document.documentElement.scrollWidth >
        document.documentElement.clientWidth
      );
    });

    expect(hasHorizontalOverflow).toBe(false);
  });
});
