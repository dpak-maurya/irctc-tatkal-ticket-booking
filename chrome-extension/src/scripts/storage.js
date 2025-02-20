import logger from './logger';

const STORAGE_KEY = 'tatkalTicketBookingFormData';

export let automationStatus = false;
export let username = '';
export let password = '';
export let targetTime ='09:59:53';
export let passengerList = [];
export let masterData = false;
export let passengerNames = '';
export let trainNumber = '';
export let from = '';
export let to = '';
export let quotaType = '';
export let accommodationClass = '';
export let dateString = '';
export let refreshTime = 5000; // 5 seconds;
export let paymentType = 'BHIM/UPI'; // Rs 20 chargs for bhim/upi, Rs 30 for cards / net banking / wallets
export let paymentMethod = 'BHIM/ UPI/ USSD';   // or IRCTC eWallet
export let paymentProvider = 'PAYTM'; // paytm, amazon /  or IRCTC eWallet
export let autoPay = false;  // auto click on pay button
export let autoProcessPopup = false;
export let mobileNumber = '';
export let autoUpgradation = false;
export let confirmberths = false;
export let travelInsuranceOpted = 'yes';

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
  travelInsuranceOpted:'yes'
};

async function getSettings() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (chrome.runtime.lastError) {
      logger.error("Error retrieving settings:", chrome.runtime.lastError);
      return;
    }

    const items = result[STORAGE_KEY] || defaultSettings;
    logger.info('Settings loaded:', items);
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
  } catch (error) {
    logger.error("Error retrieving settings:", error);
  }
}
async function getAutomationStatus() {
  try {
    const result = await chrome.storage.local.get(STORAGE_KEY);
    if (chrome.runtime.lastError) {
      logger.error("Error retrieving automation status:", chrome.runtime.lastError);
      return defaultSettings.automationStatus; // Return default if error
    }

    const settings = result[STORAGE_KEY] || {}; // Use empty object if not found
    const automationStatus = settings.automationStatus !== undefined ? settings.automationStatus : defaultSettings.automationStatus; // Use default if not found
    return automationStatus;
  } catch (error) {
    logger.error("Error retrieving automation status:", error);
    return defaultSettings.automationStatus; // Return default if error
  }
}

export {
  defaultSettings,
  getSettings, 
  getAutomationStatus
}