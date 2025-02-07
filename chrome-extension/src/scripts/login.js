import { LOGIN_SELECTORS } from './domSelectors';
import { scrollToElement } from './elementUtils';
import { delay, simulateTyping, waitForElementToAppear } from './utils';
import logger from './logger';

import { username, password } from './storage';

async function fillLoginCaptcha() {
    // Find the captcha input element
    var captchaInput = document.querySelector(LOGIN_SELECTORS.LOGIN_CAPTCHA_INPUT);
  
    // Scroll the captcha input field into view smoothly
    if (captchaInput) {
      await scrollToElement(captchaInput);
    }
    var captchaValue = prompt('Please enter the Captcha:');
  
    // Fill the captcha input field with the provided value
    if (captchaInput && captchaValue) {
      await simulateTyping(captchaInput, captchaValue);
      await delay(50);
    }
  }

// Function to Login
async function login() {
    let loginButton = document.querySelector(LOGIN_SELECTORS.LOGIN_BUTTON);
    if(loginButton){
      await loginButton.click();
    }
    await waitForElementToAppear(LOGIN_SELECTORS.LOGIN_COMPONENT);
    await waitForElementToAppear(LOGIN_SELECTORS.LOGIN_CAPTCHA_IMAGE);
  
    let loginModal = document.querySelector(LOGIN_SELECTORS.LOGIN_COMPONENT);
  
    if (!loginModal) return;
  
    const usernameInput = loginModal.querySelector(LOGIN_SELECTORS.LOGIN_USERID);
    const passwordInput = loginModal.querySelector(LOGIN_SELECTORS.LOGIN_PASSWORD);
    await simulateTyping(usernameInput, username);
    await simulateTyping(passwordInput, password);
    if(username && password){
      await fillLoginCaptcha();
      const signInButton = loginModal.querySelector('button[type="submit"]');
      await signInButton.click();
    }
  }

// Function to wait for the app-login element to disappear
async function waitForAppLoginToDisappear() {
    // Select the app-login element
    const appLogin = document.querySelector(LOGIN_SELECTORS.LOGIN_COMPONENT);
  
    // If the app-login element is not found, return immediately
    if (!appLogin) {
      return;
    }
  
    // Create a promise to track the disappearance of the app-login element
    // eslint-disable-next-line no-unused-vars
    return new Promise((resolve, reject) => {
      // Create a mutation observer to watch for changes in the DOM
      const observer = new MutationObserver((mutationsList, observer) => {
        // Check if the app-login element is still in the DOM
        if (!document.contains(appLogin)) {
          // If the app-login element has been removed, resolve the promise
          logger.info('app-login disappear');
          resolve();
          // Disconnect the observer
          observer.disconnect();
        }
      });
  
      // Start observing changes in the DOM, targeting the removal of the app-login element
      observer.observe(document.body, { childList: true, subtree: true });
    });
  }

// Export all functions and variables
export {
    fillLoginCaptcha,
    login,
    waitForAppLoginToDisappear
};