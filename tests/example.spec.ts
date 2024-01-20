import { test, expect, chromium } from '@playwright/test';

test('has title', async () => {
  const baseURL = process.env.URL
  const browser = await chromium.launch()
  const context = await browser.newContext()
  await context.addCookies([{name: 's', url: baseURL,  value: process.env.COOKIE as string}])
  const page = await context.newPage()

  await page.goto(new URL('search', baseURL).toString());
});

test('get started link', async ({ page }) => {
  await page.goto('https://playwright.dev/');

  // Click the get started link.
  await page.getByRole('link', { name: 'Get started' }).click();

  // Expects page to have a heading with the name of Installation.
  await expect(page.getByRole('heading', { name: 'Installation' })).toBeVisible();
});
