
let automationStatus = false;
let username = '';
let password = '';
let targetTime ='10:00:00'
let passengerList = [];
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

const allKeys = [
  "username", "password", "targetTime", "passengerList", "trainNumber",
  "from", "to", "quotaType", "accommodationClass", "dateString", "refreshTime",
  "autoPay", "paymentType", "paymentMethod", "paymentProvider"
];

const payButton = 'Pay & Book ';
var intervalId;
let trainFoundAtPosition = -1;
let isAvlEnquiryCompleted = false;
let mutationCompletionCounter = 0;

// Define a function to wait for an element to appear on the page
async function waitForElementToAppear(selector) {
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

  var firstItem = document.querySelector('.ui-autocomplete-items li');
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
// Function to wait for the app-login element to disappear
async function waitForAppLoginToDisappear() {
  // Select the app-login element
  const appLogin = document.querySelector('app-login');

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
  let journeyInput = document.querySelector('app-jp-input');
  let origin = journeyInput.querySelector('#origin input');
  let destination = journeyInput.querySelector('#destination input');
  let quota = journeyInput.querySelector('#journeyQuota>div');
  let jDate = journeyInput.querySelector('#jDate input');

  await autoComplete(origin,from);
  await autoComplete(destination,to);
  await typeDate(jDate,dateString);
  await selectQuota(quota,quotaType);
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
  delay(500);
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
    const rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];
    const selectedTab = rootElement.querySelector(
      'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div'
    );
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
  let rootElement = document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];

  // Select the first available date
  const availableDateElement = rootElement.querySelector('.pre-avl');

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
      const bookTicketButton = rootElement.querySelector('button.btnDefault.train_Search');
      if (bookTicketButton && !bookTicketButton.classList.contains('disable-book')) {
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
        if (node.matches('.link.ng-star-inserted')) {
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
  document.querySelectorAll('app-train-avl-enq')[trainFoundAtPosition];
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
  let popup = document.querySelector('p-confirmdialog[key="tofrom"]');
  
  if (popup) {
    // Close the popup by clicking the close button or any other suitable action
    document.querySelector('.ui-confirmdialog-acceptbutton').click();
    console.log('Popup closed.');
  } else {
    console.log('Popup not found.');
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
async function removeFirstRow(){
  // delete the first row
  const firstRow = document.querySelector(
    'app-passenger-input p-panel a.fa-remove'
  );
  if(firstRow){
    await firstRow.click();
  }
}
function fillPassengerDetails(passenger, row = null) {
  // If row is not provided, select the last added row
  if (!row) {
    row = document.querySelector('app-passenger');
  }

  var nameInput = row.querySelector('p-autocomplete[formcontrolname="passengerName"] input');
  var ageInput = row.querySelector('input[formcontrolname="passengerAge"]');
  var genderSelect = row.querySelector('select[formcontrolname="passengerGender"]');
  var preferenceSelect = row.querySelector('select[formcontrolname="passengerBerthChoice"]');
  
  nameInput.value = passenger.name;
  ageInput.value = passenger.age;
  genderSelect.value = passenger.gender;
  preferenceSelect.value = passenger.preference;

  nameInput.dispatchEvent(new Event('input'));
  ageInput.dispatchEvent(new Event('input'));
  preferenceSelect.dispatchEvent(new Event('change'));
  genderSelect.dispatchEvent(new Event('change'));

}
async function addPassengerList() {
  // If there's only one passenger in the list and the row is already available, fill it directly
  if (passengerList.length === 1 && passengerList[0].isSelected) {
    fillPassengerDetails(passengerList[0]);
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
      var rows = document.querySelectorAll('app-passenger');
      var currentRow = rows[rows.length - 1];

      fillPassengerDetails(passenger, currentRow);

      delay(100);
    }
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
  await addPassengerList();
  delay(100);

  // Call the function to select the radio button
  await selectPaymentType();
  delay(50);

  // Find the "Continue" button
  var continueButton = document.querySelector(
    'app-passenger-input button.btnDefault.train_Search'
  );
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
  console.log("No text found containing",paymentProvider);
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
function waitForTargetTime() {
  // Define the interval function
  intervalId = setInterval(() => {
    // Extract the current time element
    const currentTimeElement = document.querySelector('app-header .h_head1>span strong');

    if (!currentTimeElement) {
      console.error('Current time element not found.');
      return;
    }

    // Extract the current time string from the element
    const currentTimeString = currentTimeElement.textContent.trim();
    const [, timeString] = currentTimeString.match(/\[(\d+:\d+:\d+)\]/);

    // Split the current time string and target time string on ":"
    const [currentHour, currentMinute, currentSecond] = timeString.split(':').map(Number);
    const [targetHour, targetMinute, targetSecond] = targetTime.split(':').map(Number);

    // Compare the current time with the target time
    if (currentHour >= targetHour && currentMinute >= targetMinute && currentSecond >= targetSecond) {
      const searchButton = document.querySelector('button[type="submit"][label="Find Trains"].search_btn.train_Search');
      if (searchButton) {
        searchButton.click();
        clearInterval(intervalId); // Stop the interval once the action is triggered
      } else {
        console.error('Search button not found.');
      }
    }
  }, 1000); // Interval set to 1 second (1000 milliseconds)
}
function getSettings() {

  chrome.storage.local.get(allKeys, function (items,error) {
    if (error) {
      console.error("Error retrieving settings:", error);
      // Handle the error here, maybe use default values
      return;
    }
    username = items.username || '';
    password = items.password || '';
    targetTime = items.targetTime || '10:00:00';
    passengerList = items.passengerList || [];
    trainNumber = items.trainNumber || '';
    from = items.from || '';
    to = items.to || '';
    quotaType = items.quotaType || '';
    accommodationClass = items.accommodationClass || '';
    dateString = items.dateString || '';
    refreshTime = items.refreshTime || 5000;
    autoPay = items.autoPay || false;
    paymentType = items.paymentType || 'BHIM/UPI' ;
    paymentMethod = items.paymentMethod || 'BHIM/ UPI/ USSD';
    paymentProvider = items.paymentProvider || 'PAYTM';
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
  await waitForElementToAppear('app-header');

  // login page < Page 0 > (a prompt will appear to fill captcha)
  await login();
  await waitForAppLoginToDisappear();
  await callSearchTrainComponent();
  waitForTargetTime();
  
  // wait for train list page to load
  await waitForElementToAppear('app-train-list');

  // select train and accommodation class < Page 1 >
  await bookTicket();

  if(autoProcessPopup){
    closePopupToProceed();
  }

  // Wait for passenger page to load
  await waitForElementToAppear('app-passenger-input');

  // Passenger Input and Payment Type < Page 2 >
  await addPassengerInputAndContinue();

  // Wait for the ticket review and Captcha page load
  await waitForElementToAppear('app-review-booking');

  // Review and Captcha <Page 3>   (a prompt will appear to fill captcha)
  await handleCaptchaAndContinue();

  // Wait for the app-payment-options element to appear on the page after the transition
  await waitForElementToAppear('app-payment-options');

  // Payment Selection <Page 4>
  await selectPaymentMethod();
  await selectPaymentProvider();

  if(autoPay){
    await clickPayButton();
    // now scan the QR and do the the payment
  }
 
}

executeFunctions();
