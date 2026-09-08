import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RfqPage } from '../pages/RfqPage';
import { baseValidData, validCombinations, invalidCases } from '../data/rfq-test-data';

const CONFIRMATION_MESSAGE = 'Thank you for your request! We will contact you within 24 hours.';

test.describe('RFQ Form', () => {
  let rfqPage: RfqPage;

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    rfqPage = new RfqPage(page);

    await homePage.goto('/');
    await homePage.goToRfqForm();
  });

  test('shows all expected form fields @sanity @regression', async () => {
    const fields = rfqPage.getFormFieldLocators();

    for (const [name, locator] of Object.entries(fields)) {
      await expect.soft(locator, `field "${name}" should be visible`).toBeVisible();
    }
  });

  test('submits the form with valid data (happy path) @smoke @sanity @regression', async () => {
    await rfqPage.fillForm(baseValidData);

    const message = await rfqPage.submitAndGetConfirmationMessage();

    expect(message).toBe(CONFIRMATION_MESSAGE);
  });

  validCombinations.forEach((data, index) => {
    test(`submits the form with valid combination #${index + 1} @sanity @regression`, async () => {
      await rfqPage.fillForm(data);

      const message = await rfqPage.submitAndGetConfirmationMessage();

      expect(message).toBe(CONFIRMATION_MESSAGE);
    });
  });

  for (const [index, invalidCase] of invalidCases.entries()) {
    test(`blocks submission when "${invalidCase.field}" is invalid (case ${index + 1}) @regression`, async () => {
      await rfqPage.fillForm(invalidCase.data);
      await rfqPage.submit();

      expect(await rfqPage.isFieldInvalid(invalidCase.field)).toBe(true);
    });
  }
});
