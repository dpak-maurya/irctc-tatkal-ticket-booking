import React, { useState, useEffect } from 'react';
import LoginDetails from './components/LoginDetails';
import TrainDetails from './components/TrainDetails';
import PaymentDetails from './components/PaymentDetails';
import TimerDetails from './components/TimerDetails';
import PassengerNames from './components/PassengerNames';
import PassengerList from './components/PassengerList';
import ContactDetails from './components/ContactDetails';
import OtherPreferences from './components/OtherPreferences';

// Key for storing in chrome.storage
const STORAGE_KEY = 'tatkalTicketBookingFormData';

const App = () => {
  console.log('App component rendering'); // Add this line for debugging

  // Global form state
  const [formData, setFormData] = useState({
    // Initial state values for the form
    username: '',
    password: '',
    dateString: '',
    trainNumber: '',
    from: '',
    to: '',
    quotaType: 'TATKAL',
    accommodationClass: 'AC 3 Tier (3A)',
    paymentType: 'BHIM/UPI',
    paymentMethod: 'BHIM/ UPI/ USSD',
    paymentProvider: 'PAYTM',
    payAndBook: false,
    targetTime: '09:59',
    refreshTime: 5000,
    loginMinutesBefore: 2,
    passengerNames: '',
    useIRCTCMasterData: false,
    passengers: [],
    mobileNumber: '',
    autoUpgradation: false,
    bookOnlyIfConfirmed: false,
    travelInsurance: 'no'
  });

   // Functions for handling form changes
   const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevState => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Load form data from chrome.storage when the component mounts
  useEffect(() => {
    console.log('useEffect running'); // Add this line for debugging
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setFormData(result[STORAGE_KEY]);
          console.log('Data loaded from storage'); // Add this line for debugging
        }
      });
    } else {
      console.log('Chrome storage not available'); // Add this line for debugging
    }
  }, []);

  // Save form data to chrome.storage
  const saveFormData = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ [STORAGE_KEY]: formData }, () => {
        console.log('Settings saved');
      });
    } else {
      console.log('Chrome storage not available for saving');
    }
  };

  return (
    <div className="container">
      <header>
        <h1>Tatkal Ticket Booking</h1>
        <div className="auto-booking-toggle">
          <label htmlFor="autoBooking">Auto Booking</label>
          <input type="checkbox" id="autoBooking" />
        </div>
      </header>

      <div className="form-sections">
        <LoginDetails formData={formData} handleChange={handleChange} />
        <TrainDetails formData={formData} handleChange={handleChange} />
        <PaymentDetails formData={formData} handleChange={handleChange} />
        <TimerDetails formData={formData} handleChange={handleChange} />
        <PassengerNames formData={formData} handleChange={handleChange} />
        <PassengerList formData={formData} setFormData={setFormData} />
        <ContactDetails formData={formData} handleChange={handleChange} />
        <OtherPreferences formData={formData} handleChange={handleChange} />
      </div>

      <div className="actions">
        <button className="btn save-settings" onClick={saveFormData}>
          Save Settings
        </button>
        <button className="btn irctc-link">Go To IRCTC Website</button>
      </div>
    </div>
  );
};

export default App;
