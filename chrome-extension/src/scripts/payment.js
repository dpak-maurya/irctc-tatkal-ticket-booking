import { PAYMENT_SELECTORS, EWALLET_SELECTORS } from './domSelectors';
import { textIncludes } from './utils';
import logger from './logger';

import { paymentMethod, paymentProvider } from './storage';


async function selectPaymentMethod() {
  // Find all elements with the class "bank-type" and "ng-star-inserted"
  var elements = document.querySelectorAll(PAYMENT_SELECTORS.PAYMENT_METHOD);

  // Check if elements exist
  if (elements.length > 0) {
    // Loop through each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Check if the element's text content matches "BHIM/ UPI/ USSD"
      if (textIncludes(element.textContent, paymentMethod)) {
        // Click on the element
        await element.click();
        logger.info('Clicked on :', paymentMethod);
        return; // Exit the loop after clicking the element
      }
    }
  } else {
    logger.info('No elements found with the specified classes.');
  }
}
async function selectPaymentProvider() {
  // Find all elements with the class "bank-text"
  var elements = document.querySelectorAll(PAYMENT_SELECTORS.PAYMENT_PROVIDER);

  // Check if elements exist
  if (elements.length > 0) {
    // Loop through each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Check if the element's text content contains "PAYTM"
      if (textIncludes(element.textContent, paymentProvider)) {
        // Simulate a click on the element
        await element.click();
        logger.info('Selected text:', element.textContent);
        return; // Exit the loop after selecting the text
      }
    }
  }
  logger.info("No text found containing",paymentProvider);
}
async function clickPayButton() {
  // Find the button with the class "btn-primary" and "ng-star-inserted"
  var button = document.querySelector(PAYMENT_SELECTORS.PAY_BUTTON);

  // Check if the button exists and its text content contains "Pay"
  if (button && textIncludes(button.textContent, PAYMENT_SELECTORS.PAY_BUTTON_TEXT)) {
    // Simulate a click on the button
    await button.click();
    logger.info('Clicked on button:', button.textContent);
  } else {
    logger.info("No button found containing 'Pay'.");
  }
}
// Function to click the confirm button in the eWallet component
async function clickEwalletConfirmButton() {
  const ewalletComponent = document.querySelector(EWALLET_SELECTORS.EWALLET_COMPONENT);
  if (ewalletComponent) {
    const buttons = ewalletComponent.querySelectorAll(EWALLET_SELECTORS.EWALLET_BUTTON_LIST); // Select all buttons
    let confirmButton = null;
    for (const button of buttons) {
      if (textIncludes(button.textContent,EWALLET_SELECTORS.EWALLET_CONFIRM_BUTTON_TEXT)) {
        confirmButton = button;
        break;
      }
    }
    if (confirmButton) {
      await confirmButton.click();
      logger.info('Clicked on eWallet confirm button.');
    } else {
      logger.info('eWallet confirm button not found.');
    }
  } else {
    logger.info('eWallet component not found.');
  }
}

// Export all functions and variables
export {
    selectPaymentMethod,
    selectPaymentProvider,
    clickPayButton,
    clickEwalletConfirmButton
};