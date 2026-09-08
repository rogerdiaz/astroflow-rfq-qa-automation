import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
  private readonly rfqLink = this.page
    .getByRole('link', { name: 'Request a Quote', exact: true })
    .first();

  constructor(page: Page) {
    super(page);
  }

  async goToRfqForm() {
    await this.rfqLink.click();
    await this.waitForPageLoad();
  }
}
