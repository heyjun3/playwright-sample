import { test, chromium } from '@playwright/test';
import querystring from 'node:querystring'

test('wizard', async () => {
  const baseURL = process.env.URL as string
  const browser = await chromium.launch()
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:109.0) Gecko/20100101 Firefox/109.0'
  })
  await context.addCookies([{ name: 's', url: baseURL, value: process.env.COOKIE ?? "" }])
  const page = await context.newPage()
  for (let i = 0; i < 50; i++) {
    const query = {
      page: i,
      paging_order: 2,
    }
    log("run page", query)
    await page.goto(new URL(`${baseURL}?${querystring.stringify(query)}`).toString());
    const links = page.locator('.link-area.needsclick.append-anchor')
    const count = await links.count()
    if (count <= 0) {
      throw new Error("failed open list page")
    }
    const url: string[] = []
    for (let j = 0; j < count; j++) {
      const path = await links.nth(j).getAttribute('href')
      if (path == null) {
        continue
      }
      url.push(new URL(path, baseURL).toString())
    }
    log("url length", url.length)
    for (const u of url) {
      log("request url", u)
      await page.goto(u, { timeout: 3 * 1000 })
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 3000)))
    }
  }
});

function log(...msg: any[]) {
  console.warn(new Date(), ...msg)
}
