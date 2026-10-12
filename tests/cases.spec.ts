import { test, expect, Page, Locator } from '@playwright/test';

// Page Object (move to pages/LoginPage.ts in your project)
class LoginPage {
  readonly page: Page;
  readonly username: Locator;
  readonly password: Locator;
  readonly loginButton: Locator;
  readonly error: Locator;

  constructor(page: Page) {
    this.page = page;
    this.username = page.locator('[data-test="username"]');
    this.password = page.locator('[data-test="password"]');
    this.loginButton = page.locator('[data-test="login-button"]');
    this.error = page.locator('[data-test="error"]');
  }

  async goto() {
    await this.page.goto('https://www.saucedemo.com/');
  }

  async login(user: string, pass: string) {
    await this.username.fill(user);
    await this.password.fill(pass);
    await this.loginButton.click();
  }
}

const PASSWORD = 'secret_sauce';

test.describe('SauceDemo - Login', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.goto();
  });

  test('TC01 valid user can login', async ({ page }) => {
    await loginPage.login('standard_user', PASSWORD);
    await expect(page).toHaveURL(/inventory\.html/);
    await expect(page.locator('[data-test="title"]')).toHaveText('Products');
  });

  test('TC02 locked out user cannot login', async () => {
    await loginPage.login('locked_out_user', PASSWORD);
    await expect(loginPage.error).toContainText('Sorry, this user has been locked out.');
  });

  test('TC03 invalid username shows error', async () => {
    await loginPage.login('invalid_user', PASSWORD);
    await expect(loginPage.error).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('TC04 invalid password shows error', async () => {
    await loginPage.login('standard_user', 'wrong_pass');
    await expect(loginPage.error).toContainText(
      'Username and password do not match any user in this service'
    );
  });

  test('TC05 empty username and password shows error', async () => {
    await loginPage.loginButton.click();
    await expect(loginPage.error).toContainText('Username is required');
  });

  test('TC06 user can logout after login', async ({ page }) => {
    await loginPage.login('standard_user', PASSWORD);
    await page.locator('#react-burger-menu-btn').click();
    await page.locator('#logout_sidebar_link').click();
    await expect(page).toHaveURL('/');
    await expect(loginPage.username).toBeEmpty();
  });
});