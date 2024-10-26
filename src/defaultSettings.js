import { getNextDay } from './utils';

const defaultSettings = {
    automationStatus: false,
    username: '',
    password: '',
    targetTime: '09:59:53',
    refreshTime: 5000,
    trainNumber: '',
    from: '',
    to: '',
    quotaType: '',
    accommodationClass: '',
    dateString: getNextDay(),
    paymentType: 'BHIM/UPI',
    paymentMethod: 'BHIM/ UPI/ USSD',
    paymentProvider: 'PAYTM',
    autoPay: false,
    mobileNumber: '',
    autoUpgradation: false,
    confirmberths: false,
    travelInsuranceOpted: 'yes',
    loginMinutesBefore: 2,
    passengerNames: [],
    masterData: false,
    passengerList: [],
  };

export default defaultSettings;
