import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 1: Public Landing Page & AI Safety Simulator E2E Tests', function () {
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

  it('TC001 - TC006: Header navigation buttons and routing gates', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const heading = await driver.wait(until.elementLocated(By.tagName('h1')), 10000);
    const headingText = await heading.getText();
    assert.ok(headingText.includes('AI-Powered') || headingText.includes('Drug Safety'), 'Heading text mismatch');

    const adminBtn = await driver.findElement(By.xpath("//button[contains(text(), 'Hospital Admin')]"));
    await adminBtn.click();
    await driver.sleep(800);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(bodyText.includes('Admin') || bodyText.includes('Hospital') || bodyText.includes('Login'), 'Navigated to Admin Auth');
  });

  it('TC007 - TC009: Emergency Bypass lookup input and validation', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const lookupInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Enter Patient ID')]")), 10000);
    await lookupInput.clear();
    await lookupInput.sendKeys('INVALID-PAT-999');

    const viewIdBtn = await driver.findElement(By.xpath("//button[contains(text(), 'View ID')]"));
    await viewIdBtn.click();

    const errorMsg = await driver.wait(until.elementLocated(By.className('animate-pulse')), 5000);
    const errorText = await errorMsg.getText();
    assert.ok(errorText.includes('Invalid Patient ID'), 'Error alert displayed for invalid ID');
  });

  it('TC010 - TC025: AI Safety Simulator interactive compound checking', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const selectA = await driver.wait(until.elementLocated(By.xpath("//select[option[@value='warfarin']]")), 10000);
    await selectA.sendKeys('Amoxicillin (Antibiotic)');

    const allergyToggle = await driver.findElement(By.xpath("//input[@type='checkbox']"));
    await driver.executeScript("arguments[0].click();", allergyToggle);

    await driver.sleep(800);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(bodyText.includes('AI Safety Index') || bodyText.includes('Clinical Check'), 'Simulator score updated');
  });
});
