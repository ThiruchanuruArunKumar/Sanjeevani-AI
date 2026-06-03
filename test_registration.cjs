const puppeteer = require('puppeteer');

(async () => {
  console.log('Launching browser...');
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  try {
    console.log('Navigating to localhost:5173...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });

    // 1. Create Admin
    console.log('Clicking Hospital Admin...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const adminBtn = buttons.find(b => b.textContent.includes('Hospital Admin'));
      if (adminBtn) adminBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('Switching to Register Admin...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const regBtn = buttons.find(b => b.textContent.includes('Register Hospital'));
      if (regBtn) regBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 500));

    console.log('Filling out Admin details...');
    await page.type('input[placeholder="e.g. Apollo Hospitals"]', 'Puppeteer Gen Hospital');
    await page.type('input[placeholder="e.g. 123 Health Avenue"]', '123 Test Ave');
    await page.type('input[placeholder="e.g. Dr. Rajesh Kumar"]', 'Admin Tester');
    await page.type('input[placeholder="admin@hospital.com"]', 'admin123@test.com');
    await page.type('input[placeholder="••••••••"]', 'password123');
    
    console.log('Submitting Admin Registration...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submit = buttons.find(b => b.textContent.includes('Submit Registration'));
      if (submit) submit.click();
    });

    await new Promise(r => setTimeout(r, 1000));
    
    // Get the hospital ID from localStorage since we are an admin now
    console.log('Extracting generated Hospital ID...');
    const adminData = await page.evaluate(() => localStorage.getItem('sj_active_user'));
    const adminObj = JSON.parse(adminData);
    const hospitalId = adminObj.id;
    console.log('Generated Hospital ID:', hospitalId);

    // Logout
    console.log('Logging out of Admin...');
    await page.evaluate(() => {
      localStorage.removeItem('sj_active_user');
      localStorage.removeItem('sj_active_role');
    });
    
    // 2. Create Doctor
    console.log('Navigating back to welcome screen...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    console.log('Clicking Clinician...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const docBtn = buttons.find(b => b.textContent.includes('Clinician'));
      if (docBtn) docBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 500));
    
    console.log('Switching to Register Doctor...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const regBtn = buttons.find(b => b.textContent.includes('Register Clinic'));
      if (regBtn) regBtn.click();
    });
    
    await new Promise(r => setTimeout(r, 500));

    console.log('Filling out Doctor details...');
    await page.type('input[placeholder="e.g. Dr. Aarav Mehta"]', 'Dr. Puppeteer');
    await page.type('input[placeholder="e.g. Cardiology"]', 'Automation');
    await page.type('input[placeholder="e.g. Block C, Digital Labs"]', 'Test Clinic');
    await page.type('input[placeholder="e.g. 84b2..."]', hospitalId); // Use the extracted ID!
    await page.type('input[placeholder="doctor@sanjeevani.ai"]', 'doctor123@test.com');
    await page.type('input[placeholder="••••••••"]', 'password123');
    
    console.log('Submitting Doctor Registration...');
    await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const submit = buttons.find(b => b.textContent.includes('Submit Credentials'));
      if (submit) submit.click();
    });
    
    await new Promise(r => setTimeout(r, 1000));
    
    // Logout Doctor
    console.log('Logging out of Doctor...');
    await page.evaluate(() => {
      localStorage.removeItem('sj_active_user');
      localStorage.removeItem('sj_active_role');
    });

    // 3. Login as Admin and Check Dashboard!
    console.log('Navigating back to welcome screen...');
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    
    console.log('Logging back into Admin...');
    await page.evaluate((admin) => {
      localStorage.setItem('sj_active_role', 'admin');
      localStorage.setItem('sj_active_user', JSON.stringify(admin));
    }, adminObj);
    
    await page.goto('http://localhost:5173', { waitUntil: 'networkidle0' });
    await page.waitForTimeout(1000);
    
    console.log('Checking Admin Dashboard for Doctor Requests...');
    // Log the entire text of the page to see if "Dr. Puppeteer" is visible
    const pageText = await page.evaluate(() => document.body.innerText);
    
    if (pageText.includes('Dr. Puppeteer')) {
      console.log('SUCCESS! The doctor "Dr. Puppeteer" successfully appeared in the Admin Dashboard!');
    } else {
      console.error('FAILURE: The doctor did not appear in the Admin Dashboard.');
      console.log('Page Text Dump:', pageText.substring(0, 500) + '...');
    }

  } catch (error) {
    console.error('Test script failed:', error);
  } finally {
    await browser.close();
  }
})();
