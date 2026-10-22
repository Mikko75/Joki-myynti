import { test, expect } from '@playwright/test'

const BASE = 'http://localhost:5173'
const WO = `${BASE}/tyomarain/wo-1`

// wo-1 source = 'web' → CTA on "Lähetä asiakkaalle"
const CTA_BTN = 'Lähetä asiakkaalle'
const CTA_STATUS = 'Ei vielä lähetetty asiakkaalle'

// Helper: klikkaa modalin "Lisää ehdotukseen" (viimeinen matchaava — modal-nappi eikä section-+ nappi)
const clickModalAdd = (page: import('@playwright/test').Page) =>
  page.getByText('Lisää ehdotukseen').last().click()

// ── FLOW 1: Kanban ──────────────────────────────────────────────────────────
test('1.1 Kanban näyttää työmääräimet', async ({ page }) => {
  await page.goto(BASE)
  await expect(page.locator('text=Esimerkkiyritys Oy').first()).toBeVisible()
  await expect(page.locator('text=Työn alla').first()).toBeVisible()
})

// ── FLOW 2: Yleiskuva ───────────────────────────────────────────────────────
test('1.2 Yleiskuva: perustiedot-CTA näkyy', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await expect(page.locator(`text=${CTA_STATUS}`).first()).toBeVisible()
  await expect(page.getByRole('button', { name: CTA_BTN }).first()).toBeVisible()
})

test('1.2b Tilat-kortissa thumbnail-kuva', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await expect(page.locator('img').first()).toBeVisible()
})

// ── FLOW 3: Compose-modali ──────────────────────────────────────────────────
test('1.3 Compose-modali avautuu', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.getByRole('button', { name: CTA_BTN }).first().click()
  await expect(page.locator('textarea').first()).toBeVisible()
  await expect(page.locator('text=Lisää ehdotukseen').last()).toBeVisible()
})

test('1.3b Lisää ehdotukseen → sidebar näyttää luonnoksen', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.getByRole('button', { name: CTA_BTN }).first().click()
  await clickModalAdd(page)
  await expect(page.locator('text=Tapahtumavahvistus').first()).toBeVisible()
  await expect(page.locator('text=Luonnos').first()).toBeVisible()
})

// ── FLOW 4: Lähetys sidebarista ─────────────────────────────────────────────
test('1.4 Lähetys sidebarista toimii', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.getByRole('button', { name: CTA_BTN }).first().click()
  await clickModalAdd(page)
  await page.getByRole('button', { name: 'Lähetä ehdotus' }).click()
  await expect(page.locator('text=lähetetty').first()).toBeVisible({ timeout: 5000 })
})

// Navigoi SPA:n sisällä ilman sivulatausta (säilyttää React-tilan)
const spaNavigate = async (page: import('@playwright/test').Page, path: string) => {
  await page.evaluate((p) => window.history.pushState({}, '', p), path)
  await page.waitForTimeout(200)
}

// ── FLOW 5: Asiakasportaali ──────────────────────────────────────────────────
test('2.1 Asiakas näkee tapahtumavahvistuksen', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.getByRole('button', { name: CTA_BTN }).first().click()
  await clickModalAdd(page)
  await page.getByRole('button', { name: 'Lähetä ehdotus' }).click()
  await page.waitForTimeout(300)

  // Navigoi asiakas-moodiin käyttämällä React Router -linkkiä (säilyttää tilan)
  await page.locator('text=Asiakas').first().click()
  await page.waitForTimeout(300)
  // Klikkaa "Ehdotukset" sivupalkin navigaatiossa
  await page.locator('text=Ehdotukset').first().click()
  await page.waitForTimeout(500)

  await expect(page.locator('text=Tapahtumavahvistus').first()).toBeVisible({ timeout: 5000 })
  await expect(page.locator('text=Odottaa vastausta').first()).toBeVisible()
})

// ── FLOW 6: Lukuvastaanotto ──────────────────────────────────────────────────
test('2.2 Lukuvastaanotto — avattu näkyy myyjälle', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.getByRole('button', { name: CTA_BTN }).first().click()
  await clickModalAdd(page)
  await page.getByRole('button', { name: 'Lähetä ehdotus' }).click()
  await page.waitForTimeout(300)

  // Asiakas avaa ehdotuksen (merkitsee luetuksi)
  await spaNavigate(page, '/tyomarain/wo-1/ehdotus')
  await page.waitForTimeout(500)

  // Myyjä näkee "Avattu"
  await spaNavigate(page, '/tyomarain/wo-1/yleiskuva')
  await expect(page.locator('text=Avattu').first()).toBeVisible({ timeout: 5000 })
})

// ── FLOW 7: Proposal-osiot ───────────────────────────────────────────────────
test('3.1 Tilat-osio sidebariin + lähetä enabled', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  await page.locator('button[title="Lisää ehdotukseen"]').first().click()
  await expect(page.locator('text=Luonnos').first()).toBeVisible()
  await expect(page.getByRole('button', { name: 'Lähetä ehdotus' })).toBeEnabled()
})

// ── FLOW 8: Osiosivut ────────────────────────────────────────────────────────
test('YLEINEN: Tilat-sivu aukeaa', async ({ page }) => {
  await page.goto(`${WO}/tilat`)
  await expect(page.locator('text=Cave-teatteri').first()).toBeVisible()
})

test('YLEINEN: Aikataulu-sivu aukeaa', async ({ page }) => {
  await page.goto(`${WO}/aikataulu`)
  await expect(page.locator('h1, h2, h3').first()).toBeVisible()
})

test('YLEINEN: Perustiedot-sivu aukeaa', async ({ page }) => {
  await page.goto(`${WO}/perustiedot`)
  await expect(page.locator('text=Asiakas').first()).toBeVisible()
})

// ── FLOW 9: Console-virheet ──────────────────────────────────────────────────
test('YLEINEN: Ei console-virheitä yleiskuvalla', async ({ page }) => {
  const errors: string[] = []
  page.on('console', msg => {
    if (msg.type() === 'error') errors.push(msg.text())
  })
  await page.goto(`${WO}/yleiskuva`)
  await page.waitForTimeout(1000)
  const realErrors = errors.filter(e => !e.includes('favicon') && !e.includes('404'))
  expect(realErrors).toHaveLength(0)
})

// ── FLOW 10: Kalenteri ───────────────────────────────────────────────────────
test('YLEINEN: Kalenteri aukeaa', async ({ page }) => {
  await page.goto(`${BASE}/kalenteri`)
  // Kalenterissa pitää olla jokin kuukausi näkyvissä
  await expect(page.locator('h1, h2, [class*="calendar"]').first()).toBeVisible({ timeout: 5000 })
})

// ── FLOW 11: Muistiinpanot suorina ───────────────────────────────────────────
test('YLEINEN: Post-it kortit ovat suoria (ei rotaatiota)', async ({ page }) => {
  await page.goto(`${WO}/yleiskuva`)
  // Tarkista että transform:rotate ei ole asetettu post-it korteille
  const postItCards = page.locator('[style*="rotate"]')
  await expect(postItCards).toHaveCount(0)
})
