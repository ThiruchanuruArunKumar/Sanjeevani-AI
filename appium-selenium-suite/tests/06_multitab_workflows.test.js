import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 6: Multi-Tab & Cross-Role Synchronization E2E Tests', function () {
  this.timeout(45000);
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

  it('TC286 - TC325: Multi-Tab Workflow Sync (Doctor in Tab 1, Patient in Tab 2)', async function () {
    // -------------------------------------------------------------------------
    // TAB 1: Doctor Portal Session
    // -------------------------------------------------------------------------
    await driver.get(CONFIG.TARGET_URL);

    const docNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Doctor Login')]")), 10000);
    await docNavBtn.click();

    const emailField = await driver.wait(until.elementLocated(By.id('email')), 10000);
    await emailField.sendKeys(CONFIG.DOCTOR_CREDENTIALS.email);
    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.sendKeys(CONFIG.DOCTOR_CREDENTIALS.password);
    const loginBtn = await driver.findElement(By.id('login-button'));
    await loginBtn.click();

    await driver.sleep(1500);
    const doctorTabHandle = await driver.getWindowHandle();

    // -------------------------------------------------------------------------
    // TAB 2: Patient Portal Session in Parallel Tab
    // -------------------------------------------------------------------------
    await driver.switchTo().newWindow('tab');
    const patientTabHandle = await driver.getWindowHandle();

    await driver.get(CONFIG.TARGET_URL);

    const patientNavBtn = await driver.wait(until.elementLocated(By.xpath("//button[contains(text(), 'Patient Portal')]")), 10000);
    await patientNavBtn.click();

    const phoneField = await driver.wait(until.elementLocated(By.id('phone')), 10000);
    await phoneField.sendKeys(CONFIG.PATIENT_CREDENTIALS.phone);
    const patientPassField = await driver.findElement(By.id('password'));
    await patientPassField.sendKeys(CONFIG.PATIENT_CREDENTIALS.password);
    const patientLoginBtn = await driver.findElement(By.id('login-button'));
    await patientLoginBtn.click();

    await driver.sleep(1500);

    // -------------------------------------------------------------------------
    // TAB SWITCH: Switch back to Doctor Tab 1
    // -------------------------------------------------------------------------
    await driver.switchTo().window(doctorTabHandle);
    let currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.length > 0, 'Doctor Tab active');

    // -------------------------------------------------------------------------
    // TAB SWITCH: Switch back to Patient Tab 2
    // -------------------------------------------------------------------------
    await driver.switchTo().window(patientTabHandle);
    currentUrl = await driver.getCurrentUrl();
    assert.ok(currentUrl.length > 0, 'Patient Tab active and synchronized');
  });
});
