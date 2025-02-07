import { REVIEW_SELECTORS } from './domSelectors';
import { delay, simulateTyping, waitForElementToAppear } from './utils';
import { scrollToElement } from './elementUtils';

async function handleCaptchaAndContinue() {
    await waitForElementToAppear(REVIEW_SELECTORS.REVIEW_CAPTCHA_IMAGE);
    // Find the captcha input element
    var captchaInput = document.getElementById(REVIEW_SELECTORS.REVIEW_CAPTCHA_INPUT);
  
    // Scroll the captcha input field into view smoothly
    if (captchaInput) {
      await scrollToElement(captchaInput);
    }
    delay(100);
    // Prompt the user to enter the captcha value
    var trainHeader = document.querySelector(REVIEW_SELECTORS.REVIEW_TRAIN_HEADER);
    var available = trainHeader.querySelector(REVIEW_SELECTORS.REVIEW_AVAILABLE);
    var waitingList = trainHeader.querySelector(REVIEW_SELECTORS.REVIEW_WAITING);
    var seatsAvailable = (available || waitingList)?.textContent;
    var captchaValue = prompt(
      'Current Seats Status: ' + seatsAvailable + '\nPlease enter the Captcha:'
    );
  
    // Fill the captcha input field with the provided value
    if (captchaInput && captchaValue) {
      await simulateTyping(captchaInput, captchaValue);
      await delay(50);
    }
  
    // Find the "Continue" button
    var continueButton = document.querySelector(REVIEW_SELECTORS.REVIEW_SUBMIT_BUTTON);
  
    // Click the "Continue" button
    if (continueButton) {
      await continueButton.click();
    }
  }

export {
    handleCaptchaAndContinue
};