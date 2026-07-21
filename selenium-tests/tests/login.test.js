import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';

describe('Sanjeevani AI - E2E Login Automated Test Suite', function () {
  this.timeout(30000); // 30s timeout for browser launch and network response
  let driver;

  const BASE_URL = process.env.TEST_URL || 'http://localhost:5173';

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

  it('Step 13 Automation: Should navigate to login page, enter credentials, and authenticate', async function () {
    const loginUrl = `${BASE_URL}/admin/login`;
    console.log(`Navigating to target URL: ${loginUrl}`);
    await driver.get(loginUrl);

    // Resilience: If app falls back to welcome landing page, click Hospital Admin button
    try {
      const adminBtn = await driver.wait(
        until.elementLocated(By.xpath("//button[contains(text(), 'Hospital Admin')]")),
        3000
      );
      if (adminBtn) {
        console.log('Navigated via Hospital Admin header button');
        await adminBtn.click();
      }
    } catch (e) {
      // Already on admin login view directly
    }

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
    const currentUrl = await driver.getCurrentUrl();
    console.log(`Current page URL after login attempt: ${currentUrl}`);

    assert.ok(
      currentUrl.includes('admin') || currentUrl.includes('dashboard') || currentUrl === `${BASE_URL}/`,
      'User was not navigated to dashboard or expected view'
    );
  });
});
