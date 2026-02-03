import { Page } from '@playwright/test'

export async function waitForPageLoad(page: Page) {
  await page.waitForLoadState('networkidle')
}

export async function waitForFeatureLoad(page: Page, featureName: string) {
  await page.waitForSelector(`[data-feature="${featureName}"]`, {
    state: 'visible',
    timeout: 10000,
  })
}
