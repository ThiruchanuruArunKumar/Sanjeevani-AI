// appium-selenium-suite/config.js
export const CONFIG = {
  // Live GitHub Pages Application URL
  TARGET_URL: process.env.TEST_URL || 'https://thiruchanuruarunkumar.github.io/Sanjeevani-AI/',
  
  // Credentials requested by user
  ADMIN_CREDENTIALS: {
    email: 'admin@sanjeevani.ai',
    password: 'admin123'
  },
  DOCTOR_CREDENTIALS: {
    email: 'doctor@sanjeevani.ai',
    password: 'doctor123'
  },
  PATIENT_CREDENTIALS: {
    phone: '9876543210',
    password: 'patient123'
  },
  
  // Timeout configurations
  DEFAULT_TIMEOUT: 30000,
  ELEMENT_WAIT_TIMEOUT: 10000
};
