import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export type RfqIndustry =
  | 'ecommerce'
  | 'healthcare'
  | 'automotive'
  | 'technology'
  | 'consumer-goods'
  | 'food-beverage'
  | 'other';

export type RfqService =
  | 'warehousing'
  | 'manufacturing'
  | 'transportation'
  | 'supply-chain'
  | 'value-added'
  | 'technology';

export type RfqTimeline = 'immediate' | '1-3-months' | '3-6-months' | '6-plus-months' | 'flexible';

export interface RfqFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  industry: RfqIndustry;
  services: RfqService[];
  timeline: RfqTimeline;
  volume?: string;
  details: string;
}

const SERVICE_LABELS: Record<RfqService, string> = {
  warehousing: 'Warehousing & Storage',
  manufacturing: 'Manufacturing Services',
  transportation: 'Transportation & Distribution',
  'supply-chain': 'Supply Chain Management',
  'value-added': 'Value-Added Services',
  technology: 'Technology Integration',
};

export class RfqPage extends BasePage {
  private readonly firstNameInput = '#firstName';
  private readonly lastNameInput = '#lastName';
  private readonly emailInput = '#email';
  private readonly phoneInput = '#phone';
  private readonly companyInput = '#company';
  private readonly industrySelect = '#industry';
  private readonly timelineSelect = '#timeline';
  private readonly volumeInput = '#volume';
  private readonly detailsTextarea = '#details';

  constructor(page: Page) {
    super(page);
  }

  async fillForm(data: Partial<RfqFormData>) {
    if (data.firstName !== undefined)
      await this.page.locator(this.firstNameInput).fill(data.firstName);
    if (data.lastName !== undefined)
      await this.page.locator(this.lastNameInput).fill(data.lastName);
    if (data.email !== undefined) await this.page.locator(this.emailInput).fill(data.email);
    if (data.phone !== undefined) await this.page.locator(this.phoneInput).fill(data.phone);
    if (data.company !== undefined) await this.page.locator(this.companyInput).fill(data.company);
    if (data.industry !== undefined)
      await this.page.locator(this.industrySelect).selectOption(data.industry);
    if (data.services !== undefined) {
      for (const service of data.services) {
        await this.checkService(service);
      }
    }
    if (data.timeline !== undefined)
      await this.page.locator(this.timelineSelect).selectOption(data.timeline);
    if (data.volume !== undefined) await this.page.locator(this.volumeInput).fill(data.volume);
    if (data.details !== undefined)
      await this.page.locator(this.detailsTextarea).fill(data.details);
  }

  async checkService(service: RfqService) {
    await this.page.getByRole('checkbox', { name: SERVICE_LABELS[service] }).check();
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Submit Request' }).click();
  }

  /**
   * El submit exitoso dispara un window.alert() nativo del navegador
   * ("Thank you for your request!..."), no un elemento del DOM.
   * Playwright descarta los dialogs automáticamente si no hay listener,
   * por eso hay que registrar el handler antes de hacer click.
   */
  async submitAndGetConfirmationMessage(): Promise<string> {
    const dialogMessage = new Promise<string>((resolve) => {
      this.page.once('dialog', async (dialog) => {
        resolve(dialog.message());
        await dialog.accept();
      });
    });
    await this.submit();
    return dialogMessage;
  }

  /**
   * Los campos usan validación nativa HTML5 (required / type="email"),
   * no hay mensajes de error custom en el DOM. El texto viene de
   * `validationMessage`, que depende del motor del navegador.
   */
  async getFieldValidationMessage(fieldId: string): Promise<string> {
    return this.page
      .locator(`#${fieldId}`)
      .evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  async isFieldInvalid(fieldId: string): Promise<boolean> {
    return this.page.locator(`#${fieldId}`).evaluate((el: HTMLInputElement) => !el.validity.valid);
  }
}
