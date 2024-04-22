/* if multiple passenger provide comma separated passenger name
(name should match with irctc master data ) */

const username = '';
const password = '';
let passengerNames = 'Deepak';
let trainNumber = '11061';
let from = 'LTT';
let to = 'BSB';
let quotaType = 'TATKAL';
let accommodationClass = '3A';
let dateString = '23/04/2024';
let refreshTime = 5000; // 5 seconds;
const paymentType = 'BHIM/UPI'; // Rs 20 chargs for bhim/upi, Rs 30 for cards / net banking
const paymentMethod = 'BHIM/ UPI/ USSD';
const paymentProvider = 'PAYTM'; // paytm or amazon
const payButton = 'Pay & Book ';

var intervalId;
let copyPassengerNames = '';
let trainFoundAtPosition = -1;

// Function to wait for the insertion of elements with a specific class
function waitForElementInsertion(className) {
  return new Promise((resolve) => {
    // Create a new mutation observer
    const observer = new MutationObserver((mutations) => {
      // Loop through the mutations
      mutations.forEach((mutation) => {
        // Check if any nodes were added
        if (mutation.addedNodes.length > 0) {
          // Check if any of the added nodes match the specified class
          const matchingNode = Array.from(mutation.addedNodes).find((node) =>
            node.classList.contains(className)
          );
          if (matchingNode) {
            // If a matching node is found, stop observing and resolve the promise
            observer.disconnect();
            resolve();
          }
        }
      });
    });

    // Start observing the document for mutations
    observer.observe(document.body, {
      childList: true, // Observe changes to the children of the body
      subtree: true, // Include all descendants of the body
    });
  });
}
// Define a function to wait for an element to appear on the page
async function waitForElementToAppear(selector) {
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      const element = document.querySelector(selector);
      if (element) {
        console.log('element loaded',element);
        clearInterval(interval);
        resolve();
      }
    }, 500); // Adjust the interval as needed
  });
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
  var captchaInput = document.querySelector('app-captcha #captcha');

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
  let loginButton = document.querySelector('app-header a.loginText')
  if(loginButton){
    await loginButton.click();
  }
  await waitForElementToAppear('app-login');
  await waitForElementToAppear('app-captcha .captcha-img');

  let loginModal = document.querySelector('app-login');

  if (!loginModal) return;

  const usernameInput = loginModal.querySelector(
    'input[formcontrolname="userid"]'
  );
  const passwordInput = loginModal.querySelector(
    'input[formcontrolname="password"]'
  );
  await simulateTyping(usernameInput, username);
  await simulateTyping(passwordInput, password);
  await fillLoginCaptcha();

  const signInButton = loginModal.querySelector('button[type="submit"]');
  await signInButton.click();
  delay(1000);
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

  var firstItem = document.querySelector('.ui-autocomplete-items li');
  if (firstItem) {
    await firstItem.click();
  }
}
async function selectDate() {
  // Find the input element of the PrimeNG calendar
  const calendarInput = document.querySelector('#jDate input');

  // Set the value of the input field to the desired date string
  calendarInput.value = dateString;

  // Wait for a short delay to ensure the date picker UI reacts to the changes
  await delay(500);

  // Dispatch various events to simulate user interaction
  calendarInput.dispatchEvent(new Event('input')); // Trigger input event
  calendarInput.dispatchEvent(new Event('keydown')); // Trigger keydown event
  calendarInput.dispatchEvent(new Event('focus')); // Trigger focus event
  calendarInput.dispatchEvent(new Event('click')); // Trigger click event
  calendarInput.dispatchEvent(new Event('blur')); // Trigger blur event
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
  var listItems = document.querySelectorAll('#journeyQuota p-dropdownitem span');

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
  let journeyInput = document.querySelector('app-jp-input');
  let origin = journeyInput.querySelector('#origin input');
  let destination = journeyInput.querySelector('#destination input');
  let quota = journeyInput.querySelector('#journeyQuota>div');
  let jDate = journeyInput.querySelector('#jDate input');

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
  const searchButton = journeyInput.querySelector('button[type="submit"]');
  await searchButton.click();
}
// Function to update Journey Details
async function modifySearchTrain(){
  let journeyInput = document.querySelector('app-modify-search');
  let origin = journeyInput.querySelector('#origin input');
  let destination = journeyInput.querySelector('#destination input');
  let quota = journeyInput.querySelector('#journeyQuota>div');
  let jDate = journeyInput.querySelector('#journeyDate input');

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
  const searchButton = journeyInput.querySelector('button[type="submit"]');
  await searchButton.click();
}
async function callSearchTrainComponent(){
  let journeyComponent = document.querySelector('app-jp-input');
  
  if(journeyComponent){
    await searchTrain();
  }
  else{
    await modifySearchTrain();
  }
}
async function findRootTrain() {
  const trainHeadingElements = document.querySelectorAll(
    'app-train-avl-enq .train-heading'
  );

  if (!trainHeadingElements || !trainHeadingElements.length) {
    console.log('No Available Trains');
    return null;
  }

  let rootElement = null;
  for (let i = 0; i < trainHeadingElements.length; i++) {
    const trainHeadingElement = trainHeadingElements[i];
    if (textIncludes(trainHeadingElement.textContent, trainNumber)) {
      rootElement = trainHeadingElement.closest('app-train-avl-enq');
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

  let rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];

  rootElement.scrollIntoView({ behavior: 'smooth', block: 'center' });

  const availableClasses = rootElement.querySelectorAll('.pre-avl');
  if (!availableClasses || !availableClasses.length) {
    console.log('No available classes found.');
    return;
  }

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
  await selectedClass.click();

  console.log(
    'Selected train number:',
    trainNumber,
    ', and accommodation class:',
    accommodationClass
  );
}
// select first available date in selected Class
async function selectAvailableTicket() {
  let rootElement=document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];

  // Select the first available date
  const availableDate = rootElement.querySelector('.pre-avl');

  if (availableDate) {
    await availableDate.click();
  }
}
// refresh the train by clicking selected open class tab
async function refreshTrain() {
  try {
    const rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];

    const selectedTab = rootElement.querySelector(
      'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div'
    );

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
async function bookTicket() {
  await findRootTrain();

  // No train found;
  if (trainFoundAtPosition === -1) return;

  await scrollToFoundTrainAndSelectClass();

  await delay(500);

  let rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];

  let bookTicketButton = rootElement.querySelector('button.btnDefault.train_Search');

  while (bookTicketButton) {
    await selectAvailableTicket(); // Select available ticket

    rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition]; // Update the root element reference
    bookTicketButton = rootElement.querySelector('button.btnDefault.train_Search'); // Update the button reference
    
    if (!bookTicketButton.classList.contains('disable-book')) {
      // If the button is enabled, break the loop
      break;
    } else {
      await refreshTrain(); // If button is disabled, refresh the train
      await delay(refreshTime); // Add a delay before checking the button state again
    }
  }

  // Proceed with booking the ticket
  bookTicketButton.click();
}
// Function to check for the presence of the popup and close it if it exists
function closePopupIfPresent() {
  let popup = document.querySelector('.popup-element');
  if (popup) {
    // Close the popup by clicking the close button or any other suitable action
    popup.querySelector('.close-button').click();
    console.log('Popup closed.');
  } else {
    console.log('Popup not found.');
  }
}
async function selectPassenger(index, item) {
  try {
    if (item) {
      var ageInput = document.querySelectorAll(
        'app-passenger input[formcontrolname="passengerAge"]'
      )[index];

      // Wait until the age input field is not empty
      while (ageInput && ageInput.value === '') {
        await item.click();
        // Wait for 500 milliseconds before checking again
        await delay(200);
      }
      console.log('selected item:', item.textContent.trim());
    }
  } catch (error) {
    console.error('Error selecting item:', error);
  }
}
function fillInputData(index = 0, name = passengerNames) {
  return new Promise((resolve, reject) => {
    // Find the autocomplete input element
    var rows = document.querySelectorAll('app-passenger');

    var passengerNameInput = rows[index].querySelector(
      'p-autocomplete[formcontrolname="passengerName"] input'
    );

    // Focus on the autocomplete input to trigger the generation of options
    passengerNameInput.focus();

    // Set the input value
    passengerNameInput.value = name;

    // Simulate an input event to trigger the autocomplete options
    var inputEvent = new Event('input', {
      bubbles: true,
      cancelable: true,
    });
    passengerNameInput.dispatchEvent(inputEvent);

    delay(500);

    // Get all list items within the autocomplete dropdown
    var listItems = document.querySelectorAll('app-passenger .ui-autocomplete-items li');

    for (let item of listItems) {
      // Get the text content of the list item
      const itemText = item.textContent.trim();

      // Check if the text content contains the name substring (case-insensitive)
      if (itemText.toLowerCase().includes(name.toLowerCase())) {
        // Select the list item by simulating a click
        selectPassenger(index, item)
          .then(() => {
            resolve(); // Resolve the Promise once passenger is selected
          })
          .catch((error) => {
            reject(error); // Reject the Promise if there's an error
          });
        break;
      }
    }
  });
}
function processInput() {
  copyPassengerNames = passengerNames.split(',');

  if (copyPassengerNames.length === 0) {
    console.log('No passenger names found.');
  }
}
async function addNextRow() {
  const prenextSpan = document.querySelector(
    'app-passenger-input p-panel .prenext'
  );

  if (prenextSpan && prenextSpan.textContent.trim() === '+ Add Passenger') {
    await prenextSpan.closest('a').click();
  } else {
    console.log('Span text does not match or element not found.');
  }
}
async function fillAllPassenger() {
  processInput();
  if (copyPassengerNames.length === 1) {
    fillInputData();
    delay(500);
    return;
  }

  const firstRow = document.querySelector(
    'app-passenger-input p-panel a.fa-remove'
  );
  await firstRow.click();

  for (let index = 0; index < copyPassengerNames.length; index++) {
    await addNextRow();
    await fillInputData(index, copyPassengerNames[index]);
    delay(500);
  }
}
async function selectPaymentType() {
  // Find all input elements of type radio
  var inputs = document.querySelectorAll(
    'input[type="radio"][name="paymentType"]'
  );

  if (inputs) {
    // Loop through each input element using for...of loop
    for (let input of inputs) {
      // Get the corresponding label element
      var label = input && input.closest('label');

      // Check if the label element exists and its text content matches the specified text
      if (label && textIncludes(label.textContent, paymentType)) {
        // Trigger a click event on the input radio element
        await input.click();
        console.log('Clicked on radio button for:', paymentType);
        return; // Exit the loop after clicking the input radio
      }
    }
  }
}
async function waitForPassengerAgeInput() {
  // Find the age input field
  var ageInput = document.querySelector(
    'input[formcontrolname="passengerAge"]'
  );

  // Wait until the age input field is not empty
  while (ageInput && ageInput.value === '') {
    // Wait for 500 milliseconds before checking again
    await delay(200);
  }
}
async function addPassengerInputAndContinue() {
  // Call the function to fill passenger name in autocomplete field
  //await fillInputData();

  // for single and multiple passengers separated by commas and matching unique with master data
  await fillAllPassenger();

  // Wait for the age input field to be filled
  await waitForPassengerAgeInput();

  // Call the function to select the radio button
  await selectPaymentType();

  // Find the "Continue" button
  var continueButton = document.querySelector(
    'app-passenger-input button.btnDefault.train_Search'
  );

  // Check if the button exists
  if (continueButton) {
    // Simulate a click on the button
    await continueButton.click();
  } else {
    console.log('Continue button not found.');
  }
}
async function handleCaptchaAndContinue() {
  await waitForElementToAppear('app-captcha .captcha-img');
  // Find the captcha input element
  var captchaInput = document.getElementById('captcha');

  // Scroll the captcha input field into view smoothly
  if (captchaInput) {
    await scrollToElement(captchaInput);
  }
  delay(100);
  // Prompt the user to enter the captcha value
  var trainHeader = document.querySelector('app-train-header');
  var available = trainHeader.querySelector('.AVAILABLE');
  var waitingList = trainHeader.querySelector('.WL');
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
  var continueButton = document.querySelector(
    'app-review-booking button.btnDefault.train_Search'
  );

  // Click the "Continue" button
  if (continueButton) {
    await continueButton.click();
  }
}
async function selectPaymentMethod() {
  // Find all elements with the class "bank-type" and "ng-star-inserted"
  var elements = document.querySelectorAll('.bank-type.ng-star-inserted');

  // Check if elements exist
  if (elements.length > 0) {
    // Loop through each element
    for (var i = 0; i < elements.length; i++) {
      var element = elements[i];
      // Check if the element's text content matches "BHIM/ UPI/ USSD"
      if (textIncludes(element.textContent, paymentMethod)) {
        // Click on the element
        await element.click();
        console.log('Clicked on element:', element);
        return; // Exit the loop after clicking the element
      }
    }
  } else {
    console.log('No elements found with the specified classes.');
  }
}
async function selectPaymentProvider() {
  // Find all elements with the class "bank-text"
  var elements = document.querySelectorAll('.bank-text');

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
  console.log("No text found containing 'PAYTM'.");
}
async function clickPayButton() {
  // Find the button with the class "btn-primary" and "ng-star-inserted"
  var button = document.querySelector('.btn-primary.ng-star-inserted');

  // Check if the button exists and its text content contains "Pay"
  if (button && textIncludes(button.textContent, payButton)) {
    // Simulate a click on the button
    await button.click();
    console.log('Clicked on button:', button.textContent);
  } else {
    console.log("No button found containing 'Pay'.");
  }
}
async function executeFunctions() {
  // wait for home page to load
  await waitForElementToAppear('app-header');
  // login page
  await login();

  await callSearchTrainComponent();

  // wait for train list page to load
  await waitForElementToAppear('app-train-list');

  // select train and accommodation class < Page 1 >
  await bookTicket();

  // Wait for passenger page to load
  await waitForElementToAppear('app-passenger-input');

  // Passenger Input and Payment Type < Page 2 >
  await addPassengerInputAndContinue();

  // Wait for the ticket review and Captcha page load
  await waitForElementToAppear('app-review-booking');

  // Review and Captcha <Page 3>
  await handleCaptchaAndContinue();

  // Wait for the app-payment-options element to appear on the page after the transition
  await waitForElementToAppear('app-payment-options');

  // Payment Selection <Page 4>
  await selectPaymentMethod();
  await selectPaymentProvider();
  //await clickPayButton();
}

executeFunctions();
