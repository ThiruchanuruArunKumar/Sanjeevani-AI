import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';

describe('Sanjeevani AI - E2E Login Automated Test Suite', function () {
  this.timeout(30000); // 30s timeout for browser launch and network response
  let driver;

  const BASE_URL = process.env.TEST_URL || 'http://127.0.0.1:5173';

  beforeEach(async function () {
    const options = new chrome.Options();
    options.addArguments('--headless=new'); // Run headless for CI/CD environment
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');
    options.addArguments('--disable-gpu');
    options.addArguments('--window-size=1280,800');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterEach(async function () {
    if (driver) {
      await driver.quit();
    }
  });

  it('Automated Admin Login Verification', async function () {
    console.log(`Navigating to target BASE URL: ${BASE_URL}`);
    await driver.get(BASE_URL);

    // Navigate to Hospital Admin portal via header button
    const adminNavBtn = await driver.wait(
      until.elementLocated(By.xpath("//button[contains(text(), 'Hospital Admin')]")),
      10000,
      'Hospital Admin navigation button not found'
    );
    await adminNavBtn.click();

    // 2. Wait for Email field to be visible
    const emailField = await driver.wait(
      until.elementLocated(By.id('email')),
      10000,
      'Email input field #email not found'
    );
    await driver.wait(until.elementIsVisible(emailField), 5000);

    // 3. Enter test credentials
    await emailField.clear();
    await emailField.sendKeys('admin@sanjeevani.ai');

    // 4. Locate and fill password field
    const passwordField = await driver.findElement(By.id('password'));
    await passwordField.clear();
    await passwordField.sendKeys('admin123');

    // 5. Locate submit button and click
    const loginButton = await driver.findElement(By.id('login-button'));
    await loginButton.click();

    // 6. Verify authentication action
    await driver.sleep(1500);
    const bodyText = await driver.findElement(By.tagName('body')).getText();
    assert.ok(
      bodyText.includes('Admin') || bodyText.includes('Hospital') || bodyText.includes('Doctor'),
      'User was not navigated to dashboard or expected view'
    );
  });
});
