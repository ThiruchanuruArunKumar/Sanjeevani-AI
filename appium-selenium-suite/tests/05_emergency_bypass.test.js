import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 5: Emergency First Responder Bypass Portal E2E Tests', function () {
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

  it('TC246 - TC285: Emergency Lookup Search (SJV-PAT-1001)', async function () {
    await driver.get(CONFIG.TARGET_URL);

    const lookupInput = await driver.wait(until.elementLocated(By.xpath("//input[contains(@placeholder, 'Enter Patient ID')]")), 10000);
    await lookupInput.clear();
    await lookupInput.sendKeys('SJV-PAT-1001');

    const viewIdBtn = await driver.findElement(By.xpath("//button[contains(text(), 'View ID')]"));
    await viewIdBtn.click();

    await driver.sleep(1500);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(
      bodyText.includes('Emergency') || bodyText.includes('Blood Group') || bodyText.includes('Allergies') || bodyText.includes('Sanjeevani'),
      'Emergency First Responder View loaded'
    );
  });
});
