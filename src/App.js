// App.js
import React from 'react';
import { Container, Stack, Box } from '@mui/material';
import LoginDetails from './components/LoginDetails';
import TrainDetails from './components/TrainDetails';
import PaymentDetails from './components/PaymentDetails';
import TimerDetails from './components/TimerDetails';
import PassengerDetails from './components/PassengerDetails';
import ContactDetails from './components/ContactDetails';
import OtherPreferences from './components/OtherPreferences';
import Header from './components/Header';
import Footer from './components/Footer'; // Import the new Footer component


const App = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 8, pb: 8, pt: 8, boxShadow:2 }}>
      <Header />
      

      {/* Updated layout for Login+Timer, Train, and Payment Details */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Box flex={1} >
          <LoginDetails />
          <TimerDetails />
        </Box>
        <Box flex={1}>
          <TrainDetails />
        </Box>
        <Box flex={1}>
          <PaymentDetails />
        </Box>
      </Stack>

      <Box flex={1}>
        <PassengerDetails />
      </Box>

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box flex={1}>
          <ContactDetails />
        </Box>
        <Box flex={2}>
          <OtherPreferences />
        </Box>
      </Stack>

      <Box sx={{ mt: 4 }} />

      <Footer />
    </Container>
  );
};

export default App;