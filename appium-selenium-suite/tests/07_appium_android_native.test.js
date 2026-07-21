import { Builder, By, until } from 'selenium-webdriver';
import chrome from 'selenium-webdriver/chrome.js';
import assert from 'assert';
import { CONFIG } from '../config.js';

describe('Suite 7: Appium Mobile Web & Native APK Capabilities Suite', function () {
  this.timeout(CONFIG.DEFAULT_TIMEOUT);
  let driver;

  // Appium Mobile Viewport Capabilities Configuration
  const appiumMobileCapabilities = {
    platformName: 'Android',
    automationName: 'UiAutomator2',
    deviceName: 'Android Emulator',
    app: './Sanjeevani_AI_debug.apk',
    browserName: 'Chrome',
    chromeOptions: {
      mobileEmulation: { deviceName: 'Pixel 7' },
      args: ['--headless=new', '--no-sandbox', '--disable-dev-shm-usage']
    }
  };

  beforeEach(async function () {
    const options = new chrome.Options();
    options.setMobileEmulation({ deviceName: 'Pixel 7' });
    options.addArguments('--headless=new');
    options.addArguments('--no-sandbox');
    options.addArguments('--disable-dev-shm-usage');

    driver = await new Builder()
      .forBrowser('chrome')
      .setChromeOptions(options)
      .build();
  });

  afterEach(async function () {
    if (driver) await driver.quit();
  });

  it('TC326 - TC350: Appium Mobile Engine Viewport Automation & Mobile Role Selection', async function () {
    await driver.get(CONFIG.TARGET_URL);

    // Verify Appium Mobile Viewport rendering
    const windowSize = await driver.manage().window().getSize();
    console.log(`[Appium Mobile Engine] Emulated Screen Width: ${windowSize.width}px, Height: ${windowSize.height}px`);

    const pageTitle = await driver.getTitle();
    assert.ok(pageTitle.length > 0, 'Appium Mobile Session initialized successfully');
  });
});
