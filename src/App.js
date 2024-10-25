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

const App = () => {
  const {
    formData,
    handleChange,
    isDirty,
    saveFormData,
    toggleAutomation,
    openModal,
    isModalOpen,
    handleCloseModal,
    modalConfig,
    showButton,
    resetSettings,
  } = useAppContext();

  return (
    <Container maxWidth="lg" sx={{ mt: 4 }}>
      <Header formData={formData} toggleAutomation={toggleAutomation} />
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
      <Box flex={1}>
        <PassengerDetails formData={formData} handleChange={handleChange} />
      </Box>
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3}>
        <Box flex={1}>
          <ContactDetails formData={formData} handleChange={handleChange} />
        </Box>
        <Box flex={2}>
          <OtherPreferences formData={formData} handleChange={handleChange} />
        </Box>
      </Stack>
      
      <Box sx={{ mt: 8 }}>helo</Box>
      <Box
        sx={{
          position: 'fixed',
          bottom: 0,
          left: 0,
          width: '100%',
          p: 2,
          backgroundColor: '#fff',
          boxShadow: '0 -2px 5px rgba(0,0,0,0.1)',
          textAlign: 'center',
          zIndex: 1000,
        }}
      >
        
        <Button  color='warning'>
        {isDirty && <div style={{ color: 'red' }}>Unsaved changes!</div>}
        </Button>
        
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

      <ModalPopup
        open={isModalOpen}
        onClose={handleCloseModal}
        onConfirm={() => {
          if (modalConfig.onConfirm) modalConfig.onConfirm();
          handleCloseModal();
        }}
        title={modalConfig.title || ''}
        message={modalConfig.message || ''}
        variant={modalConfig.variant || 'info'}
      />
      </Box>
    </Container>
  );
};

export default App;
