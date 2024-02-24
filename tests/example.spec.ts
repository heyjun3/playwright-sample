import { test, chromium } from '@playwright/test';
import querystring from 'node:querystring'

test('wizard', async () => {
  const baseURL = process.env.URL as string
  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
  })
  await context.addCookies([{ name: 's', url: baseURL, value: process.env.COOKIE as string }])
  const page = await context.newPage()
  for (let i = 10; i < 100; i++) {
    const query = {
      page: i,
      paging_order: 2,
    }
    await page.goto(new URL(`${baseURL}?${querystring.stringify(query)}`).toString());
    const links = page.locator('.link-area.needsclick.append-anchor')
    const count = await links.count()
    const url: string[] = []
    for (let j = 0; j < count; j++) {
      const path = await links.nth(j).getAttribute('href')
      if (path == null) {
        continue
      }
      url.push(new URL(path, baseURL).toString())
    }
    console.warn(url.length)
    for (const u of url) {
      await page.goto(u)
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 3000)))
    }
  }
});
