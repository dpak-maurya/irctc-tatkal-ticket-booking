import { PASSENGER_SELECTORS, PAYMENT_SELECTORS } from './domSelectors';
import { delay, textIncludes } from './utils';
import logger from './logger';

import { passengerList, infantList, masterData, passengerNames, confirmberths, mobileNumber, autoUpgradation, travelInsuranceOpted, paymentType } from './storage';


let copyPassengerNames = '';

async function addNextRow() {
  const prenextSpan = document.querySelector(PASSENGER_SELECTORS.PASSENGER_NEXT_ROW);

  if (prenextSpan && prenextSpan.textContent.trim() === PASSENGER_SELECTORS.PASSENGER_NEXT_ROW_TEXT) {
    await prenextSpan.closest('a').click();
  } else {
    logger.warn('Span text does not match or element not found.');
  }
}
async function removeFirstRow(){
  // delete the first row
  const firstRow = document.querySelector(PASSENGER_SELECTORS.PASSENGER_REMOVE_ROW);
  if(firstRow){
    await firstRow.click();
  }
}
function processInput() {
  copyPassengerNames = passengerNames
    .filter((passenger) => passenger.isSelected)
    .map((passenger) => passenger.name);

  if (copyPassengerNames.length === 0) {
    logger.warn('No selected passenger names found.');
  } else {
    logger.info('Selected passenger names:', copyPassengerNames);
  }
}

//autocomplete function
async function selectAutocompleteOption(index=0,name = passengerNames) {
  var row = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_COMPONENT)[index];
  // Find the autocomplete input element
  var autocompleteInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_AGE_INPUT);
  name = name.trim().toLowerCase();
  // Wait until the age input field is not empty
  while (ageInput && ageInput.value === '') {
      // Focus on the autocomplete input to trigger the generation of options
    autocompleteInput.focus();

    // Create and dispatch an input event with each character of the name
    var inputEvent = new Event('input', {
        bubbles: true,
        cancelable: true
    });
    // Append the current character of the name to the input value
    autocompleteInput.value = name;
    // Dispatch the input event
    autocompleteInput.dispatchEvent(inputEvent);

    await delay(600);

    // Get all list items within the autocomplete dropdown
    var listItems = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_NAME_LIST);
    // Loop through each list item
    listItems.forEach(function(item) {
        // Get the text content of the list item
        var itemText = item.textContent.trim();
        
        // Check if the text content contains the name substring
        if (textIncludes(itemText,name)) {
            // Select the list item by simulating a click
            item.click();
            logger.info("Selected item:", itemText);
            // Exit the loop after selecting the item
            return;
        }
    });
    // Wait for 500 milliseconds before checking again
    await delay(100);
  }
}
async function addMasterPassengerList() {
  // Process the input (if needed)
  processInput();
  // If there's only one passenger name, fill the input data and return
  if (copyPassengerNames.length === 1) {
    await selectAutocompleteOption(0,copyPassengerNames[0]);
  }
  else{
    const firstRow = document.querySelector(PASSENGER_SELECTORS.PASSENGER_REMOVE_ROW);
    await firstRow.click();
    for (let index = 0; index < copyPassengerNames.length; index++) {
      await addNextRow();
      delay(200);
      await selectAutocompleteOption(index, copyPassengerNames[index]);
    }
  }
}
function fillCustomPassengerDetails(passenger, row = null) {
  // If row is not provided, select the last added row
  if (!row) {
    row = document.querySelector(PASSENGER_SELECTORS.PASSENGER_COMPONENT);
  }

  var nameInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_AGE_INPUT);
  var genderSelect = row.querySelector(PASSENGER_SELECTORS.PASSENGER_GENDER_INPUT);
  var preferenceSelect = row.querySelector(PASSENGER_SELECTORS.PASSENGER_BERTH_CHOICE);
  var foodSelect = row.querySelector(PASSENGER_SELECTORS.PASSENGER_FOOD_CHOICE);
  
  nameInput.value = passenger.name;
  nameInput.dispatchEvent(new Event('input'));
  delay(100);

  ageInput.value = passenger.age;
  ageInput.dispatchEvent(new Event('input'));
  delay(100);

  genderSelect.value = passenger.gender;
  genderSelect.dispatchEvent(new Event('change'));
  delay(100);

  preferenceSelect.value = passenger.preference;
  preferenceSelect.dispatchEvent(new Event('change'));
  delay(100);

  if(foodSelect && passenger && passenger.foodChoice){
    foodSelect.value = passenger.foodChoice;
    foodSelect.dispatchEvent(new Event('change'));
    delay(100);
  }
}
async function addNextInfantRow() {
  const spans = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_NEXT_ROW);
  let infantSpan = null;
  for (const span of spans) {
    if (span.textContent.trim() === PASSENGER_SELECTORS.PASSENGER_INFANT_ADD_BTN_TEXT) {
      infantSpan = span;
      break;
    }
  }
  if (infantSpan) {
    await infantSpan.closest('a').click();
  } else {
    logger.warn('Add infant button not found.');
  }
}

async function fillInfantDetails(infant, row) {
  var nameInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_INFANT_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_SELECTORS.PASSENGER_INFANT_AGE_SELECT);
  var genderSelect = row.querySelector(PASSENGER_SELECTORS.PASSENGER_INFANT_GENDER_SELECT);
  
  if (nameInput) {
    nameInput.value = infant.name;
    nameInput.dispatchEvent(new Event('input', { bubbles: true }));
    await delay(100);
  }

  if (ageInput) {
    ageInput.value = infant.age;
    ageInput.dispatchEvent(new Event('change', { bubbles: true }));
    await delay(100);
  }

  if (genderSelect) {
    genderSelect.value = infant.gender;
    genderSelect.dispatchEvent(new Event('change', { bubbles: true }));
    await delay(100);
  }
}

