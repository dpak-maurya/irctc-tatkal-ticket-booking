import React, { useEffect, useState } from 'react';
import { Container, Stack, Box, Button } from '@mui/material';
import LoginDetails from './components/LoginDetails';
import TrainDetails from './components/TrainDetails';
import PaymentDetails from './components/PaymentDetails';
import TimerDetails from './components/TimerDetails';
import PassengerDetails from './components/PassengerDetails';
import ContactDetails from './components/ContactDetails';
import OtherPreferences from './components/OtherPreferences';
import Header from './components/Header';

// Key for storing in chrome.storage
const STORAGE_KEY = 'tatkalTicketBookingFormData';

const getNextDay = () => {
  return new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0];
};

const App = () => {
  const [formData, setFormData] = useState({
    automationStatus: false,
    username: '',
    password: '',
    targetTime: '09:59:53',
    refreshTime: 5000,
    trainNumber: 11061,
    from: 'LTT',
    to: 'BSB',
    quotaType: 'TATKAL',
    accommodationClass: '3A',
    dateString: getNextDay(),
    paymentType: 'BHIM/UPI',
    paymentMethod: 'BHIM/ UPI/ USSD',
    paymentProvider: 'PAYTM',
    autoPay: false,
    mobileNumber:'',
    autoUpgradation:false,
    confirmberths:false,
    travelInsuranceOpted:'yes',
    loginMinutesBefore: 2,
    passengerNames: [],
    useIRCTCMasterData: false,
    passengers: [],
  });

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevState) => ({
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

  const saveFormData = () => {
    console.log(formData);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.sync.set({ [STORAGE_KEY]: formData }, () => {
        console.log('Settings saved');
        alert('Settings saved');
      });
    } else {
      console.log('Chrome storage not available for saving');
    }
  };

  return (
    <Container maxWidth='lg' sx={{ mt: 4 }}>
      <Header formData={formData} handleChange={handleChange}/>
      <Box sx={{ mt: 4 }}></Box>
      {/* Updated layout for Login+Timer, Train, and Payment Details */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Box flex={1}>
          <LoginDetails formData={formData} handleChange={handleChange} />
          <TimerDetails formData={formData} handleChange={handleChange} />
        </Box>
        <Box flex={1}>
          <TrainDetails formData={formData} handleChange={handleChange} />
        </Box>
        <Box flex={1}>
          <PaymentDetails formData={formData} handleChange={handleChange} />
        </Box>
      </Stack>

      {/* Rest of the components */}

      <Box flex={1}>
        <PassengerDetails
          formData={formData}
          setFormData={setFormData}
          handleChange={handleChange}
        />
      </Box>

      <Stack
        spacing={3}
        direction={{ xs: 'column', md: 'row' }}
        flexWrap='wrap'
      >
        <Box flex={1} minWidth={{ xs: '100%', md: '45%' }}>
          <ContactDetails formData={formData} handleChange={handleChange} />
        </Box>
        <Box flex={1} minWidth={{ xs: '100%', md: '45%' }}>
          <OtherPreferences formData={formData} handleChange={handleChange} />
        </Box>
      </Stack>
      <Box sx={{ mt: 8 }}>helo</Box>
      <Box sx={{ 
  position: 'fixed', // Fix the position to always stay at the bottom
  bottom: 0, // Align it to the bottom of the viewport
  left: 0, // Ensure it starts from the left edge
  width: '100%', // Make sure the box spans the entire width
  p: 2, // Padding
  backgroundColor: '#fff', // Background color to make it distinct from the rest of the page
  boxShadow: '0 -2px 5px rgba(0,0,0,0.1)', // Add a shadow for better visibility
  textAlign: 'center', // Center the buttons horizontally
  zIndex: 1000 // Ensure it stays above other content
}}>
  <Button variant="contained" color="primary" onClick={saveFormData}>
    Save Settings
  </Button>
  <Button variant="outlined" color="secondary" sx={{ ml: 2 }}>
    Go To IRCTC Website
  </Button>
</Box>
    </Container>
  );
};



export default App;
