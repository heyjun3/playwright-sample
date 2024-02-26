import { test, chromium, errors }from '@playwright/test';
import { error } from 'node:console';
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
    const url = new URL(`${baseURL}?${querystring.stringify(query)}`).toString()
    try {
      await page.goto(url, { timeout: 10 * 1000});
    } catch (err) {
      if (err instanceof errors.TimeoutError) {
        log("time out err", url)
        continue
      }
    }
    const links = page.locator('.link-area.needsclick.append-anchor')
    const count = await links.count()
    if (count <= 0) {
      throw new Error("failed open list page")
    }
    const details: string[] = []
    for (let j = 0; j < count; j++) {
      const path = await links.nth(j).getAttribute('href')
      if (path == null) {
        continue
      }
      details.push(new URL(path, baseURL).toString())
    }
    log("url length", details.length)
    for (const u of details) {
      log("request url", u)
      try {
        await page.goto(u, { timeout: 4 * 1000 })
      } catch (err) {
        if (err instanceof errors.TimeoutError){
          log("time out error", u)
          continue
        }
        throw err
      }
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 3000)))
    }
  }
});

function log(...msg: any[]) {
  console.warn(new Date(), ...msg)
}
