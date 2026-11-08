import { expect, test } from "@playwright/test";

test.describe("Autenticação", () => {
  test("deve solicitar login ao acessar o carrinho sem autenticação", async ({
    page,
  }) => {
    await page.goto("/cart");

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu carrinho",
      }),
    ).toBeVisible();

    await page.getByRole("main").getByRole("link", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/login/);

    await expect(
      page.getByRole("heading", {
        name: "Bem-vindo de volta",
      }),
    ).toBeVisible();
  });

  test("deve cadastrar um colecionador e permitir login", async ({ page }) => {
    const uniqueId = crypto.randomUUID().replaceAll("-", "").slice(0, 12);
    const email = `collector-${uniqueId}@example.com`;
    const password = "KurioTeste123!";

    await page.goto("/signup");

    await expect(
      page.getByRole("heading", { name: "Crie sua conta" }),
    ).toBeVisible();

    await page.locator("#auth-name").fill("Colecionador Teste");
    await page.locator("#auth-username").fill(`collector${uniqueId}`);
    await page.locator("#auth-email").fill(email);
    await page.locator("#auth-password").fill(password);

    await page.getByRole("button", { name: "Criar conta" }).click();

    await expect(page).toHaveURL(/\/\?(?:.*)?|\/$/);

    await page.goto("/cart");

    await expect(
      page.getByRole("heading", { name: "Carrinho de NFTs" }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu carrinho",
      }),
    ).toHaveCount(0);

    // Remove apenas a sessão ativa; preserva o cadastro no mock.
    await page.evaluate(() => {
      sessionStorage.removeItem("kurio:auth:session");
    });

    await page.goto("/login");

    await page.locator("#auth-email").fill(email);
    await page.locator("#auth-password").fill(password);

    await page.getByRole("button", { name: "Entrar" }).click();

    await expect(page).toHaveURL(/\/\?(?:.*)?|\/$/);

    await page.goto("/cart");

    await expect(
      page.getByRole("heading", {
        name: "Entre para acessar seu carrinho",
      }),
    ).toHaveCount(0);
  });

  test("deve permitir alternar a visibilidade da senha", async ({ page }) => {
    await page.goto("/login");

    const passwordInput = page.locator("#auth-password");

    await expect(passwordInput).toHaveAttribute("type", "password");

    await page.getByRole("button", { name: "Mostrar senha" }).click();

    await expect(passwordInput).toHaveAttribute("type", "text");

    await page.getByRole("button", { name: "Ocultar senha" }).click();

    await expect(passwordInput).toHaveAttribute("type", "password");
  });
});
