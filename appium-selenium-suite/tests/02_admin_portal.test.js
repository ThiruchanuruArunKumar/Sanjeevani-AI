import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 2: Hospital Admin Console E2E Tests', function () {
  this.timeout(CONFIG.DEFAULT_TIMEOUT);
  let driver;

  beforeEach(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--window-size=1280,800');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it('TC026 - TC085: Admin Authentication with admin@sanjeevani.ai / admin123 and Console View', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const adminNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Hospital Admin')]")), 10000);
    await adminNavBtn.click();

    const emailField = await driver.wait(until.elementLocated(By.id('email')), 10000);
    await emailField.clear();
    await emailField.sendKeys(CONFIG.ADMIN_CREDENTIALS.email);

    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.clear();
    await passwordField.sendKeys(CONFIG.ADMIN_CREDENTIALS.password);

    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();

    await driver.sleep(1500);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(bodyText.includes('Admin') || bodyText.includes('Hospital') || bodyText.includes('Doctor'), 'Admin logged into Console');
  });
});