async function addCustomPassengerList() {
  const normalPassengers = passengerList.filter(p => p.isSelected);
  const infantPassengers = showInfant ? (infantList || []).filter(p => p.isSelected) : [];

  logger.info(`Starting addCustomPassengerList. Normal count: ${normalPassengers.length}, Infant count: ${infantPassengers.length}, showInfant: ${showInfant}`);

  // If there's only one normal passenger in the list and no infants, fill it directly
  if (normalPassengers.length === 1 && infantPassengers.length === 0) {
    logger.info('Only 1 normal passenger and 0 infants. Filling default row directly.');
    fillCustomPassengerDetails(normalPassengers[0]);
  } else {
    // Remove the default row if there's more than one normal passenger or we have infants
    logger.info('Removing default row because we need to add rows dynamically.');
    await removeFirstRow();
    await delay(50);
    // Iterate over each normal passenger
    for (var i = 0; i < normalPassengers.length; i++) {
      var passenger = normalPassengers[i];
      // Add a new row for each passenger
      await addNextRow();
      await delay(50);
      var rows = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_COMPONENT);
      var currentRow = rows[rows.length - 1];

      logger.info(`Filling normal passenger ${i + 1}/${normalPassengers.length}: ${passenger.name}`);
      fillCustomPassengerDetails(passenger, currentRow);

      await delay(100);
    }
  }

  // Iterate over infant passengers
  logger.info(`Starting infant passenger loop. Count: ${infantPassengers.length}`);
  for (var j = 0; j < infantPassengers.length; j++) {
    var infant = infantPassengers[j];
    logger.info(`Adding row for infant ${j + 1}/${infantPassengers.length}: ${infant.name}`);
    await addNextInfantRow();
    await delay(50);
    var infantRows = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_INFANT_COMPONENT);
    var currentInfantRow = infantRows[infantRows.length - 1];

    if (currentInfantRow) {
      logger.info(`Filling infant passenger ${j + 1}: ${infant.name}`);
      await fillInfantDetails(infant, currentInfantRow);
    } else {
      logger.error(`Could not find infant row component for infant ${j + 1}`);
    }
    await delay(100);
  }
}
async function addMobileNumber() {
  const pMobileNumber = mobileNumber;
  // Validate the mobile number
  if (pMobileNumber && /^\d{10}$/.test(pMobileNumber)) {
    var mobileInput = document.getElementById(PASSENGER_SELECTORS.PASSENGER_MOBILE_NUMBER);
    mobileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mobileInput.value = pMobileNumber;
    mobileInput.dispatchEvent(new Event('input'));
    await delay(50);
    logger.info('Mobile number set:', pMobileNumber);
  } else {
    logger.error('Invalid mobile number:', pMobileNumber);
  }
}
async function selectPreferences(){
  var autoUpgradationInput = document.getElementById(PASSENGER_SELECTORS.PASSENGER_PREFERENCE_AUTOUPGRADATION);
  autoUpgradationInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if(autoUpgradationInput && autoUpgradation)
     autoUpgradationInput.click();
  
  var confirmberthsInput = document.getElementById(PASSENGER_SELECTORS.PASSENGER_PREFERENCE_CONFIRMBERTHS);
  if(confirmberthsInput && confirmberths)
    confirmberthsInput.click();

  // Find all input elements of type radio
  var inputs = document.querySelectorAll(PASSENGER_SELECTORS.PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED);

  if (inputs) {
    // Loop through each input element using for...of loop
    for (let input of inputs) {
      // Get the corresponding label element
      var label = input && input.closest('label');

      // Check if the label element exists and its text content matches the specified text
      if (label && textIncludes(label.textContent, travelInsuranceOpted)) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger a click event on the input radio element
        await input.click();
        logger.info('Clicked on radio button for:', travelInsuranceOpted);
        break; // Exit the loop after clicking the input radio
      }
    }
  }
  logger.info('Auto Upgradation:', autoUpgradation, 'Confirm Berths:', confirmberths, 'Travel Insurance Opted:', travelInsuranceOpted);
}
async function selectPaymentType() {
  // Find all input elements of type radio
  var inputs = document.querySelectorAll(PAYMENT_SELECTORS.TYPE);

  if (inputs) {
    // Loop through each input element using for...of loop
    for (let input of inputs) {
      // Get the corresponding label element
      var label = input && input.closest('label');

      // Check if the label element exists and its text content matches the specified text
      if (label && textIncludes(label.textContent, paymentType)) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger a click event on the input radio element
        await input.click();
        logger.info('Clicked on radio button for:', paymentType);
        break; // Exit the loop after clicking the input radio
      }
    }
  }
}
export async function addPassengerInputAndContinue() {
  const startTime = new Date(); // Record the start time
  // fill all passenger list
  if(masterData){
    await addMasterPassengerList();
  }
  else{
    await addCustomPassengerList();
  }
  await addMobileNumber();
  
  await selectPreferences();
  // Call the function to select the radio button
  await selectPaymentType();
  await delay(50);

  // Find the "Continue" button
  var continueButton = document.querySelector(PASSENGER_SELECTORS.PASSENGER_SUBMIT_BUTTON);
  // Check if the button exists
  if (continueButton) {
    continueButton.focus();
    // Simulate a click on the button
    await continueButton.click();
  } else {
    logger.info('Continue button not found.');
  }
   // Proceed with booking the ticket
   const endTime = new Date(); // Record the end time
   logger.info(
     'Add Passenger Input Page Time taken:',
     endTime - startTime,
     'ms'
   );
   logger.info(endTime);
}
