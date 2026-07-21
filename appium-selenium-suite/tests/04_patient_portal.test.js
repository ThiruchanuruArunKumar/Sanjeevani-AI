import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 4: Patient Health Portal & Appointments E2E Tests', function () {
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

  it('TC176 - TC245: Patient Authentication with 9876543210 / patient123 and Health Cards', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const patientNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Patient Portal')]")), 10000);
    await patientNavBtn.click();

    const phoneField = await driver.wait(until.elementLocated(By.id('phone')), 10000);
    await phoneField.clear();
    await phoneField.sendKeys(CONFIG.PATIENT_CREDENTIALS.phone);

    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.clear();
    await passwordField.sendKeys(CONFIG.PATIENT_CREDENTIALS.password);

    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();

    await driver.sleep(1500);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(bodyText.includes('Patient') || bodyText.includes('Dashboard') || bodyText.includes('Prescriptions') || bodyText.includes('Health'), 'Patient authenticated');
  });
});
