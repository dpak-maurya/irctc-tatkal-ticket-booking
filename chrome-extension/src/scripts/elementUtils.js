/* global module,require */

import logger from './logger';

var intervalId;

function scrollToElement(element) {
  if (!element) {
    console.warn('Element not found for scrolling');
    return;
  }
  element.scrollIntoView({ behavior: 'smooth', block: 'center' });
}
function simulateTyping(element, text) {
  return new Promise(function(resolve) {
    if (!element) {
      resolve();
      return;
    }

    // Trigger compositionstart event
    element.dispatchEvent(new Event('compositionstart', { bubbles: true }));

    // Set the value of the input field
    element.value = text;

    // Trigger input event
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Trigger compositionend event
    element.dispatchEvent(new Event('compositionend', { bubbles: true }));

    // Trigger blur event to simulate losing focus
    element.dispatchEvent(new Event('blur', { bubbles: true }));

    resolve();
  });
}
// Define a function to wait for an element to appear on the page
function waitForElementToAppear(selector) {
  return new Promise(function(resolve) {
    if(intervalId) clearInterval(intervalId);
    const startTime = new Date();
    const interval = setInterval(function() {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        const endTime = new Date();
        logger.info(
          'Element loaded:',
          selector,
          'Time taken:',
          endTime - startTime,
          'ms'
        );
        resolve();
      }
    }, 500);
  });
}

export {
  scrollToElement,
  simulateTyping,
  waitForElementToAppear
};
