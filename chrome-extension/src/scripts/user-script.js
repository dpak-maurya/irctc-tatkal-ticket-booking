import Logger from './logger';
import extractTextFromImage from './ocr-reader';


let automationStatus = false;
let username = '';
let password = '';
let targetTime ='09:59:53'
let passengerList = [];
let masterData = false;
let passengerNames = '';
let trainNumber = '';
let from = '';
let to = '';
let quotaType = '';
let isOpeningDayBooking = false;
let accommodationClass = '';
let dateString = '';
let refreshTime = 5000; // 5 seconds;
let paymentType = 'BHIM/UPI'; // Rs 20 chargs for bhim/upi, Rs 30 for cards / net banking / wallets
let paymentMethod = 'BHIM/ UPI/ USSD';   // or IRCTC eWallet
let paymentProvider = 'PAYTM'; // paytm, amazon 
let autoPay = false;  // auto click on pay button
let autoProcessPopup = false;
let mobileNumber = '';
let autoUpgradation = false;
let confirmberths = false;
let travelInsuranceOpted = 'yes';
let autoSolveCaptcha = false;
let autoSubmitCaptcha = false;

const STORAGE_KEY = 'tatkalTicketBookingFormData';

const defaultSettings = {
  automationStatus: false,
  username: '',
  password: '',
  targetTime: '09:59:53',
  passengerList: [],
  masterData: false,
  passengerNames: [],
  trainNumber: '',
  from: '',
  to: '',
  quotaType: '',
  isOpeningDayBooking: false,
  accommodationClass: '',
  dateString: '',
  refreshTime: 5000,
  paymentType: 'BHIM/UPI',
  paymentMethod: 'BHIM/ UPI/ USSD',
  paymentProvider: 'PAYTM',
  autoPay: false,
  autoProcessPopup: false,
  mobileNumber:'',
  autoUpgradation:false,
  confirmberths:false,
  travelInsuranceOpted:'yes',
  autoSolveCaptcha:false,
  autoSubmitCaptcha:false
};


var intervalId;
let trainFoundAtPosition = -1;
let isAvlEnquiryCompleted = false;
let mutationCompletionCounter = 0;
let copyPassengerNames = '';

// --- DOM Selectors (overridable via Selector Editor in options page) ---

let APP_HEADER = 'app-header';

// Login Element 
let LOGIN_BUTTON = 'app-header a.loginText';
let LOGIN_COMPONENT = 'app-login';
let LOGIN_USERID = 'input[formcontrolname="userid"]';
let LOGIN_PASSWORD = 'input[formcontrolname="password"]';
let LOGIN_CAPTCHA_IMAGE = 'app-captcha .captcha-img';
let LOGIN_CAPTCHA_INPUT = 'app-captcha #captcha';

// Search Journey Element
let JOURNEY_INPUT_COMPONENT = 'app-jp-input';
let ORIGIN_STATION_CODE = '#origin input';
let DESTINATION_STATION_CODE = '#destination input';
let STATION_CODE_LIST = '.ui-autocomplete-items li';
let JOURNEY_QUOTA = '#journeyQuota>div';
let JOURNEY_QUOTA_LIST = '#journeyQuota p-dropdownitem span';
let JOURNEY_DATE = '#jDate input';
let CURRENT_TIME = 'app-header .h_head1>span strong';
let JOURNEY_SEARCH_BUTTON = 'app-jp-input button[type="submit"].search_btn';

// Modify Search Train Element 
let MODIFY_SEARCH_COMPONENT = 'app-modify-search';
let MODIFY_JOURNEY_DATE = '#journeyDate input';

// TRAIN LIST 
let TRAIN_LIST_COMPONENT = 'app-train-list';
let TRAIN_COMPONENT = 'app-train-avl-enq';
let FIND_TRAIN_NUMBER = 'app-train-avl-enq .train-heading';
let AVAILABLE_CLASS = '.pre-avl';
let SELECTED_CLASS_TAB = 'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div';
let BOOK_NOW_BUTTON = 'button.btnDefault.train_Search';
let BUTTON_DISABLE_CLASS = 'disable-book';
let LINK_INSERTED = '.link.ng-star-inserted';

// POP UP
let DIALOG_FROM = 'p-confirmdialog[key="tofrom"]';
let DIALOG_ACCEPT = '.ui-confirmdialog-acceptbutton';

// Pasenger Input
let PASSENGER_APP_COMPONENT = 'app-passenger-input';
let PASSENGER_COMPONENT = 'app-passenger';
let PASSENGER_NEXT_ROW = 'app-passenger-input p-panel .prenext';
let PASSENGER_NEXT_ROW_TEXT = '+ Add Passenger';
let PASSENGER_REMOVE_ROW = 'app-passenger-input p-panel a.fa-remove';
let PASSENGER_INPUT_COMPONENT = 'app-passenger-input';
let PASSENGER_NAME_INPUT = 'p-autocomplete input';
let PASSENGER_NAME_LIST = '.ui-autocomplete-items li';
let PASSENGER_AGE_INPUT = 'input[formcontrolname="passengerAge"]';
let PASSENGER_GENDER_INPUT = 'select[formcontrolname="passengerGender"]';
let PASSENGER_BERTH_CHOICE = 'select[formcontrolname="passengerBerthChoice"]';
let PASSENGER_FOOD_CHOICE = 'select[formcontrolname="passengerFoodChoice"]';
let PASSENGER_MOBILE_NUMBER = 'mobileNumber';
let PASSENGER_PREFERENCE_AUTOUPGRADATION = 'autoUpgradation';
let PASSENGER_PREFERENCE_CONFIRMBERTHS = 'confirmberths';
let PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED = 'input[type="radio"][name="travelInsuranceOpted-0"]';
let PASSENGER_SUBMIT_BUTTON = 'app-passenger-input button.btnDefault.train_Search';
let PASSENGER_PAYMENT_TYPE = 'p-radiobutton[name="paymentType"] input';

