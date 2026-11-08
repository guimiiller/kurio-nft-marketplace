import { expect, test, type Page } from "@playwright/test";

const TEST_PASSWORD = "KurioTeste123!";
const TEST_WALLET = `0x${"a".repeat(40)}`;

async function createCollector(page: Page) {
  const uniqueId = crypto.randomUUID().replaceAll("-", "").slice(0, 12);

  await page.goto("/signup");

  await expect(
    page.getByRole("heading", { name: "Crie sua conta" }),
  ).toBeVisible();

  await page.locator("#auth-name").fill("Colecionador E2E");
  await page.locator("#auth-username").fill(`buyer${uniqueId}`);
  await page.locator("#auth-email").fill(`buyer-${uniqueId}@example.com`);
  await page.locator("#auth-password").fill(TEST_PASSWORD);

  await page.getByRole("button", { name: "Criar conta" }).click();

  await expect(page).toHaveURL(/^http:\/\/127\.0\.0\.1:5173\/(?:\?.*)?$/);
}

async function addNFTToCart(page: Page) {
  await page.goto("/nft/1");

  await expect(
    page.getByRole("heading", { name: "Emerald Ape #042" }),
  ).toBeVisible();

  await page.getByRole("button", { name: "Comprar NFT" }).click();

  await expect(page).toHaveURL(/\/cart(?:\?.*)?$/);

  await expect(
    page.getByRole("region", { name: "Itens do carrinho" }),
  ).toContainText("Emerald Ape #042");
}

test.describe("Compra de NFTs", () => {
  test("deve adicionar um NFT ao carrinho", async ({ page }) => {
    await createCollector(page);
    await addNFTToCart(page);

    await expect(
      page.getByRole("heading", { name: "Resumo da carteira" }),
    ).toBeVisible();

    await expect(
      page.getByRole("link", { name: "Conectar e finalizar" }),
    ).toBeVisible();
  });

  test("deve aplicar cupom e finalizar um pedido", async ({ page }) => {
    await createCollector(page);
    await addNFTToCart(page);

    await page.getByRole("link", { name: "Conectar e finalizar" }).click();

    await expect(page).toHaveURL(/\/checkout(?:\?.*)?$/);

    await expect(
      page.getByRole("heading", { name: "Finalizar compra" }),
    ).toBeVisible();

    const confirmButton = page.getByRole("button", {
      name: "Confirmar pedido",
    });

    // Aguarda a cotação inicial calculada pela API mock.
    await expect(confirmButton).toBeEnabled();

    await page.locator("#coupon").fill("kurio10");

    await page.getByRole("button", { name: "Aplicar" }).click();

    await expect(page.getByText("Cupom KURIO10 aplicado.")).toBeVisible();

    await page
      .getByRole("main")
      .getByRole("textbox", { name: "Nome completo" })
      .fill("Colecionador E2E");

    await page
      .getByRole("main")
      .getByRole("textbox", { name: "E-mail" })
      .fill("buyer@example.com");

    await page.getByRole("radio", { name: "MetaMask" }).check();

    await page.getByPlaceholder("0x...").fill(TEST_WALLET);

    await expect(confirmButton).toBeEnabled();

    await confirmButton.click();

    await expect(page).toHaveURL(/\/orders\/[^/?]+/);
  });
});
