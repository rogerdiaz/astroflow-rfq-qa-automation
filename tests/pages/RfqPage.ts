import { expect, Locator, Page } from '@playwright/test';
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
    const checkbox = this.page.getByRole('checkbox', { name: SERVICE_LABELS[service] });
    await checkbox.click();
    await expect(checkbox).toHaveAttribute('aria-checked', 'true');
  }

  async submit() {
    await this.page.getByRole('button', { name: 'Submit Request' }).click();
  }

  /**
   * A successful submit triggers a native browser window.alert()
   * ("Thank you for your request!..."), not a DOM element.
   * Playwright auto-dismisses dialogs unless a listener is registered,
   * so the handler must be set up before clicking.
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
   * Fields rely on native HTML5 validation (required / type="email"),
   * there's no custom error UI in the DOM. The text comes from
   * `validationMessage`, which depends on the browser engine.
   */
  async getFieldValidationMessage(fieldId: string): Promise<string> {
    return this.page
      .locator(`#${fieldId}`)
      .evaluate((el: HTMLInputElement) => el.validationMessage);
  }

  async isFieldInvalid(fieldId: string): Promise<boolean> {
    return this.page.locator(`#${fieldId}`).evaluate((el: HTMLInputElement) => !el.validity.valid);
  }

  /**
   * Exposes the locators of every form field so the test can verify their
   * visibility with soft assertions (this isn't page logic itself, which is
   * why it doesn't include any assertion here).
   */
  getFormFieldLocators(): Record<string, Locator> {
    const serviceLocators = Object.fromEntries(
      Object.entries(SERVICE_LABELS).map(([service, label]) => [
        `service:${service}`,
        this.page.getByRole('checkbox', { name: label }),
      ]),
    );

    return {
      firstName: this.page.locator(this.firstNameInput),
      lastName: this.page.locator(this.lastNameInput),
      email: this.page.locator(this.emailInput),
      phone: this.page.locator(this.phoneInput),
      company: this.page.locator(this.companyInput),
      industry: this.page.locator(this.industrySelect),
      timeline: this.page.locator(this.timelineSelect),
      volume: this.page.locator(this.volumeInput),
      details: this.page.locator(this.detailsTextarea),
      submitButton: this.page.getByRole('button', { name: 'Submit Request' }),
      ...serviceLocators,
    };
  }
}
