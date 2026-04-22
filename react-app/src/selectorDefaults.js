/**
 * Single source of truth for all DOM selectors used by the automation.
 * Used by:
 *  - SelectorEditor React component (to render the UI)
 *  - Content script user-script.js mirrors these as its default values
 *
 * Storage key: "customDomSelectors" in chrome.storage.local
 * Format: flat object { SELECTOR_KEY: "override_value", ... }
 */

const SELECTOR_CATEGORIES = {
  LOGIN: {
    label: 'Login Elements',
    selectors: {
      APP_HEADER: { label: 'App Header', default: 'app-header' },
      LOGIN_BUTTON: { label: 'Login Button', default: 'app-header a.loginText' },
      LOGIN_COMPONENT: { label: 'Login Modal', default: 'app-login' },
      LOGIN_USERID: { label: 'Username Input', default: 'input[formcontrolname="userid"]' },
      LOGIN_PASSWORD: { label: 'Password Input', default: 'input[formcontrolname="password"]' },
      LOGIN_CAPTCHA_IMAGE: { label: 'Login Captcha Image', default: 'app-captcha .captcha-img' },
      LOGIN_CAPTCHA_INPUT: { label: 'Login Captcha Input', default: 'app-captcha #captcha' },
    },
  },
  JOURNEY: {
    label: 'Journey Search Elements',
    selectors: {
      JOURNEY_INPUT_COMPONENT: { label: 'Journey Input Component', default: 'app-jp-input' },
      ORIGIN_STATION_CODE: { label: 'Origin Station Input', default: '#origin input' },
      DESTINATION_STATION_CODE: { label: 'Destination Station Input', default: '#destination input' },
      STATION_CODE_LIST: { label: 'Station Autocomplete List', default: '.ui-autocomplete-items li' },
      JOURNEY_QUOTA: { label: 'Journey Quota Dropdown', default: '#journeyQuota>div' },
      JOURNEY_QUOTA_LIST: { label: 'Quota Dropdown Items', default: '#journeyQuota p-dropdownitem span' },
      JOURNEY_DATE: { label: 'Journey Date Input', default: '#jDate input' },
      CURRENT_TIME: { label: 'Current Time Display', default: 'app-header .h_head1>span strong' },
      JOURNEY_SEARCH_BUTTON: {
        label: 'Search Trains',
        default: 'app-jp-input button[type="submit"].search_btn',
      },
    },
  },
  MODIFY_SEARCH: {
    label: 'Modify Search Elements',
    selectors: {
      MODIFY_SEARCH_COMPONENT: { label: 'Modify Search Component', default: 'app-modify-search' },
      MODIFY_JOURNEY_DATE: { label: 'Modify Journey Date Input', default: '#journeyDate input' },
    },
  },
  TRAIN_LIST: {
    label: 'Train List Elements',
    selectors: {
      TRAIN_LIST_COMPONENT: { label: 'Train List Component', default: 'app-train-list' },
      TRAIN_COMPONENT: { label: 'Train Row Component', default: 'app-train-avl-enq' },
      FIND_TRAIN_NUMBER: { label: 'Train Number Heading', default: 'app-train-avl-enq .train-heading' },
      AVAILABLE_CLASS: { label: 'Available Class Element', default: '.pre-avl' },
      SELECTED_CLASS_TAB: {
        label: 'Selected Class Tab',
        default: 'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div',
      },
      BOOK_NOW_BUTTON: { label: 'Book Now Button', default: 'button.btnDefault.train_Search' },
      BUTTON_DISABLE_CLASS: { label: 'Button Disabled Class', default: 'disable-book' },
      LINK_INSERTED: { label: 'Link Inserted Element', default: '.link.ng-star-inserted' },
    },
  },
  POPUP: {
    label: 'Popup Elements',
    selectors: {
      DIALOG_FROM: { label: 'Confirm Dialog', default: 'p-confirmdialog[key="tofrom"]' },
      DIALOG_ACCEPT: { label: 'Dialog Accept Button', default: '.ui-confirmdialog-acceptbutton' },
    },
  },
  PASSENGER: {
    label: 'Passenger Input Elements',
    selectors: {
      PASSENGER_APP_COMPONENT: { label: 'Passenger App Component', default: 'app-passenger-input' },
      PASSENGER_COMPONENT: { label: 'Passenger Row Component', default: 'app-passenger' },
      PASSENGER_NEXT_ROW: { label: 'Add Passenger Row Link', default: 'app-passenger-input p-panel .prenext' },
      PASSENGER_NEXT_ROW_TEXT: { label: 'Add Passenger Text', default: '+ Add Passenger' },
      PASSENGER_REMOVE_ROW: { label: 'Remove Passenger Button', default: 'app-passenger-input p-panel a.fa-remove' },
      PASSENGER_INPUT_COMPONENT: { label: 'Passenger Input Component', default: 'app-passenger-input' },
      PASSENGER_NAME_INPUT: { label: 'Passenger Name Input', default: 'p-autocomplete input' },
      PASSENGER_NAME_LIST: { label: 'Passenger Name Autocomplete', default: '.ui-autocomplete-items li' },
      PASSENGER_AGE_INPUT: { label: 'Passenger Age Input', default: 'input[formcontrolname="passengerAge"]' },
      PASSENGER_GENDER_INPUT: { label: 'Passenger Gender Select', default: 'select[formcontrolname="passengerGender"]' },
      PASSENGER_BERTH_CHOICE: { label: 'Berth Preference Select', default: 'select[formcontrolname="passengerBerthChoice"]' },
      PASSENGER_FOOD_CHOICE: { label: 'Food Choice Select', default: 'select[formcontrolname="passengerFoodChoice"]' },
      PASSENGER_MOBILE_NUMBER: { label: 'Mobile Number Input (ID)', default: 'mobileNumber' },
      PASSENGER_PREFERENCE_AUTOUPGRADATION: { label: 'Auto Upgradation Checkbox (ID)', default: 'autoUpgradation' },
      PASSENGER_PREFERENCE_CONFIRMBERTHS: { label: 'Confirm Berths Checkbox (ID)', default: 'confirmberths' },
      PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED: {
        label: 'Travel Insurance Radio',
        default: 'input[type="radio"][name="travelInsuranceOpted-0"]',
      },
      PASSENGER_SUBMIT_BUTTON: { label: 'Submit/Continue Button', default: 'app-passenger-input button.btnDefault.train_Search' },
      PASSENGER_PAYMENT_TYPE: { label: 'Passenger Page Payment Radio', default: 'p-radiobutton[name="paymentType"] input' },
    },
  },
  REVIEW: {
    label: 'Review & Captcha Elements',
    selectors: {
      REVIEW_COMPONENT: { label: 'Review Component', default: 'app-review-booking' },
      REVIEW_TRAIN_HEADER: { label: 'Train Header Component', default: 'app-train-header' },
      REVIEW_CAPTCHA_IMAGE: { label: 'Review Captcha Image', default: 'app-captcha .captcha-img' },
      REVIEW_CAPTCHA_INPUT: { label: 'Review Captcha Input (ID)', default: 'captcha' },
      REVIEW_AVAILABLE: { label: 'Available Status Element', default: '.AVAILABLE' },
      REVIEW_WAITING: { label: 'Waiting List Element', default: '.WL' },
      REVIEW_SUBMIT_BUTTON: { label: 'Review Submit Button', default: 'app-review-booking button.btnDefault.train_Search' },
    },
  },
  PAYMENT: {
    label: 'Payment Elements',
    selectors: {
      PAYMENT_COMPONENT: { label: 'Payment Options Component', default: 'app-payment-options' },
      PAYMENT_TYPE: { label: 'Payment Category (#pay-type)', default: '#pay-type .bank-type' },
      PAYMENT_METHOD: { label: 'Payment Method Element', default: '#pay-type .bank-type' },
      PAYMENT_PROVIDER: { label: 'Payment Bank/Provider (Precision)', default: '#bank-type .bank-text, #bank-type .pay_tax_text' },
      PAY_BUTTON: { label: 'Pay Button', default: 'button.btn-primary.ng-star-inserted' },
      PAY_BUTTON_TEXT: { label: 'Pay Button Text', default: 'Pay & Book ' },
    },
  },
  EWALLET: {
    label: 'eWallet Elements',
    selectors: {
      EWALLET_IRCTC_DEFAULT: { label: 'eWallet Default Text', default: 'E-Wallet' },
      EWALLET_COMPONENT: { label: 'eWallet Component', default: 'app-ewallet-confirm' },
      EWALLET_BUTTON_LIST: { label: 'eWallet Button List', default: 'button.mob-bot-btn.search_btn' },
      EWALLET_CONFIRM_BUTTON_TEXT: { label: 'Confirm Button Text', default: 'CONFIRM' },
    },
  },
};

export const CUSTOM_SELECTORS_STORAGE_KEY = 'customDomSelectors';

export default SELECTOR_CATEGORIES;
