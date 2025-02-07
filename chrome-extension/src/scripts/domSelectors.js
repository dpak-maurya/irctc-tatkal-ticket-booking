/* global module */

export const APP_HEADER = 'app-header';

// Login Elements
export const LOGIN_SELECTORS = {
    LOGIN_BUTTON: 'app-header a.loginText',
    LOGIN_COMPONENT: 'app-login',
    LOGIN_USERID: 'input[formcontrolname="userid"]',
    LOGIN_PASSWORD: 'input[formcontrolname="password"]',
    LOGIN_CAPTCHA_IMAGE: 'app-captcha .captcha-img',
    LOGIN_CAPTCHA_INPUT: 'app-captcha #captcha',
};

// Search Journey Elements
export const JOURNEY_SELECTORS = {
    JOURNEY_INPUT_COMPONENT: 'app-jp-input',
    ORIGIN_STATION_CODE: '#origin input',
    DESTINATION_STATION_CODE: '#destination input',
    STATION_CODE_LIST: '.ui-autocomplete-items li',
    JOURNEY_QUOTA: '#journeyQuota>div',
    JOURNEY_QUOTA_LIST: '#journeyQuota p-dropdownitem span',
    JOURNEY_DATE: '#jDate input',
    CURRENT_TIME: 'app-header .h_head1>span strong',
    JOURNEY_SEARCH_BUTTON: 'button[type="submit"][label="Find Trains"].search_btn.train_Search',
};

// Modify Search Train Elements
export const MODIFY_SEARCH_SELECTORS = {
    MODIFY_SEARCH_COMPONENT: 'app-modify-search',
    MODIFY_JOURNEY_DATE: '#journeyDate input',
};

// Train List Elements
export const TRAIN_LIST_SELECTORS = {
    TRAIN_LIST_COMPONENT: 'app-train-list',
    TRAIN_COMPONENT: 'app-train-avl-enq',
    FIND_TRAIN_NUMBER: 'app-train-avl-enq .train-heading',
    AVAILABLE_CLASS: '.pre-avl',
    SELECTED_CLASS_TAB: 'p-tabmenu li[role="tab"][aria-selected="true"][aria-expanded="true"] a>div',
    BOOK_NOW_BUTTON: 'button.btnDefault.train_Search',
    BUTTON_DISABLE_CLASS: 'disable-book',
    LINK_INSERTED: '.link.ng-star-inserted',
};

// Popup Elements
export const POPUP_SELECTORS = {
    DIALOG_FROM: 'p-confirmdialog[key="tofrom"]',
    DIALOG_ACCEPT: '.ui-confirmdialog-acceptbutton',
};

// Passenger Input Elements
export const PASSENGER_SELECTORS = {
    PASSENGER_APP_COMPONENT: 'app-passenger-input',
    PASSENGER_COMPONENT: 'app-passenger',
    PASSENGER_NEXT_ROW: 'app-passenger-input p-panel .prenext',
    PASSENGER_NEXT_ROW_TEXT: '+ Add Passenger',
    PASSENGER_REMOVE_ROW: 'app-passenger-input p-panel a.fa-remove',
    PASSENGER_INPUT_COMPONENT: 'app-passenger-input',
    PASSENGER_NAME_INPUT: 'p-autocomplete input',
    PASSENGER_NAME_LIST: '.ui-autocomplete-items li',
    PASSENGER_AGE_INPUT: 'input[formcontrolname="passengerAge"]',
    PASSENGER_GENDER_INPUT: 'select[formcontrolname="passengerGender"]',
    PASSENGER_BERTH_CHOICE: 'select[formcontrolname="passengerBerthChoice"]',
    PASSENGER_MOBILE_NUMBER: 'mobileNumber',
    PASSENGER_PREFERENCE_AUTOUPGRADATION: 'autoUpgradation',
    PASSENGER_PREFERENCE_CONFIRMBERTHS: 'confirmberths',
    PASSENGER_PREFERENCE_TRAVELINSURANCEOPTED: 'input[type="radio"][name="travelInsuranceOpted-0"]',
    PASSENGER_SUBMIT_BUTTON: 'app-passenger-input button.btnDefault.train_Search',
};

// Review Ticket and Fill Captcha Elements
export const REVIEW_SELECTORS = {
    REVIEW_COMPONENT: 'app-review-booking',
    REVIEW_TRAIN_HEADER: 'app-train-header',
    REVIEW_CAPTCHA_IMAGE: 'app-captcha .captcha-img',
    REVIEW_CAPTCHA_INPUT: 'captcha',
    REVIEW_AVAILABLE: '.AVAILABLE',
    REVIEW_WAITING: '.WL',
    REVIEW_SUBMIT_BUTTON: 'app-review-booking button.btnDefault.train_Search',
};

// Payment Details Elements
export const PAYMENT_SELECTORS = {
    PAYMENT_COMPONENT: 'app-payment-options',
    PAYMENT_TYPE: 'input[type="radio"][name="paymentType"]',
    PAYMENT_METHOD: '.bank-type.ng-star-inserted',
    PAYMENT_PROVIDER: '.bank-text',
    PAY_BUTTON: '.btn-primary.ng-star-inserted',
    PAY_BUTTON_TEXT: 'Pay & Book ',
};

// eWallet Elements
export const EWALLET_SELECTORS = {
    EWALLET_IRCTC_DEFAULT: 'IRCTC eWallet',
    EWALLET_COMPONENT: 'app-ewallet-confirm',
    EWALLET_BUTTON_LIST: 'button.mob-bot-btn.search_btn',
    EWALLET_CONFIRM_BUTTON_TEXT: 'CONFIRM',
};

export const TRAIN_LIST_COMPONENT = TRAIN_LIST_SELECTORS.TRAIN_LIST_COMPONENT;
export const PASSENGER_APP_COMPONENT = PASSENGER_SELECTORS.PASSENGER_APP_COMPONENT;
export const REVIEW_COMPONENT = REVIEW_SELECTORS.REVIEW_COMPONENT;
export const PAYMENT_COMPONENT = PAYMENT_SELECTORS.PAYMENT_COMPONENT;
export const EWALLET_COMPONENT = EWALLET_SELECTORS.EWALLET_COMPONENT;
export const EWALLET_IRCTC_DEFAULT = EWALLET_SELECTORS.EWALLET_IRCTC_DEFAULT;



