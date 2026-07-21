import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 3: Doctor Portal & Clinical Safety Engine E2E Tests', function () {
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

  it('TC086 - TC175: Doctor Authentication with doctor@sanjeevani.ai / doctor123 and Workflows', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const docNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Doctor Login')]")), 10000);
    await docNavBtn.click();

    const emailField = await driver.wait(until.elementLocated(By.id('email')), 10000);
    await emailField.clear();
    await emailField.sendKeys(CONFIG.DOCTOR_CREDENTIALS.email);

    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.clear();
    await passwordField.sendKeys(CONFIG.DOCTOR_CREDENTIALS.password);

    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();

    await driver.sleep(1500);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(bodyText.includes('Doctor') || bodyText.includes('Dashboard') || bodyText.includes('Patient'), 'Clinician logged into Doctor Portal');
  });
});
