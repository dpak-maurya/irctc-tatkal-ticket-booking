import { TRAIN_LIST_SELECTORS, POPUP_SELECTORS } from './domSelectors';
import { delay, textIncludes, monthToNumber } from './utils';
import { scrollToElement } from './elementUtils';
import logger from './logger';

import { trainNumber, accommodationClass, dateString, confirmberths, refreshTime } from './storage';

let trainFoundAtPosition = -1;
let isAvlEnquiryCompleted = false;
let mutationCompletionCounter = 0;

async function findRootTrain() {
    await delay(500);
    const trainHeadingElements = document.querySelectorAll(TRAIN_LIST_SELECTORS.FIND_TRAIN_NUMBER);
  
    if (!trainHeadingElements || !trainHeadingElements.length) {
      logger.warn('No Available Trains');
      return null;
    }
  
    let rootElement = null;
    for (let i = 0; i < trainHeadingElements.length; i++) {
      const trainHeadingElement = trainHeadingElements[i];
      if (textIncludes(trainHeadingElement.textContent, trainNumber)) {
        rootElement = trainHeadingElement.closest(TRAIN_LIST_SELECTORS.TRAIN_COMPONENT);
        logger.info('Found train number:', trainNumber);
        trainFoundAtPosition = i;
        break;
      }
    }
  
    if (!rootElement) {
      logger.warn('No train found for train number:', trainNumber);
      return null;
    }
    return rootElement;
  }
  async function scrollToFoundTrainAndSelectClass() {
  
    let rootElement = document.querySelectorAll(TRAIN_LIST_SELECTORS.TRAIN_COMPONENT)[trainFoundAtPosition];
  
    await scrollToElement(rootElement);
  
    const availableClasses = rootElement.querySelectorAll(TRAIN_LIST_SELECTORS.AVAILABLE_CLASS);
    if (!availableClasses || !availableClasses.length) {
      logger.warn('No available classes found.');
      return;
    }
    await delay(500);
    let selectedClass = null;
    for (let availableClass of availableClasses) {
      const classNameElement = availableClass.querySelector('strong');
      if (!classNameElement) continue;
      const classText = classNameElement.textContent;
      if (textIncludes(classText, accommodationClass)) {
        selectedClass = availableClass;
        break;
      }
    }
  
    if (!selectedClass) {
      logger.warn('No matching accommodation class found:', accommodationClass);
      return;
    }
    
    await delay(200);
    await selectedClass.click();
  
    logger.info(
      'Selected train number:',
      trainNumber,
      ', and accommodation class:',
      accommodationClass
    );
  }
  // refresh the train by clicking selected open class tab
  async function refreshTrain() {
    try {
      const rootElement = document.querySelectorAll(TRAIN_LIST_SELECTORS.TRAIN_COMPONENT)[trainFoundAtPosition];
      const selectedTab = rootElement.querySelector(TRAIN_LIST_SELECTORS.SELECTED_CLASS_TAB);
      await delay(100);
      if (selectedTab) {
        await selectedTab.click();
      } else {
        logger.warn('Selected accommodation tab not found.');
      }
    } catch (error) {
      logger.error('An error occurred while refreshing the train:', error);
    }
  }
  async function selectAvailableTicket() {
    let rootElement = document.querySelectorAll(TRAIN_LIST_SELECTORS.TRAIN_COMPONENT)[trainFoundAtPosition];
  
    // Select the first available date
    const availableDateElement = rootElement.querySelector(TRAIN_LIST_SELECTORS.AVAILABLE_CLASS);
  
    if (availableDateElement) {
      // Extract the date string from the first strong element
      const avlDate = availableDateElement.querySelector('strong').textContent;
      const availableSeatElement = availableDateElement.querySelector('.AVAILABLE');
  
      if (!availableSeatElement && confirmberths) {
        logger.warn('Confirm Births Seat are not available.');
        alert('Confirm Births Seat are not available.');
        return false;
      }
      // Parse the date string to extract day and month
      const [day, month] = avlDate.split(', ')[1].split(' ');
      const [tday,tmonth]= dateString.split('/');
  
      // Check if the formatted date matches the desired date '25/04'
      if (day === tday && monthToNumber(month)===tmonth) {
        await availableDateElement.click(); // Click on the available date
        await delay(100); // Adjust the delay as needed
  
        // Check if the book ticket button is available
        const bookTicketButton = rootElement.querySelector(TRAIN_LIST_SELECTORS.BOOK_NOW_BUTTON);
        if (bookTicketButton && !bookTicketButton.classList.contains(TRAIN_LIST_SELECTORS.BUTTON_DISABLE_CLASS)) {
          await bookTicketButton.click(); // Click on the book ticket button
          return true; // Indicate that the ticket is selected
        }
      }
    }
    return false; // Indicate that the ticket selection failed
  }
  // Create a new MutationObserver
  // eslint-disable-next-line no-unused-vars
  const observer = new MutationObserver((mutationsList, observer) => {
    // Check if any mutations occurred
    for (let mutation of mutationsList) {
      // Check if nodes were added 
      if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
        // Iterate over added nodes
        for (let node of mutation.addedNodes) {
          // Check if node matches the selector
          if (node.matches(TRAIN_LIST_SELECTORS.LINK_INSERTED)) {
            mutationCompletionCounter++;
            logger.info('Element refreshed: available accommodation classes');
          }
        }
      }
    }
  });
  
  async function bookTicket() {
    const startTime = new Date(); // Record the start time
    await findRootTrain();
  
    // No train found;
    if (trainFoundAtPosition === -1) return;
    let rootElement =
    document.querySelectorAll(TRAIN_LIST_SELECTORS.TRAIN_COMPONENT)[trainFoundAtPosition];
    // Start observing mutations on the parent element
    observer.observe(rootElement, { childList: true, subtree: true });
    
    await scrollToFoundTrainAndSelectClass();
  
    await delay(1000);
  
    while (!isAvlEnquiryCompleted) {
      // Check if any new mutations occurred since the last refresh
      if (mutationCompletionCounter > 0) {
          try {
              const ticketSelected = await selectAvailableTicket();
              if (ticketSelected) {
                  isAvlEnquiryCompleted = true;
                  return;
              } else {
                  // If ticket selection failed, reset the completion flag
                  isAvlEnquiryCompleted = false;
                  // Reset the counters
                  mutationCompletionCounter = 0;
                  await refreshTrain(); // Refresh the train
              }
          } catch (error) {
              // Handle any errors that occur during ticket selection or train refresh
              logger.error("An error occurred:", error);
              // Optionally, you can choose to break the loop or handle the error differently
          }
      }
      await delay(refreshTime); // Adjust the delay as needed
  }
  
    // Proceed with booking the ticket
    const endTime = new Date(); // Record the end time
    logger.info(
      'Search Train and Select Class Page Time taken:',
      endTime - startTime,
      'ms'
    );
    logger.info(endTime);
  }
  // Function to check for the presence of the popup and close it if it exists
function closePopupToProceed() {
    let popup = document.querySelector(POPUP_SELECTORS.DIALOG_FROM);
    
    if (popup) {
      document.querySelector(POPUP_SELECTORS.DIALOG_ACCEPT).click();
      logger.info('Popup closed.');
    } else {
      logger.info('Popup not found.');
    }
  }

// Export functions for use in other modules
export {
    findRootTrain,
    scrollToFoundTrainAndSelectClass,
    refreshTrain,
    selectAvailableTicket,
    bookTicket,
    closePopupToProceed
};