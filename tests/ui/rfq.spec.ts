import { test, expect } from '@playwright/test';
import { HomePage } from '../pages/HomePage';
import { RfqPage } from '../pages/RfqPage';
import { datosBaseValidos, combinacionesValidas, casosInvalidos } from '../data/rfq-test-data';

const MENSAJE_CONFIRMACION = 'Thank you for your request! We will contact you within 24 hours.';

test.describe('Formulario RFQ', () => {
  let rfqPage: RfqPage;

  test.beforeEach(async ({ page }) => {
    const homePage = new HomePage(page);
    rfqPage = new RfqPage(page);

    await homePage.goto('/');
    await homePage.goToRfqForm();
  });

  test('envía el formulario con datos válidos (happy path) @smoke @sanity @regression', async () => {
    await rfqPage.fillForm(datosBaseValidos);

    const mensaje = await rfqPage.submitAndGetConfirmationMessage();

    expect(mensaje).toBe(MENSAJE_CONFIRMACION);
  });

  combinacionesValidas.forEach((data, index) => {
    test(`envía el formulario con combinación válida #${index + 1} @sanity @regression`, async () => {
      await rfqPage.fillForm(data);

      const mensaje = await rfqPage.submitAndGetConfirmationMessage();

      expect(mensaje).toBe(MENSAJE_CONFIRMACION);
    });
  });

  for (const [index, caso] of casosInvalidos.entries()) {
    test(`bloquea el envío si "${caso.campo}" es inválido (caso ${index + 1}) @regression`, async () => {
      await rfqPage.fillForm(caso.data);
      await rfqPage.submit();

      expect(await rfqPage.isFieldInvalid(caso.campo)).toBe(true);
    });
  }
});
