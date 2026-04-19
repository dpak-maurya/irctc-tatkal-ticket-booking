import { REVIEW_SELECTORS } from './domSelectors';
import { delay, simulateTyping, waitForElementToAppear } from './utils';
import { scrollToElement } from './elementUtils';
import extractTextFromImage from './ocr-reader';
import Logger from './logger';

async function handleCaptchaAndContinue() {
  await waitForElementToAppear(REVIEW_SELECTORS.REVIEW_CAPTCHA_IMAGE);
  // Find the captcha input element and image
  var captchaInput = document.getElementById(REVIEW_SELECTORS.REVIEW_CAPTCHA_INPUT);
  var captchaImage = document.querySelector(REVIEW_SELECTORS.REVIEW_CAPTCHA_IMAGE);

  if (!captchaImage || !captchaInput) {
    Logger.warn("Captcha image or input field not found!");
    return;
  }

  // Scroll the captcha input field into view smoothly
  await scrollToElement(captchaInput);
  
  await delay(100);

  // Extract text from captcha image using OCR
  let captchaText = await extractTextFromImage(captchaImage.src);
  Logger.info("Review Captcha text:",captchaText);

  // Prompt the user to enter the captcha value
  var trainHeader = document.querySelector(REVIEW_SELECTORS.REVIEW_TRAIN_HEADER);
  var available = trainHeader.querySelector(REVIEW_SELECTORS.REVIEW_AVAILABLE);
  var waitingList = trainHeader.querySelector(REVIEW_SELECTORS.REVIEW_WAITING);
  var seatsAvailable = (available || waitingList)?.textContent;

  var captchaValue = prompt(
    'Current Seats Status: ' + seatsAvailable + '\nPlease enter the Captcha:',
    captchaText // Pre-fill with OCR extracted text
  );

  // Fill the captcha input field with the provided value
  if (captchaValue) {
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