// Review Ticket and Fill Captcha
let REVIEW_COMPONENT = 'app-review-booking';
let REVIEW_TRAIN_HEADER = 'app-train-header';
let REVIEW_CAPTCHA_IMAGE = 'app-captcha .captcha-img';
let REVIEW_CAPTCHA_INPUT = 'captcha';
let REVIEW_AVAILABLE = '.AVAILABLE';
let REVIEW_WAITING = '.WL';
let REVIEW_SUBMIT_BUTTON = 'app-review-booking button.btnDefault.train_Search';

// Payment Details
let PAYMENT_COMPONENT = 'app-payment-options';
let PAYMENT_TYPE = '#pay-type .bank-type';
let PAYMENT_METHOD = '#pay-type .bank-type';
let PAYMENT_PROVIDER = '#bank-type .bank-text, #bank-type .pay_tax_text';
let PAY_BUTTON ='button.btn-primary.ng-star-inserted';
let PAY_BUTTON_TEXT = 'Pay & Book ';


let EWALLET_IRCTC_DEFAULT = 'E-Wallet';
let EWALLET_COMPONENT = 'app-ewallet-confirm';
let EWALLET_BUTTON_LIST = 'button.mob-bot-btn.search_btn';
let EWALLET_CONFIRM_BUTTON_TEXT = 'CONFIRM';

// --- Selector Override System ---
// Loads user-customized selectors from chrome.storage and applies them
// This allows users to fix broken selectors when IRCTC changes their HTML

const CUSTOM_SELECTORS_STORAGE_KEY = 'customDomSelectors';

const SELECTOR_VAR_MAP = {
  APP_HEADER: (v) => { APP_HEADER = v; },
  LOGIN_BUTTON: (v) => { LOGIN_BUTTON = v; },
  LOGIN_COMPONENT: (v) => { LOGIN_COMPONENT = v; },
  LOGIN_USERID: (v) => { LOGIN_USERID = v; },
  LOGIN_PASSWORD: (v) => { LOGIN_PASSWORD = v; },
  LOGIN_CAPTCHA_IMAGE: (v) => { LOGIN_CAPTCHA_IMAGE = v; },
  LOGIN_CAPTCHA_INPUT: (v) => { LOGIN_CAPTCHA_INPUT = v; },
  JOURNEY_INPUT_COMPONENT: (v) => { JOURNEY_INPUT_COMPONENT = v; },
  ORIGIN_STATION_CODE: (v) => { ORIGIN_STATION_CODE = v; },
  DESTINATION_STATION_CODE: (v) => { DESTINATION_STATION_CODE = v; },
  STATION_CODE_LIST: (v) => { STATION_CODE_LIST = v; },
  JOURNEY_QUOTA: (v) => { JOURNEY_QUOTA = v; },
  JOURNEY_QUOTA_LIST: (v) => { JOURNEY_QUOTA_LIST = v; },
  JOURNEY_DATE: (v) => { JOURNEY_DATE = v; },
  CURRENT_TIME: (v) => { CURRENT_TIME = v; },
  JOURNEY_SEARCH_BUTTON: (v) => { JOURNEY_SEARCH_BUTTON = v; },
  MODIFY_SEARCH_COMPONENT: (v) => { MODIFY_SEARCH_COMPONENT = v; },
  MODIFY_JOURNEY_DATE: (v) => { MODIFY_JOURNEY_DATE = v; },
  TRAIN_LIST_COMPONENT: (v) => { TRAIN_LIST_COMPONENT = v; },
  TRAIN_COMPONENT: (v) => { TRAIN_COMPONENT = v; },
  FIND_TRAIN_NUMBER: (v) => { FIND_TRAIN_NUMBER = v; },
  AVAILABLE_CLASS: (v) => { AVAILABLE_CLASS = v; },
  SELECTED_CLASS_TAB: (v) => { SELECTED_CLASS_TAB = v; },
  BOOK_NOW_BUTTON: (v) => { BOOK_NOW_BUTTON = v; },
  BUTTON_DISABLE_CLASS: (v) => { BUTTON_DISABLE_CLASS = v; },
  LINK_INSERTED: (v) => { LINK_INSERTED = v; },
  DIALOG_FROM: (v) => { DIALOG_FROM = v; },
  DIALOG_ACCEPT: (v) => { DIALOG_ACCEPT = v; },
  PASSENGER_APP_COMPONENT: (v) => { PASSENGER_APP_COMPONENT = v; },
  PASSENGER_COMPONENT: (v) => { PASSENGER_COMPONENT = v; },
  PASSENGER_NEXT_ROW: (v) => { PASSENGER_NEXT_ROW = v; },
  PASSENGER_NEXT_ROW_TEXT: (v) => { PASSENGER_NEXT_ROW_TEXT = v; },
  PASSENGER_REMOVE_ROW: (v) => { PASSENGER_REMOVE_ROW = v; },
  PASSENGER_INPUT_COMPONENT: (v) => { PASSENGER_INPUT_COMPONENT = v; },
  PASSENGER_NAME_INPUT: (v) => { PASSENGER_NAME_INPUT = v; },
  PASSENGER_NAME_LIST: (v) => { PASSENGER_NAME_LIST = v; },
  PASSENGER_AGE_INPUT: (v) => { PASSENGER_AGE_INPUT = v; },
  PASSENGER_GENDER_INPUT: (v) => { PASSENGER_GENDER_INPUT = v; },
  PASSENGER_BERTH_CHOICE: (v) => { PASSENGER_BERTH_CHOICE = v; },
  PASSENGER_FOOD_CHOICE: (v) => { PASSENGER_FOOD_CHOICE = v; },
  PASSENGER_MOBILE_NUMBER: (v) => { PASSENGER_MOBILE_NUMBER = v; },
  PASSENGER_PREFERENCE_AUTOUPGRADATION: (v) => { PASSENGER_PREFERENCE_AUTOUPGRADATION = v; },
  PASSENGER_PREFERENCE_CONFIRMBERTHS: (v) => { PASSENGER_PREFERENCE_CONFIRMBERTHS = v; },
  PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED: (v) => { PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED = v; },
  PASSENGER_SUBMIT_BUTTON: (v) => { PASSENGER_SUBMIT_BUTTON = v; },
  PASSENGER_PAYMENT_TYPE: (v) => { PASSENGER_PAYMENT_TYPE = v; },
  REVIEW_COMPONENT: (v) => { REVIEW_COMPONENT = v; },
  REVIEW_TRAIN_HEADER: (v) => { REVIEW_TRAIN_HEADER = v; },
  REVIEW_CAPTCHA_IMAGE: (v) => { REVIEW_CAPTCHA_IMAGE = v; },
  REVIEW_CAPTCHA_INPUT: (v) => { REVIEW_CAPTCHA_INPUT = v; },
  REVIEW_AVAILABLE: (v) => { REVIEW_AVAILABLE = v; },
  REVIEW_WAITING: (v) => { REVIEW_WAITING = v; },
  REVIEW_SUBMIT_BUTTON: (v) => { REVIEW_SUBMIT_BUTTON = v; },
  PAYMENT_COMPONENT: (v) => { PAYMENT_COMPONENT = v; },
  PAYMENT_TYPE: (v) => { PAYMENT_TYPE = v; },
  PAYMENT_METHOD: (v) => { PAYMENT_METHOD = v; },
  PAYMENT_PROVIDER: (v) => { PAYMENT_PROVIDER = v; },
  PAY_BUTTON: (v) => { PAY_BUTTON = v; },
  PAY_BUTTON_TEXT: (v) => { PAY_BUTTON_TEXT = v; },
  EWALLET_IRCTC_DEFAULT: (v) => { EWALLET_IRCTC_DEFAULT = v; },
  EWALLET_COMPONENT: (v) => { EWALLET_COMPONENT = v; },
  EWALLET_BUTTON_LIST: (v) => { EWALLET_BUTTON_LIST = v; },
  EWALLET_CONFIRM_BUTTON_TEXT: (v) => { EWALLET_CONFIRM_BUTTON_TEXT = v; },
};

