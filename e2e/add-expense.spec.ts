import { test, expect } from '@playwright/test'

test('user can navigate to Add Expense and submit a valid expense', async ({ page }) => {
  await page.goto('/expenses/new')

  await expect(page.getByRole('heading', { name: /add expense/i })).toBeVisible()

  // Type digits directly into the native date input (MMDDYYYY) — the
  // browser auto-advances between segments. Real keystrokes behave
  // consistently across engines, unlike .fill() on type="date".
  await page.locator('#expense-date').click()
  await page.keyboard.type('08152026')

  await page.getByLabel(/category/i).selectOption('Groceries')
  await page.getByLabel(/amount/i).fill('450')
  await page.getByLabel(/description/i).fill('Weekly shop')

  await page.getByRole('button', { name: /add expense/i }).click()

  await expect(page.getByLabel(/amount/i)).toHaveValue('', { timeout: 10000 })
})

test('shows validation errors when submitted empty', async ({ page }) => {
  await page.goto('/expenses/new')

  await page.getByRole('button', { name: /add expense/i }).click()

  await expect(page.getByText(/date is required/i)).toBeVisible()
  await expect(page.getByText(/category is required/i)).toBeVisible()
  await expect(page.getByText(/amount is required/i)).toBeVisible()
})