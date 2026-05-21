import { expect, test } from "@playwright/test";

test.describe("navegacion publica", () => {
  test("muestra la pagina inicial con accesos principales", async ({ page }) => {
    await page.goto("/");

    await expect(page).toHaveTitle(/Andina de Alimentos/);
    await expect(
      page.getByRole("heading", {
        name: "Pedidos para vendedores de congelados",
      }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: /Iniciar sesion/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Panel de pedidos/ })).toBeVisible();
    await expect(page.getByRole("link", { name: /Gestion comercial/ })).toBeVisible();
  });

  test("permite navegar desde inicio hacia login", async ({ page }) => {
    await page.goto("/");

    await page.getByRole("link", { name: /Iniciar sesion/ }).click();

    await expect(page).toHaveURL(/\/login$/);
    await expect(
      page.getByRole("heading", { name: "Iniciar sesion" }),
    ).toBeVisible();
  });

  test("muestra el formulario de login", async ({ page }) => {
    await page.goto("/login");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible();
  });
});