async function loadSelectorOverrides() {
  return new Promise((resolve) => {
    chrome.storage.local.get(CUSTOM_SELECTORS_STORAGE_KEY, (result) => {
      const overrides = result[CUSTOM_SELECTORS_STORAGE_KEY] || {};
      const overrideKeys = Object.keys(overrides);
      if (overrideKeys.length > 0) {
        Logger.info('Loading selector overrides:', overrideKeys);
        for (const key of overrideKeys) {
          if (SELECTOR_VAR_MAP[key] && overrides[key]) {
            Logger.info(`Applying override for ${key}:`, overrides[key]);
            SELECTOR_VAR_MAP[key](overrides[key]);
          }
        }
      }
      resolve();
    });
  });
}

// Enable/disable logging based on storage setting
chrome.storage.local.get('debugMode', function(result) {
  if (result.debugMode) {
    Logger.enable();
  } else {
    Logger.disable();
  }
});

// Define a function to wait for an element to appear on the page
async function waitForElementToAppear(selector, timeoutMs = 0) {
  Logger.info('Waiting for element:', selector, timeoutMs > 0 ? `(timeout: ${timeoutMs}ms)` : '');
  const startTime = Date.now();
  
  return new Promise((resolve) => {
    const interval = setInterval(() => {
      try {
        if (!selector || typeof selector !== 'string') {
          Logger.error('Invalid selector passed to waitForElementToAppear:', selector);
          clearInterval(interval);
          resolve(false);
          return;
        }
        
        const element = document.querySelector(selector);
        if (element) {
          clearInterval(interval);
          const endTime = Date.now();
          Logger.info(
            'Element loaded:',
            selector,
            'Time taken:',
            endTime - startTime,
            'ms'
          );
          resolve(true);
        } else if (timeoutMs > 0 && (Date.now() - startTime) > timeoutMs) {
          clearInterval(interval);
          Logger.info('Wait timed out for element:', selector);
          resolve(false);
        }
      } catch (e) {
        Logger.error('Error in waitForElementToAppear interval:', e);
        clearInterval(interval);
        resolve(false);
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

// --- GHOST CURSOR UTILITIES ---
window.virtualCursor = window.virtualCursor || { 
  x: Math.random() * window.innerWidth, 
  y: Math.random() * window.innerHeight,
  isActive: false
};

async function moveMouseTo(element) {
  if (!element) return;
  window.virtualCursor.isActive = true;
  
  const rect = element.getBoundingClientRect();
  
  // Humans rarely click the exact dead-center pixel. Add a random offset 
  // confined within the inner 60% of the element's bounding box.
  const offsetX = (Math.random() - 0.5) * (rect.width * 0.6);
  const offsetY = (Math.random() - 0.5) * (rect.height * 0.6);
  
  const targetX = rect.left + rect.width / 2 + offsetX;
  const targetY = rect.top + rect.height / 2 + offsetY;
  
  const steps = 5;
  const stepX = (targetX - window.virtualCursor.x) / steps;
  const stepY = (targetY - window.virtualCursor.y) / steps;
  
  for (let i = 1; i <= steps; i++) {
    window.virtualCursor.x += stepX + (Math.random() - 0.5) * 5; // slight jitter
    window.virtualCursor.y += stepY + (Math.random() - 0.5) * 5;
    
    document.dispatchEvent(new MouseEvent('mousemove', {
      view: window,
      bubbles: true,
      cancelable: true,
      clientX: window.virtualCursor.x,
      clientY: window.virtualCursor.y
    }));
    await delay(10);
  }
  
  window.virtualCursor.x = targetX;
  window.virtualCursor.y = targetY;
  window.virtualCursor.isActive = false;
}

async function humanClick(element) {
  if (!element) return;
  await moveMouseTo(element);
  
  const eventOpts = {
    view: window, bubbles: true, cancelable: true,
    clientX: window.virtualCursor.x, clientY: window.virtualCursor.y
  };
  
  element.dispatchEvent(new MouseEvent('mouseover', eventOpts));
  await delay(10);
  element.dispatchEvent(new MouseEvent('mousedown', eventOpts));
  await delay(10);
  element.dispatchEvent(new MouseEvent('mouseup', eventOpts));
  await delay(10);
  
  // Finally, trigger native click
  element.click(); 
}

// Background idle heartbeat
if (!window.heartbeatStarted) {
  window.heartbeatStarted = true;
  const jitter = () => {
    if (!window.virtualCursor.isActive) {
      window.virtualCursor.x += (Math.random() - 0.5) * 30;
      window.virtualCursor.y += (Math.random() - 0.5) * 30;
      
      window.virtualCursor.x = Math.max(10, Math.min(window.innerWidth - 10, window.virtualCursor.x));
      window.virtualCursor.y = Math.max(10, Math.min(window.innerHeight - 10, window.virtualCursor.y));
      
      document.dispatchEvent(new MouseEvent('mousemove', {
        view: window, bubbles: true, cancelable: true,
        clientX: window.virtualCursor.x, clientY: window.virtualCursor.y
      }));
    }
    setTimeout(jitter, 200 + Math.random() * 400);
  };
  setTimeout(jitter, 1000);
}
// --- END GHOST CURSOR ---

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

  // Focus the element realistically using humanClick
  await humanClick(element);
  await delay(20);

  // Use the native HTMLInputElement setter to bypass Angular's property interception.
  // Angular overrides the 'value' property on form inputs; using the native setter
  // ensures the DOM value is set cleanly before we dispatch events.
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    window.HTMLInputElement.prototype, 'value'
  ).set;
  nativeInputValueSetter.call(element, text);

  // Dispatch 'input' event — Angular's DefaultValueAccessor listens for this
  // to update the reactive form model. No composition events needed.
  element.dispatchEvent(new Event('input', { bubbles: true }));

  // Dispatch 'change' event as a fallback for non-reactive form listeners
  element.dispatchEvent(new Event('change', { bubbles: true }));

  // Trigger blur to finalize and trigger validation
  element.dispatchEvent(new Event('blur', { bubbles: true }));
}
// async function fillLoginCaptcha() {
//   // Find the captcha input element
//   var captchaInput = document.querySelector(LOGIN_CAPTCHA_INPUT);

//   // Scroll the captcha input field into view smoothly
//   if (captchaInput) {
//     await scrollToElement(captchaInput);
//   }
//   var captchaValue = prompt('Please enter the Captcha:');

//   // Fill the captcha input field with the provided value
//   if (captchaInput && captchaValue) {
//     await simulateTyping(captchaInput, captchaValue);
//     await delay(50);
//   }
// }

async function fillLoginCaptcha(loginModal) {
  // Wait for the captcha image to appear
  await waitForElementToAppear(LOGIN_CAPTCHA_IMAGE);

  // Find the captcha image and input field
  var captchaImage = document.querySelector(LOGIN_CAPTCHA_IMAGE);
  var captchaInput = document.querySelector(LOGIN_CAPTCHA_INPUT);

  if (!captchaImage || !captchaInput) {
      Logger.warn("Captcha image or input field not found!");
      return;
  }

  // Scroll the captcha input field into view smoothly
  await scrollToElement(captchaInput);

  Logger.info('autoSolveCaptcha,autoSubmitCaptcha',autoSolveCaptcha,autoSubmitCaptcha);
  // Check if autoSolveCaptcha is enabled
  if (autoSolveCaptcha) {
    // Extract text from captcha image using OCR
    let captchaText = await extractTextFromImage(captchaImage.src);
    Logger.info("Captcha text:",captchaText);

    // Fill the captcha input field with the extracted value
    await simulateTyping(captchaInput, captchaText);
    await delay(50);
    if (autoSubmitCaptcha) {
      const signInButton = loginModal.querySelector('button[type="submit"]');
      await humanClick(signInButton);
    }
  } else {
    // Prompt user with the extracted text (allowing edits)
    let userInput = prompt("Please enter the Captcha:");
    if (userInput) {
        await simulateTyping(captchaInput, userInput);
        await delay(50);
        const signInButton = loginModal.querySelector('button[type="submit"]');
        await humanClick(signInButton);
    }
  }
}

// Function to Login
async function login() {
  let loginButton = document.querySelector(LOGIN_BUTTON);
  if(loginButton){
    await humanClick(loginButton);
  }
  
  // Wait for the login component and specific input field to be present
  await waitForElementToAppear(LOGIN_COMPONENT);
  const userFieldFound = await waitForElementToAppear(LOGIN_USERID, 5000);
  
  if (!userFieldFound) {
    Logger.error('Login UserID field not found within 5 seconds. Check selector:', LOGIN_USERID);
    return;
  }
  
  await delay(200); // Give Angular a moment to stabilize the form

  let loginModal = document.querySelector(LOGIN_COMPONENT);
  if (!loginModal) {
    Logger.error('Login modal not found after wait');
    return;
  }

  const usernameInput = loginModal.querySelector(LOGIN_USERID);
  const passwordInput = loginModal.querySelector(LOGIN_PASSWORD);

  if (!usernameInput || !passwordInput) {
    Logger.warn('Username or Password input not found inside the modal despite wait');
    return;
  }

  Logger.info('Filling credentials. User:', username, 'Password provided:', !!password);
  await simulateTyping(usernameInput, username);
  await simulateTyping(passwordInput, password);

  if(username && password){
    // NOW wait for captcha after credentials are typed with a 2-second timeout
    // In off-peak hours, IRCTC sometimes doesn't show a captcha
    const captchaAppeared = await waitForElementToAppear(LOGIN_CAPTCHA_IMAGE, 2000);
    
    if (captchaAppeared) {
      await fillLoginCaptcha(loginModal);
    } else {
      Logger.info('No login captcha detected after 2s. Proceeding directly to sign in.');
      const signInButton = loginModal.querySelector('button[type="submit"]');
      if (signInButton) {
        await humanClick(signInButton);
      }
    }
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
    await humanClick(firstItem);
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

   await humanClick(element);

   // Simulate an onChange event to trigger the autocomplete options
   var inputEvent = new Event('onChange', {
     bubbles: true,
     cancelable: true,
   });

   element.dispatchEvent(inputEvent);

   await delay(500);

  // Get all list items within the autocomplete dropdown
  var listItems = document.querySelectorAll(JOURNEY_QUOTA_LIST);

  // Loop through each list item
  for (let item of listItems) {
    // Get the text content of the list item
    const itemText = item.textContent.trim();

    // Check if the text content contains the name substring (case-insensitive)
    if (itemText.toLowerCase().includes(value.toLowerCase())) {
      // Select the list item by simulating a click
      await humanClick(item);
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
        Logger.info('app-login disappear');
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
function shouldUseTimedSearch() {
  return ['TATKAL', 'PREMIUM TATKAL'].includes(quotaType) ||
    (quotaType === 'GENERAL' && isOpeningDayBooking);
}

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
  await humanClick(searchButton);
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
  await delay(500);
  const trainHeadingElements = document.querySelectorAll(FIND_TRAIN_NUMBER);

  if (!trainHeadingElements || !trainHeadingElements.length) {
    Logger.warn('No Available Trains');
    return null;
  }

  let rootElement = null;
  for (let i = 0; i < trainHeadingElements.length; i++) {
    const trainHeadingElement = trainHeadingElements[i];
    if (textIncludes(trainHeadingElement.textContent, trainNumber)) {
      rootElement = trainHeadingElement.closest(TRAIN_COMPONENT);
      Logger.info('Found train number:', trainNumber);
      trainFoundAtPosition = i;
      break;
    }
  }

  if (!rootElement) {
    Logger.warn('No train found for train number:', trainNumber);
    return null;
  }
  return rootElement;
}
async function scrollToFoundTrainAndSelectClass() {

  let rootElement = document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];

  await scrollToElement(rootElement);

  const availableClasses = rootElement.querySelectorAll(AVAILABLE_CLASS);
  if (!availableClasses || !availableClasses.length) {
    Logger.warn('No available classes found.');
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
    Logger.warn('No matching accommodation class found:', accommodationClass);
    return;
  }
  
  await delay(200);
  await humanClick(selectedClass);

  Logger.info(
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
    await delay(100);
    if (selectedTab) {
      await humanClick(selectedTab);
    } else {
      Logger.warn('Selected accommodation tab not found.');
    }
  } catch (error) {
    Logger.error('An error occurred while refreshing the train:', error);
  }
}
async function selectAvailableTicket() {
  let rootElement = document.querySelectorAll(TRAIN_COMPONENT)[trainFoundAtPosition];

  // Select the first available date
  const availableDateElement = rootElement.querySelector(AVAILABLE_CLASS);

  if (availableDateElement) {
    // Extract the date string from the first strong element
    const avlDate = availableDateElement.querySelector('strong').textContent;
    const availableSeatElement = availableDateElement.querySelector('.AVAILABLE');

    if (!availableSeatElement && confirmberths) {
      Logger.warn('Confirm Births Seat are not available.');
      alert('Confirm Births Seat are not available.');
      return false;
    }
    // Parse the date string to extract day and month
    const [day, month] = avlDate.split(', ')[1].split(' ');
    const [tday,tmonth,_]= dateString.split('/');

    // Check if the formatted date matches the desired date '25/04'
    if (day === tday && monthToNumber(month)===tmonth) {
      await humanClick(availableDateElement); // Click on the available date
      await delay(100); // Adjust the delay as needed

      // Check if the book ticket button is available
      const bookTicketButton = rootElement.querySelector(BOOK_NOW_BUTTON);
      if (bookTicketButton && !bookTicketButton.classList.contains(BUTTON_DISABLE_CLASS)) {
        await humanClick(bookTicketButton); // Click on the book ticket button
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
          Logger.info('Element refreshed: available accommodation classes');
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
            Logger.error("An error occurred:", error);
            // Optionally, you can choose to break the loop or handle the error differently
        }
    }
    await delay(refreshTime); // Adjust the delay as needed
}

  // Proceed with booking the ticket
  const endTime = new Date(); // Record the end time
  Logger.info(
    'Search Train and Select Class Page Time taken:',
    endTime - startTime,
    'ms'
  );
  Logger.info(endTime);
}
// Function to check for the presence of the popup and close it if it exists
async function closePopupToProceed() {
  let popup = document.querySelector(DIALOG_FROM);
  
  if (popup) {
    await humanClick(document.querySelector(DIALOG_ACCEPT));
    Logger.info('Popup closed.');
  } else {
    Logger.info('Popup not found.');
  }
}
async function addNextRow() {
  const prenextSpan = document.querySelector(PASSENGER_NEXT_ROW);

  if (prenextSpan && prenextSpan.textContent.trim() === PASSENGER_NEXT_ROW_TEXT) {
    await humanClick(prenextSpan.closest('a'));
  } else {
    Logger.warn('Span text does not match or element not found.');
  }
}
async function removeFirstRow(){
  // delete the first row
  const firstRow = document.querySelector(PASSENGER_REMOVE_ROW);
  if(firstRow){
    await humanClick(firstRow);
  }
}
function processInput() {
  copyPassengerNames = passengerNames
    .filter((passenger) => passenger.isSelected)
    .map((passenger) => passenger.name);

  if (copyPassengerNames.length === 0) {
    Logger.warn('No selected passenger names found.');
  } else {
    Logger.info('Selected passenger names:', copyPassengerNames);
  }
}

//autocomplete function
async function selectAutocompleteOption(index=0,name = passengerNames) {
  var row = document.querySelectorAll(PASSENGER_COMPONENT)[index];
  // Find the autocomplete input element
  var autocompleteInput = row.querySelector(PASSENGER_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_AGE_INPUT);
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
    var listItems = document.querySelectorAll(PASSENGER_NAME_LIST);
    // Loop through each list item
    for (const item of listItems) {
        // Get the text content of the list item
        var itemText = item.textContent.trim();
        
        // Check if the text content contains the name substring
        if (textIncludes(itemText,name)) {
            // Select the list item by simulating a click
            await humanClick(item);
            Logger.info("Selected item:", itemText);
            // Exit the loop after selecting the item
            break;
        }
    }
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
    const firstRow = document.querySelector(PASSENGER_REMOVE_ROW);
    await humanClick(firstRow);
    for (let index = 0; index < copyPassengerNames.length; index++) {
      await addNextRow();
      await delay(200);
      await selectAutocompleteOption(index, copyPassengerNames[index]);
    }
  }
}
async function fillCustomPassengerDetails(passenger, row = null) {
  // If row is not provided, select the last added row
  if (!row) {
    row = document.querySelector(PASSENGER_COMPONENT);
  }

  var nameInput = row.querySelector(PASSENGER_NAME_INPUT);
  var ageInput = row.querySelector(PASSENGER_AGE_INPUT);
  var genderSelect = row.querySelector(PASSENGER_GENDER_INPUT);
  var preferenceSelect = row.querySelector(PASSENGER_BERTH_CHOICE);
  var foodSelect = row.querySelector(PASSENGER_FOOD_CHOICE);
  
  nameInput.value = passenger.name;
  nameInput.dispatchEvent(new Event('input'));
  await delay(100);

  ageInput.value = passenger.age;
  ageInput.dispatchEvent(new Event('input'));
  await delay(100);

  genderSelect.value = passenger.gender;
  genderSelect.dispatchEvent(new Event('change'));
  await delay(100);

  preferenceSelect.value = passenger.preference;
  preferenceSelect.dispatchEvent(new Event('change'));
  await delay(100);

  if(foodSelect && passenger && passenger.foodChoice){
    foodSelect.value = passenger.foodChoice;
    foodSelect.dispatchEvent(new Event('change'));
    await delay(100);
  }
  
}
async function addCustomPassengerList() {
  // If there's only one passenger in the list and the row is already available, fill it directly
  if (passengerList.length === 1 && passengerList[0].isSelected) {
    await fillCustomPassengerDetails(passengerList[0]);
  } else {
    // Remove the default row if there's more than one passenger
    await removeFirstRow();
    await delay(50);
    // Iterate over each passenger in the passengerList array
    for (var i = 0; i < passengerList.length; i++) {
      if (!passengerList[i].isSelected) continue;

      var passenger = passengerList[i];
      // Add a new row for each passenger
      await addNextRow();
      await delay(50);
      var rows = document.querySelectorAll(PASSENGER_COMPONENT);
      var currentRow = rows[rows.length - 1];

      await fillCustomPassengerDetails(passenger, currentRow);

      await delay(100);
    }
  }
}
async function addMobileNumber() {
  const pMobileNumber = mobileNumber;
  // Validate the mobile number
  if (pMobileNumber && /^\d{10}$/.test(pMobileNumber)) {
    var mobileInput = document.getElementById(PASSENGER_MOBILE_NUMBER);
    mobileInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
    mobileInput.value = pMobileNumber;
    mobileInput.dispatchEvent(new Event('input'));
    await delay(50);
    Logger.info('Mobile number set:', pMobileNumber);
  } else {
    Logger.error('Invalid mobile number:', pMobileNumber);
  }
}
async function selectPreferences(){
  var autoUpgradationInput = document.getElementById(PASSENGER_PREFERENCE_AUTOUPGRADATION);
  autoUpgradationInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
  if(autoUpgradationInput && autoUpgradation)
     await humanClick(autoUpgradationInput);
  
  var confirmberthsInput = document.getElementById(PASSENGER_PREFERENCE_CONFIRMBERTHS);
  if(confirmberthsInput && confirmberths)
    await humanClick(confirmberthsInput);

  // Find all input elements of type radio
  var inputs = document.querySelectorAll(PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED);

  if (inputs) {
    // Loop through each input element using for...of loop
    for (let input of inputs) {
      // Get the corresponding label element
      var label = input && input.closest('label');

      // Check if the label element exists and its text content matches the specified text
      if (label && textIncludes(label.textContent, travelInsuranceOpted)) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger a click event on the input radio element
        await humanClick(input);
        Logger.info('Clicked on radio button for:', travelInsuranceOpted);
        break; // Exit the loop after clicking the input radio
      }
    }
  }
  Logger.info('Auto Upgradation:', autoUpgradation, 'Confirm Berths:', confirmberths, 'Travel Insurance Opted:', travelInsuranceOpted);
}
async function selectPaymentType() {
  // Find all input elements of type radio on the passenger page
  var inputs = document.querySelectorAll(PASSENGER_PAYMENT_TYPE);

  if (inputs) {
    // Loop through each input element using for...of loop
    for (let input of inputs) {
      // Get the corresponding label element
      var label = input && input.closest('label');

      // Check if the label element exists and its text content matches the specified text
      if (label && textIncludes(label.textContent, paymentType)) {
        input.scrollIntoView({ behavior: 'smooth', block: 'center' });
        // Trigger a click event on the input radio element
        await humanClick(input);
        Logger.info('Clicked on radio button for:', paymentType);
        break; // Exit the loop after clicking the input radio
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
  await addMobileNumber();
  
  await selectPreferences();
  // Call the function to select the radio button
  await selectPaymentType();
  // MANDATORY HUMAN PAUSE
  await delay(100);

  // Find the "Continue" button
  var continueButton = document.querySelector(PASSENGER_SUBMIT_BUTTON);
  // Check if the button exists
  if (continueButton) {
    continueButton.focus();
    // Simulate a click on the button
    await humanClick(continueButton);
  } else {
    Logger.info('Continue button not found.');
  }
   // Proceed with booking the ticket
   const endTime = new Date(); // Record the end time
   Logger.info(
     'Add Passenger Input Page Time taken:',
     endTime - startTime,
     'ms'
   );
   Logger.info(endTime);
}
// async function handleCaptchaAndContinue() {
//   await waitForElementToAppear(REVIEW_CAPTCHA_IMAGE);
//   // Find the captcha input element
//   var captchaInput = document.getElementById(REVIEW_CAPTCHA_INPUT);

//   // Scroll the captcha input field into view smoothly
//   if (captchaInput) {
//     await scrollToElement(captchaInput);
//   }
//   delay(100);
//   // Prompt the user to enter the captcha value
//   var trainHeader = document.querySelector(REVIEW_TRAIN_HEADER);
//   var available = trainHeader.querySelector(REVIEW_AVAILABLE);
//   var waitingList = trainHeader.querySelector(REVIEW_WAITING);
//   var seatsAvailable = (available || waitingList)?.textContent;
//   var captchaValue = prompt(
//     'Current Seats Status: ' + seatsAvailable + '\nPlease enter the Captcha:'
//   );

//   // Fill the captcha input field with the provided value
//   if (captchaInput && captchaValue) {
//     await simulateTyping(captchaInput, captchaValue);
//     await delay(50);
//   }

//   // Find the "Continue" button
//   var continueButton = document.querySelector(REVIEW_SUBMIT_BUTTON);

//   // Click the "Continue" button
//   if (continueButton) {
//     await continueButton.click();
//   }
// }
async function handleCaptchaAndContinue() {
  await waitForElementToAppear(REVIEW_CAPTCHA_IMAGE);
  // Find the captcha input element and image
  var captchaInput = document.getElementById(REVIEW_CAPTCHA_INPUT);
  var captchaImage = document.querySelector(REVIEW_CAPTCHA_IMAGE);

  if (!captchaImage || !captchaInput) {
    Logger.warn("Captcha image or input field not found!");
    return;
  }

  // Scroll the captcha input field into view smoothly
  await scrollToElement(captchaInput);
  
  await delay(100);

  // Check if autoSolveCaptcha is enabled
  if (autoSolveCaptcha) {
    // Extract text from captcha image using OCR
    let captchaText = await extractTextFromImage(captchaImage.src);
    Logger.info("Review Captcha text:",captchaText);

    // Fill the captcha input field with the extracted value
    await simulateTyping(captchaInput, captchaText);
    await delay(50);

    // Check if autoSubmitCaptcha is enabled
    if (autoSubmitCaptcha) {
      // Find the "Continue" button
      var continueButton = document.querySelector(REVIEW_SUBMIT_BUTTON);

      // Click the "Continue" button
      if (continueButton) {
        await humanClick(continueButton);
      }
    }
  } else {
    // Prompt the user to enter the captcha value
    var trainHeader = document.querySelector(REVIEW_TRAIN_HEADER);
    var available = trainHeader.querySelector(REVIEW_AVAILABLE);
    var waitingList = trainHeader.querySelector(REVIEW_WAITING);
    var seatsAvailable = (available || waitingList)?.textContent;

    var captchaValue = prompt(
      'Current Seats Status: ' + seatsAvailable + '\nPlease enter the Captcha:'
    );

    // Fill the captcha input field with the provided value
    if (captchaValue) {
      await simulateTyping(captchaInput, captchaValue);
      await delay(50);

    // Find the "Continue" button
    var continueButton = document.querySelector(REVIEW_SUBMIT_BUTTON);

      // Click the "Continue" button
      if (continueButton) {
        await humanClick(continueButton);
      }
    }
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
        await humanClick(element);
        Logger.info('Clicked on :', paymentMethod);
        return; // Exit the loop after clicking the element
      }
    }
  } else {
    Logger.info('No elements found with the specified classes.');
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
        await humanClick(element);
        Logger.info('Selected text:', element.textContent);
        return; // Exit the loop after selecting the text
      }
    }
  }
  Logger.info("No text found containing",paymentProvider);
}
async function clickPayButton() {
  // Find the button with the class "btn-primary" and "ng-star-inserted"
  var button = document.querySelector(PAY_BUTTON);

  // Check if the button exists and its text content contains "Pay"
  if (button && textIncludes(button.textContent, PAY_BUTTON_TEXT)) {
    // Simulate a click on the button
    await humanClick(button);
    Logger.info('Clicked on button:', button.textContent);
  } else {
    Logger.info("No button found containing 'Pay'.");
  }
}

// Function to click the confirm button in the eWallet component
async function clickEwalletConfirmButton() {
  const ewalletComponent = document.querySelector(EWALLET_COMPONENT);
  if (ewalletComponent) {
    const buttons = ewalletComponent.querySelectorAll(EWALLET_BUTTON_LIST); // Select all buttons
    let confirmButton = null;
    for (const button of buttons) {
      if (textIncludes(button.textContent,EWALLET_CONFIRM_BUTTON_TEXT)) {
        confirmButton = button;
        break;
      }
    }
    if (confirmButton) {
      await humanClick(confirmButton);
      Logger.info('Clicked on eWallet confirm button.');
    } else {
      Logger.info('eWallet confirm button not found.');
    }
  } else {
    Logger.info('eWallet component not found.');
  }
}

function hasReachedTargetTime(currentTimeString, targetTimeString) {
  const [currentHour, currentMinute, currentSecond] = currentTimeString.split(':').map(Number);
  const [targetHour, targetMinute, targetSecond] = targetTimeString.split(':').map(Number);

  return currentHour > targetHour ||
    (currentHour === targetHour && currentMinute > targetMinute) ||
    (currentHour === targetHour && currentMinute === targetMinute && currentSecond >= targetSecond);
}
function waitForTargetTime(targetTimeString) {
  const searchButton = document.querySelector(JOURNEY_SEARCH_BUTTON);

  if (!searchButton) {
    return;
  }

  if (!shouldUseTimedSearch()) {
    humanClick(searchButton);
    return;
  }

  const intervalId = setInterval(() => {
    // Extract the current time element
    const currentTimeElement = document.querySelector(CURRENT_TIME);

    if (!currentTimeElement) {
      Logger.error('Current time element not found.');
      clearInterval(intervalId);
      return;
    }

    const currentDateTimeString = currentTimeElement.textContent.trim();
    const timeMatch = currentDateTimeString.match(/\[(\d+:\d+:\d+)\]/);

    if (!timeMatch) {
      Logger.error('Current time format not recognized:', currentDateTimeString);
      clearInterval(intervalId);
      return;
    }

    if (hasReachedTargetTime(timeMatch[1], targetTimeString)) {
      humanClick(searchButton);
      clearInterval(intervalId);
    }
  }, 1000);
}
async function getSettings() {
  return new Promise((resolve) => {
    chrome.storage.local.get(STORAGE_KEY, function (result) {
      if (chrome.runtime.lastError) {
        Logger.error("Error retrieving settings:", chrome.runtime.lastError);
        resolve(); // Resolve anyway to not hang
        return;
      }

      const items = result[STORAGE_KEY] || defaultSettings;
      Logger.info('Settings loaded:', items);
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
      isOpeningDayBooking = items.isOpeningDayBooking;
      accommodationClass = items.accommodationClass;
      dateString = new Date(items.dateString).toLocaleDateString('en-GB');
      refreshTime = items.refreshTime;
      autoPay = items.autoPay;
      paymentType = items.paymentType;
      paymentMethod = items.paymentMethod;
      paymentProvider = items.paymentProvider;
      autoProcessPopup = items.autoProcessPopup;
      mobileNumber = items.mobileNumber;
      autoUpgradation = items.autoUpgradation;
      confirmberths = items.confirmberths;
      travelInsuranceOpted = items.travelInsuranceOpted;
      autoSolveCaptcha = items.autoSolveCaptcha;
      autoSubmitCaptcha = items.autoSubmitCaptcha;
      resolve();
    });
  });
}
function getAutomationStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get(STORAGE_KEY, function (result) {
      if (chrome.runtime.lastError) {
        Logger.error("Error retrieving automation status:", chrome.runtime.lastError);
        resolve(defaultSettings.automationStatus); // Resolve with default if error
        return;
      }

      const settings = result[STORAGE_KEY] || {}; // Use empty object if not found
      const automationStatus = settings.automationStatus !== undefined ? settings.automationStatus : defaultSettings.automationStatus; // Use default if not found
      resolve(automationStatus);
    });
  });
}
async function executeFunctions() {
  Logger.info("User script running!");

  try {
    const currentAutomationStatus = await getAutomationStatus();
    Logger.info('Automation status:', currentAutomationStatus);
    if (!currentAutomationStatus) return;

    // Load any user-customized DOM selectors before automation begins
    await loadSelectorOverrides();

    // read the passenger information for ticket booking
    await getSettings();

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
      await closePopupToProceed();
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
    await waitForElementToAppear(PAYMENT_COMPONENT);

    // Payment Selection <Page 4>
    await selectPaymentMethod();
    await selectPaymentProvider();

    if (autoPay) {
      await clickPayButton();

      // Payment Confirmation for Ewallet <Page 5>
      if (paymentMethod === EWALLET_IRCTC_DEFAULT) {
        await waitForElementToAppear(EWALLET_COMPONENT);
        await clickEwalletConfirmButton();
      }
    }
  } catch (error) {
    Logger.error("An error occurred during execution:", error);
    // You can add additional error handling here if needed
  }
}

executeFunctions();
