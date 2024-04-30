
let automationStatus = false;
let username = '';
let password = '';
let targetTime ='09:59:45'
let passengerList = [];
let masterData = false;
let passengerNames = '';
let trainNumber = '';
let from = '';
let to = '';
let quotaType = '';
let accommodationClass = '';
let dateString = '';
let refreshTime = 5000; // 5 seconds;
let paymentType = 'BHIM/UPI'; // Rs 20 chargs for bhim/upi, Rs 30 for cards / net banking
let paymentMethod = 'BHIM/ UPI/ USSD';
let paymentProvider = 'PAYTM'; // paytm or amazon
let autoPay = false;  // auto click on pay button
let autoProcessPopup = false;

const defaultSettings = {
  automationStatus: false,
  username: '',
  password: '',
  targetTime: '09:59:45',
  passengerList: [],
  masterData: false,
  passengerNames: '',
  trainNumber: '',
  from: '',
  to: '',
  quotaType: '',
  accommodationClass: '',
  dateString: '',
  refreshTime: 5000,
  paymentType: 'BHIM/UPI',
  paymentMethod: 'BHIM/ UPI/ USSD',
  paymentProvider: 'PAYTM',
  autoPay: false,
  autoProcessPopup: false
};


var intervalId;
let trainFoundAtPosition = -1;
let isAvlEnquiryCompleted = false;
let mutationCompletionCounter = 0;
let copyPassengerNames = '';

const APP_HEADER = 'app-header';

// Login Element 
const LOGIN_BUTTON = 'app-header a.loginText';
const LOGIN_COMPONENT = 'app-login';
const LOGIN_USERID = 'input[formcontrolname="userid"]';
const LOGIN_PASSWORD = 'input[formcontrolname="password"]';
const LOGIN_CAPTCHA_IMAGE = 'app-captcha .captcha-img';
const LOGIN_CAPTCHA_INPUT = 'app-captcha #captcha';

// Search Journey Element
const JOURNEY_INPUT_COMPONENT = 'app-jp-input';
const ORIGIN_STATION_CODE = '#origin input';
const DESTINATION_STATION_CODE = '#destination input';
const STATION_CODE_LIST = '.ui-autocomplete-items li';
const JOURNEY_QUOTA = '#journeyQuota>div';
const JOURNEY_QUOTA_LIST = '#journeyQuota p-dropdownitem span';
const JOURNEY_DATE = '#jDate input';
const CURRENT_TIME = 'app-header .h_head1>span strong';
const JOURNEY_SEARCH_BUTTON = 'button[type="submit"][label="Find Trains"].search_btn.train_Search';

// Modify Search Train Element 
const MODIFY_SEARCH_COMPONENT = 'app-modify-search';
const MODIFY_JOURNEY_DATE = '#journeyDate input';

// TRAIN LIST 
const TRAIN_LIST_COMPONENT = 'app-train-list';
const TRAIN_COMPONENT = 'app-train-avl-enq';
const FIND_TRAIN_NUMBER = 'app-train-avl-enq .train-heading';
const AVAILABLE_CLASS = '.pre-avl';
const SELECTED_CLASS_TAB = 'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div';
const BOOK_NOW_BUTTON = 'button.btnDefault.train_Search';
const BUTTON_DISABLE_CLASS = 'disable-book';
const LINK_INSERTED = '.link.ng-star-inserted';

// POP UP
const DIALOG_FROM = 'p-confirmdialog[key="tofrom"]';
const DIALOG_ACCEPT = '.ui-confirmdialog-acceptbutton';

// Pasenger Input
const PASSENGER_APP_COMPONENT = 'app-passenger-input';
const PASSENGER_COMPONENT = 'app-passenger';
const PASSENGER_NEXT_ROW = 'app-passenger-input p-panel .prenext';
const PASSENGER_NEXT_ROW_TEXT = '+ Add Passenger';
const PASSENGER_REMOVE_ROW = 'app-passenger-input p-panel a.fa-remove';
const PASSENGER_INPUT_COMPONENT = 'app-passenger-input';
const PASSENGER_NAME_INPUT = 'p-autocomplete input';
const PASSENGER_NAME_LIST = '.ui-autocomplete-items li';
const PASSENGER_AGE_INPUT = 'input[formcontrolname="passengerAge"]';
const PASSENGER_GENDER_INPUT = 'select[formcontrolname="passengerGender"]';
const PASSENGER_BERTH_CHOICE = 'select[formcontrolname="passengerBerthChoice"]';
const PASSENGER_SUBMIT_BUTTON = 'app-passenger-input button.btnDefault.train_Search';

