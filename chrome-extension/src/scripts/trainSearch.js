import { 
  JOURNEY_SELECTORS,
  MODIFY_SEARCH_SELECTORS
} from './domSelectors';
import { delay } from './utils';
import logger from './logger';

import { from, to, quotaType, dateString, targetTime as targetTimeString } from './storage';

async function autoComplete(element, value) {
  // Focus on the autocomplete input to trigger the generation of options
  element.focus();

  // Set the input value
  element.value = value;

  // Simulate an input event to trigger the autocomplete options
  var inputEvent = new Event('input', {
    bubbles: true,
    cancelable: true,
  });
  
  element.dispatchEvent(inputEvent);

  // Wait for a short delay to ensure the options are generated
  await delay(600);

  var firstItem = document.querySelector(JOURNEY_SELECTORS.STATION_CODE_LIST);
  if (firstItem) {
    await firstItem.click();
  }
}
async function typeDate(element, mydate) {
  if (!element) return;

  // Trigger focus event
  element.dispatchEvent(new Event('focus', { bubbles: true }));

  // Clear the input field
  element.value = '';

  // Trigger input event after clearing the input field
  element.dispatchEvent(new Event('input', { bubbles: true }));

  // Iterate over each character of the date string and type it
  for (const char of mydate) {
    // Set the value of the input field to the current character
    element.value += char;

    // Trigger input event after typing each character
    element.dispatchEvent(new Event('input', { bubbles: true }));

    // Trigger keydown event with the current character
    element.dispatchEvent(new KeyboardEvent('keydown', { key: char }));

    // Wait for a short delay before typing the next character
    await new Promise(resolve => setTimeout(resolve, 100));
  }

  // Trigger blur event to simulate losing focus
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}
async function selectQuota(element,value) {

   await element.click();

   // Simulate an onChange event to trigger the autocomplete options
   var inputEvent = new Event('onChange', {
     bubbles: true,
     cancelable: true,
   });

   element.dispatchEvent(inputEvent);

   delay(500);

  // Get all list items within the autocomplete dropdown
  var listItems = document.querySelectorAll(JOURNEY_SELECTORS.JOURNEY_QUOTA_LIST);

  // Loop through each list item
  for (let item of listItems) {
    // Get the text content of the list item
    const itemText = item.textContent.trim();

    // Check if the text content contains the name substring (case-insensitive)
    if (itemText.toLowerCase().includes(value.toLowerCase())) {
      // Select the list item by simulating a click
      item.click();
      break;
    }
  }
}
// Function to fill Journey Details
async function searchTrain(){
  let journeyInput = document.querySelector(JOURNEY_SELECTORS.JOURNEY_INPUT_COMPONENT);
  let origin = journeyInput.querySelector(JOURNEY_SELECTORS.ORIGIN_STATION_CODE);
  let destination = journeyInput.querySelector(JOURNEY_SELECTORS.DESTINATION_STATION_CODE);
  let quota = journeyInput.querySelector(JOURNEY_SELECTORS.JOURNEY_QUOTA);
  let jDate = journeyInput.querySelector(JOURNEY_SELECTORS.JOURNEY_DATE);

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
}
// Function to update Journey Details
async function modifySearchTrain(){
  let journeyInput = document.querySelector(MODIFY_SEARCH_SELECTORS.MODIFY_SEARCH_COMPONENT);
  let origin = journeyInput.querySelector(JOURNEY_SELECTORS.ORIGIN_STATION_CODE);
  let destination = journeyInput.querySelector(JOURNEY_SELECTORS.DESTINATION_STATION_CODE);
  let quota = journeyInput.querySelector(JOURNEY_SELECTORS.JOURNEY_QUOTA);
  let jDate = journeyInput.querySelector(MODIFY_SEARCH_SELECTORS.MODIFY_JOURNEY_DATE);

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
  const searchButton = journeyInput.querySelector('button[type="submit"]');
  await searchButton.click();
}
async function callSearchTrainComponent(){
  let journeyComponent = document.querySelector(JOURNEY_SELECTORS.JOURNEY_INPUT_COMPONENT);

  if(journeyComponent){
    await searchTrain();
  }
  else{
    await modifySearchTrain();
  }
}
function waitForTargetTime() {
  // Define the interval function
  const intervalId = setInterval(() => {
    // Extract the current time element
    const currentTimeElement = document.querySelector(JOURNEY_SELECTORS.CURRENT_TIME);

    if (!currentTimeElement) {
      logger.error('Current time element not found.');
      clearInterval(intervalId);
      return;
    }

    // Extract the current time string from the element
    const currentDateTimeString = currentTimeElement.textContent.trim();
    const [, currentTimeString] = currentDateTimeString.match(/\[(\d+:\d+:\d+)\]/);

    // Split the current time string and target time string on ":"
    const [currentHour, currentMinute, currentSecond] = currentTimeString.split(':').map(Number);
    const [targetHour, targetMinute, targetSecond] = targetTimeString.split(':').map(Number);

    // Compare the current time with the target time
    if (currentHour > targetHour || 
        (currentHour === targetHour && currentMinute > targetMinute) || 
        (currentHour === targetHour && currentMinute === targetMinute && currentSecond >= targetSecond)) {
      const searchButton = document.querySelector(JOURNEY_SELECTORS.JOURNEY_SEARCH_BUTTON);
      if (searchButton) {
        searchButton.click();
      } else {
        logger.warn('Search button not found.');
      }
      clearInterval(intervalId); // Stop the interval once the action is triggered
    }
  }, 1000); // Interval set to 1 second (1000 milliseconds)
}

export {
  callSearchTrainComponent,
  waitForTargetTime
};
