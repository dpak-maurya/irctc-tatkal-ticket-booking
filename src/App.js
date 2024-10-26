import React from 'react';
import { Container, Stack, Box, Button } from '@mui/material';
import LoginDetails from './components/LoginDetails';
import TrainDetails from './components/TrainDetails';
import PaymentDetails from './components/PaymentDetails';
import TimerDetails from './components/TimerDetails';
import PassengerDetails from './components/PassengerDetails';
import ContactDetails from './components/ContactDetails';
import OtherPreferences from './components/OtherPreferences';
import Header from './components/Header';
import ModalPopup from './components/ModalPopup';
import { useAppContext } from './contexts/AppContext';
import { useModalContext } from './contexts/ModalContext';

const App = () => {
  const {
    isDirty,
    saveFormData,
    showButton,
    resetSettings,
  } = useAppContext();

  const { isModalOpen, modalConfig, openModal, closeModal } = useModalContext();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Header />
      <Box sx={{ mt: 4 }} />

      {/* Updated layout for Login+Timer, Train, and Payment Details */}
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} mb={3}>
        <Box flex={1}>
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

      {/* Spacer box if needed above footer */}
      <Box sx={{ mb: 8 }} />

      {/* Sticky/Floating Action Buttons */}
      <Stack
        direction={{ xs: 'column', md: 'row' }}
        spacing={3}
        sx={{
          position: { xs: 'sticky', md: 'fixed' }, // Sticky on small, fixed on medium+
          bottom: 0,
          left: 0,
          width: '100%',
          p: 2,
          backgroundColor: 'background.paper', // Use theme background color
          boxShadow: (theme) => theme.shadows[4], // Use MUI shadow
          textAlign: 'center',
          zIndex: 1000,
          justifyContent: 'center',
          flexWrap: 'wrap', // Allows wrapping in case of small screens
        }}
      >
        {/* Unsaved changes warning */}
        {isDirty && (
          <Button color="warning" variant="outlined">
            Unsaved changes!
          </Button>
        )}

        {/* Save Settings Button */}
        <Button
          variant="contained"
          color="primary"
          onClick={() => openModal('info', 'Save Settings', 'Settings saved.', saveFormData)}
        >
          Save Settings
        </Button>

        {/* Reset Settings Button */}
        <Button
          variant="contained"
          color="error"
          onClick={() => openModal('confirmation', 'Reset Settings', 'Are you sure you want to reset all settings?', resetSettings)}
        >
          Reset Settings
        </Button>

        {/* Go to IRCTC Website Button */}
        {showButton && (
          <Button
            variant="outlined"
            color="secondary"
            onClick={() =>
              window.open('https://www.irctc.co.in/nget/train-search', '_blank')
            }
          >
            Go to IRCTC Website
          </Button>
        )}

        {/* Modal Popup */}
        <ModalPopup
          open={isModalOpen}
          onClose={closeModal}
          onConfirm={() => {
            if (modalConfig.onConfirm) modalConfig.onConfirm();
            closeModal();
          }}
          title={modalConfig.title || ''}
          message={modalConfig.message || ''}
          variant={modalConfig.variant || 'info'}
        />
      </Stack>
    </Container>
  );
};

export default App;