// Review Ticket and Fill Captcha
const REVIEW_COMPONENT = 'app-review-booking';
const REVIEW_TRAIN_HEADER = 'app-train-header';
const REVIEW_CAPTCHA_IMAGE = 'app-captcha .captcha-img';
const REVIEW_CAPTCHA_INPUT = 'captcha';
const REVIEW_AVAILABLE = '.AVAILABLE';
const REVIEW_WAITING = '.WL';
const REVIEW_SUBMIT_BUTTON = 'app-review-booking button.btnDefault.train_Search';

// Payment Details
const PAYEMENT_COMPONENT = 'app-payment-options';
const PAYMENT_TYPE = 'input[type="radio"][name="paymentType"]';
const PAYMENT_METHOD = '.bank-type.ng-star-inserted';
const PAYMENT_PROVIDER = '.bank-text';
const PAY_BUTTON ='.btn-primary.ng-star-inserted';
const PAY_BUTTON_TEXT = 'Pay & Book ';

// Define a function to wait for an element to appear on the page
async function waitForElementToAppear(selector) {
  if(intervalId) clearInterval(intervalId);
  const startTime = new Date(); // Record the start time
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        clearInterval(interval);
        const endTime = new Date(); // Record the end time
        console.log(
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
// Function to convert month abbreviation to number
function monthToNumber(month) {
  const monthMap = {
    'Jan': '01', 'Feb': '02', 'Mar': '03', 'Apr': '04', 'May': '05', 'Jun': '06',
    'Jul': '07', 'Aug': '08', 'Sep': '09', 'Oct': '10', 'Nov': '11', 'Dec': '12'
  };
  return monthMap[month];
}
// Function to introduce a small delay
function delay(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
// Function to check if searchText exists in text
function textIncludes(text, searchText) {
  return text.trim().toLowerCase().includes(searchText.trim().toLowerCase());
}
function scrollToElement(element) {
  return new Promise((resolve) => {
    element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    // Wait for a brief moment for the scroll animation to complete
    setTimeout(resolve, 1000);
  });
}
async function simulateTyping(element, text) {
  if (!element) return;

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
}
async function fillLoginCaptcha() {
  // Find the captcha input element
  var captchaInput = document.querySelector(LOGIN_CAPTCHA_INPUT);

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
  let loginButton = document.querySelector(LOGIN_BUTTON);
  if(loginButton){
    await loginButton.click();
  }
  await waitForElementToAppear(LOGIN_COMPONENT);
  await waitForElementToAppear(LOGIN_CAPTCHA_IMAGE);

  let loginModal = document.querySelector(LOGIN_COMPONENT);

  if (!loginModal) return;

  const usernameInput = loginModal.querySelector(LOGIN_USERID);
  const passwordInput = loginModal.querySelector(LOGIN_PASSWORD);
  await simulateTyping(usernameInput, username);
  await simulateTyping(passwordInput, password);
  if(username && password){
    await fillLoginCaptcha();
    const signInButton = loginModal.querySelector('button[type="submit"]');
    await signInButton.click();
  }
}
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

  var firstItem = document.querySelector(STATION_CODE_LIST);
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
  var listItems = document.querySelectorAll(JOURNEY_QUOTA_LIST);

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
// Function to wait for the app-login element to disappear
async function waitForAppLoginToDisappear() {
  // Select the app-login element
  const appLogin = document.querySelector(LOGIN_COMPONENT);

  // If the app-login element is not found, return immediately
  if (!appLogin) {
    return;
  }

  // Create a promise to track the disappearance of the app-login element
  return new Promise((resolve, reject) => {
    // Create a mutation observer to watch for changes in the DOM
    const observer = new MutationObserver((mutationsList, observer) => {
      // Check if the app-login element is still in the DOM
      if (!document.contains(appLogin)) {
        // If the app-login element has been removed, resolve the promise
        console.log('app-login disappear');
        resolve();
        // Disconnect the observer
        observer.disconnect();
      }
    });

    // Start observing changes in the DOM, targeting the removal of the app-login element
    observer.observe(document.body, { childList: true, subtree: true });
  });
}
// Function to fill Journey Details
async function searchTrain(){
  let journeyInput = document.querySelector(JOURNEY_INPUT_COMPONENT);
  let origin = journeyInput.querySelector(ORIGIN_STATION_CODE);
  let destination = journeyInput.querySelector(DESTINATION_STATION_CODE);
  let quota = journeyInput.querySelector(JOURNEY_QUOTA);
  let jDate = journeyInput.querySelector(JOURNEY_DATE);

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
}
// Function to update Journey Details
async function modifySearchTrain(){
  let journeyInput = document.querySelector(MODIFY_SEARCH_COMPONENT);
  let origin = journeyInput.querySelector(ORIGIN_STATION_CODE);
  let destination = journeyInput.querySelector(DESTINATION_STATION_CODE);
  let quota = journeyInput.querySelector(JOURNEY_QUOTA);
  let jDate = journeyInput.querySelector(MODIFY_JOURNEY_DATE);

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
  const searchButton = journeyInput.querySelector('button[type="submit"]');
  await searchButton.click();
}
async function callSearchTrainComponent(){
  let journeyComponent = document.querySelector(JOURNEY_INPUT_COMPONENT);

  if(journeyComponent){
    await searchTrain();
  }
  else{
    await modifySearchTrain();
  }
}
async function findRootTrain() {
  delay(500);
  const trainHeadingElements = document.querySelectorAll(FIND_TRAIN_NUMBER);

  if (!trainHeadingElements || !trainHeadingElements.length) {
    console.log('No Available Trains');
    return null;
  }

  let rootElement = null;
  for (let i = 0; i < trainHeadingElements.length; i++) {
    const trainHeadingElement = trainHeadingElements[i];
    if (textIncludes(trainHeadingElement.textContent, trainNumber)) {
      rootElement = trainHeadingElement.closest(TRAIN_COMPONENT);
      console.log('Found train number:', trainNumber);
      trainFoundAtPosition = i; // Store the index of the found train
      break;
    }
  }

  if (!rootElement) {
    console.log('No train found for train number:', trainNumber);
    return null;
  }
  return rootElement;
}
async function scrollToFoundTrainAndSelectClass() {

  let rootElement = document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];

  await scrollToElement(rootElement);

  const availableClasses = rootElement.querySelectorAll(AVAILABLE_CLASS);
  if (!availableClasses || !availableClasses.length) {
    console.log('No available classes found.');
    return;
  }
  delay(500);
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
    console.log('No matching accommodation class found:', accommodationClass);
    return;
  }
  delay(200);
  await selectedClass.click();

  console.log(
    'Selected train number:',
    trainNumber,
    ', and accommodation class:',
    accommodationClass
  );
}
// refresh the train by clicking selected open class tab
async function refreshTrain() {
  try {
    const rootElement = document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];
    const selectedTab = rootElement.querySelector(SELECTED_CLASS_TAB);
    delay(100);
    // Simulate a click on the selected tab
    if (selectedTab) {
      await selectedTab.click();
    } else {
      console.warn('Selected accommodation tab not found.');
    }
  } catch (error) {
    console.error('An error occurred while refreshing the train:', error);
  }
}
async function selectAvailableTicket() {
  let rootElement = document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];

  // Select the first available date
  const availableDateElement = rootElement.querySelector(AVAILABLE_CLASS);

  if (availableDateElement) {
    // Extract the date string from the first strong element
    const avlDate = availableDateElement.querySelector('strong').textContent;
    
    // Parse the date string to extract day and month
    const [day, month] = avlDate.split(', ')[1].split(' ');
    const [tday,tmonth,_]= dateString.split('/');

    // Check if the formatted date matches the desired date '25/04'
    if (day === tday && monthToNumber(month)===tmonth) {
      await availableDateElement.click(); // Click on the available date
      await delay(100); // Adjust the delay as needed

      // Check if the book ticket button is available
      const bookTicketButton = rootElement.querySelector(BOOK_NOW_BUTTON);
      if (bookTicketButton && !bookTicketButton.classList.contains(BUTTON_DISABLE_CLASS)) {
        await bookTicketButton.click(); // Click on the book ticket button
        return true; // Indicate that the ticket is selected
      }
    }
  }
  return false; // Indicate that the ticket selection failed
}
// Create a new MutationObserver
const observer = new MutationObserver((mutationsList, observer) => {
  // Check if any mutations occurred
  for (let mutation of mutationsList) {
    // Check if nodes were added 
    if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
      // Iterate over added nodes
      for (let node of mutation.addedNodes) {
        // Check if node matches the selector
        if (node.matches(LINK_INSERTED)) {
          mutationCompletionCounter++;
          // For example, you can click on the element or store a reference to it
          console.log('element refreshed : available accommodation classes' );
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
  document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];
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
            console.error("An error occurred:", error);
            // Optionally, you can choose to break the loop or handle the error differently
        }
    }
    await delay(refreshTime); // Adjust the delay as needed
}

  // Proceed with booking the ticket
  const endTime = new Date(); // Record the end time
  console.log(
    'Search Train and Select Class Page Time taken:',
    endTime - startTime,
    'ms'
  );
  console.log(endTime);
}
// Function to check for the presence of the popup and close it if it exists
function closePopupToProceed() {
  let popup = document.querySelector(DIALOG_FROM);
  
  if (popup) {
    // Close the popup by clicking the close button or any other suitable action
    document.querySelector(DIALOG_ACCEPT).click();
    console.log('Popup closed.');
  } else {
    console.log('Popup not found.');
  }
}
async function addNextRow() {
  const prenextSpan = document.querySelector(PASSENGER_NEXT_ROW);

  if (prenextSpan && prenextSpan.textContent.trim() === PASSENGER_NEXT_ROW_TEXT) {
    await prenextSpan.closest('a').click();
  } else {
    console.log('Span text does not match or element not found.');
  }
}
async function removeFirstRow(){
  // delete the first row
  const firstRow = document.querySelector(PASSENGER_REMOVE_ROW);
  if(firstRow){
    await firstRow.click();
  }
}
function processInput() {
  copyPassengerNames = passengerNames.split(',');
  if (copyPassengerNames.length === 0) {
    console.log('No passenger names found.');
  }
}
//autocomplete function
function selectAutocompleteOption(index=0,name = passengerNames) {
  var rows = document.querySelectorAll(PASSENGER_COMPONENT);
  // Find the autocomplete input element
  var autocompleteInput = rows[index].querySelector(PASSENGER_NAME_INPUT);
  
  // Focus on the autocomplete input to trigger the generation of options
  autocompleteInput.focus();
  // Simulate user input by dispatching input events
  for (var i = 0; i < name.length; i++) {
      // Create and dispatch an input event with each character of the name
      var inputEvent = new Event('input', {
          bubbles: true,
          cancelable: true
      });
      // Append the current character of the name to the input value
      autocompleteInput.value += name[i];
      // Dispatch the input event
      autocompleteInput.dispatchEvent(inputEvent);
  }
  // Wait for a short delay to ensure the options are generated
  setTimeout(function() {
      // Get all list items within the autocomplete dropdown
      var listItems = document.querySelectorAll(PASSENGER_NAME_LIST);
      // Loop through each list item
      listItems.forEach(function(item) {
          // Get the text content of the list item
          var itemText = item.textContent.trim();
          
          // Check if the text content contains the name substring
          if (itemText.toLowerCase().includes(name.trim().toLowerCase())) {
              // Select the list item by simulating a click
              item.click();
              console.log("Selected item:", itemText);
              // Exit the loop after selecting the item
              return;
          }
      });
  }, 600); // Adjust the delay as needed
}
async function addMasterPassengerList() {
  // Process the input (if needed)
  processInput();
  // If there's only one passenger name, fill the input data and return
  if (copyPassengerNames.length === 1) {
    selectAutocompleteOption();
  }
  else{
    const firstRow = document.querySelector(PASSENGER_REMOVE_ROW);
    await firstRow.click();
    for (let index = 0; index < copyPassengerNames.length; index++) {
      await addNextRow();
      selectAutocompleteOption(index, copyPassengerNames[index]);
      await delay(1000);
    }
  }
  
  let lastRowIndex = copyPassengerNames.length-1;
  let row = document.querySelectorAll(PASSENGER_COMPONENT)[lastRowIndex];
  var ageInput = row.querySelector(PASSENGER_AGE_INPUT);
  // Wait until the age input field is not empty
  while (ageInput && ageInput.value === '') {
    // Wait for 500 milliseconds before checking again
    await delay(500);
  }
}
function fillCustomPassengerDetails(passenger, row = null) {
  // If row is not provided, select the last added row
  if (!row) {
    row = document.querySelector(PASSENGER_COMPONENT);
  }

  var nameInput = row.querySelector(PASSENGER_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_AGE_INPUT);
  var genderSelect = row.querySelector(PASSENGER_GENDER_INPUT);
  var preferenceSelect = row.querySelector(PASSENGER_BERTH_CHOICE);
  
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
}
async function addCustomPassengerList() {
  // If there's only one passenger in the list and the row is already available, fill it directly
  if (passengerList.length === 1 && passengerList[0].isSelected) {
    fillCustomPassengerDetails(passengerList[0]);
  } else {
    // Remove the default row if there's more than one passenger
    await removeFirstRow();
    delay(50);
    // Iterate over each passenger in the passengerList array
    for (var i = 0; i < passengerList.length; i++) {
      if (!passengerList[i].isSelected) continue;

      var passenger = passengerList[i];
      // Add a new row for each passenger
      await addNextRow();
      delay(50);
      var rows = document.querySelectorAll(PASSENGER_COMPONENT);
      var currentRow = rows[rows.length - 1];

      fillCustomPassengerDetails(passenger, currentRow);

      delay(100);
    }
  }
}
async function selectPaymentType() {
  // Find all input elements of type radio
  var inputs = document.querySelectorAll(PAYMENT_TYPE);

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
        console.log('Clicked on radio button for:', paymentType);
        return; // Exit the loop after clicking the input radio
      }
    }
  }
}
async function addPassengerInputAndContinue() {
  const startTime = new Date(); // Record the start time
  // fill all passenger list
  if(masterData){
    await addMasterPassengerList();
  }
  else{
    await addCustomPassengerList();
  }
  delay(500);
  // Call the function to select the radio button
  await selectPaymentType();
  delay(50);

  // Find the "Continue" button
  var continueButton = document.querySelector(PASSENGER_SUBMIT_BUTTON);
  // Check if the button exists
  if (continueButton) {
    continueButton.focus();
    // Simulate a click on the button
    await continueButton.click();
  } else {
    console.log('Continue button not found.');
  }
   // Proceed with booking the ticket
   const endTime = new Date(); // Record the end time
   console.log(
     'Add Passenger Input Page Time taken:',
     endTime - startTime,
     'ms'
   );
   console.log(endTime);
}
async function handleCaptchaAndContinue() {
  await waitForElementToAppear(REVIEW_CAPTCHA_IMAGE);
  // Find the captcha input element
  var captchaInput = document.getElementById(REVIEW_CAPTCHA_INPUT);

  // Scroll the captcha input field into view smoothly
  if (captchaInput) {
    await scrollToElement(captchaInput);
  }
  delay(100);
  // Prompt the user to enter the captcha value
  var trainHeader = document.querySelector(REVIEW_TRAIN_HEADER);
  var available = trainHeader.querySelector(REVIEW_AVAILABLE);
  var waitingList = trainHeader.querySelector(REVIEW_WAITING);
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
  var continueButton = document.querySelector(REVIEW_SUBMIT_BUTTON);

  // Click the "Continue" button
  if (continueButton) {
    await continueButton.click();
  }
}
async function selectPaymentMethod() {
  // Find all elements with the class "bank-type" and "ng-star-inserted"
  var elements = document.querySelectorAll(PAYMENT_METHOD);

  // Check if elements exist
  if (elements.length > 0) {
    // Loop through each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Check if the element's text content matches "BHIM/ UPI/ USSD"
      if (textIncludes(element.textContent, paymentMethod)) {
        // Click on the element
        await element.click();
        console.log('Clicked on :', paymentMethod);
        return; // Exit the loop after clicking the element
      }
    }
  } else {
    console.log('No elements found with the specified classes.');
  }
}
async function selectPaymentProvider() {
  // Find all elements with the class "bank-text"
  var elements = document.querySelectorAll(PAYMENT_PROVIDER);

  // Check if elements exist
  if (elements.length > 0) {
    // Loop through each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Check if the element's text content contains "PAYTM"
      if (textIncludes(element.textContent, paymentProvider)) {
        // Simulate a click on the element
        await element.click();
        console.log('Selected text:', element.textContent);
        return; // Exit the loop after selecting the text
      }
    }
  }
  console.log("No text found containing",paymentProvider);
}
async function clickPayButton() {
  // Find the button with the class "btn-primary" and "ng-star-inserted"
  var button = document.querySelector(PAY_BUTTON);

  // Check if the button exists and its text content contains "Pay"
  if (button && textIncludes(button.textContent, PAY_BUTTON_TEXT)) {
    // Simulate a click on the button
    await button.click();
    console.log('Clicked on button:', button.textContent);
  } else {
    console.log("No button found containing 'Pay'.");
  }
}
function waitForTargetTime(targetTimeString) {
  // Define the interval function
  const intervalId = setInterval(() => {
    // Extract the current time element
    const currentTimeElement = document.querySelector(CURRENT_TIME);

    if (!currentTimeElement) {
      console.error('Current time element not found.');
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
      const searchButton = document.querySelector(JOURNEY_SEARCH_BUTTON);
      if (searchButton) {
        searchButton.click();
      } else {
        console.log('Search button not found.');
      }
      clearInterval(intervalId); // Stop the interval once the action is triggered
    }
  }, 1000); // Interval set to 1 second (1000 milliseconds)
}
function getSettings() {
  chrome.storage.local.get(defaultSettings, function (items, error) {
    if (error) {
      console.error("Error retrieving settings:", error);
      // Handle the error here, maybe use default values
      return;
    }
    // Now 'items' will contain all the settings, either retrieved from storage or the defaults
    username = items.username;
    password = items.password;
    targetTime = items.targetTime;
    passengerList = items.passengerList;
    masterData = items.masterData;
    passengerNames = items.passengerNames;
    trainNumber = items.trainNumber;
    from = items.from;
    to = items.to;
    quotaType = items.quotaType;
    accommodationClass = items.accommodationClass;
    dateString = items.dateString;
    refreshTime = items.refreshTime;
    autoPay = items.autoPay;
    paymentType = items.paymentType;
    paymentMethod = items.paymentMethod;
    paymentProvider = items.paymentProvider;
    autoProcessPopup = items.autoProcessPopup;
  });
}
function getAutomationStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(
      {
        automationStatus: false, // Default value if not found
      },
      function (items) {
        const automationStatus = items.automationStatus;
        resolve(automationStatus);
      }
    );
  });
}
async function executeFunctions() { 
  const currentAutomationStatus = await getAutomationStatus();
  if (!currentAutomationStatus) return;
  // read the passenger information for ticket booking
  getSettings();

  // wait for home page to load
  await waitForElementToAppear(APP_HEADER);

  // login page < Page 0 > (a prompt will appear to fill captcha)
  await login();
  await waitForAppLoginToDisappear();
  await callSearchTrainComponent();
  waitForTargetTime(targetTime);
  
  // wait for train list page to load
  await waitForElementToAppear(TRAIN_LIST_COMPONENT);

  // select train and accommodation class < Page 1 >
  await bookTicket();

  if(autoProcessPopup){
    closePopupToProceed();
  }

  // Wait for passenger page to load
  await waitForElementToAppear(PASSENGER_APP_COMPONENT);

  // Passenger Input and Payment Type < Page 2 >
  await addPassengerInputAndContinue();

  // Wait for the ticket review and Captcha page load
  await waitForElementToAppear(REVIEW_COMPONENT);

  // Review and Captcha <Page 3>   (a prompt will appear to fill captcha)
  await handleCaptchaAndContinue();

  // Wait for the app-payment-options element to appear on the page after the transition
  await waitForElementToAppear(PAYEMENT_COMPONENT);

  // Payment Selection <Page 4>
  await selectPaymentMethod();
  await selectPaymentProvider();

  if(autoPay){
    await clickPayButton();
    // now scan the QR and do the the payment
  }
 
}

executeFunctions();
