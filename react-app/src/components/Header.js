// components/Header.js
import React from 'react';
import { Box, Button, Typography, Stack, Container, useMediaQuery } from '@mui/material';
import LogoIcon from './LogoIcon';
import CustomSwitch from './CustomSwitch';
import { useAppContext } from '../contexts/AppContext';
import BookingCountdown from './BookingCountDown';
import DebugSettings from './DebugSettings';
import { useModalContext } from '../contexts/ModalContext';
import { validateBookingForm } from '../utils';
import BookingPlanSummary from './BookingPlanSummary';

const Header = () => {
  const { formData, toggleAutomation } = useAppContext();
  const { openModal } = useModalContext();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const handleAutomationToggle = () => {
    if (!formData.automationStatus) {
      const validationErrors = validateBookingForm(formData, { forAutomation: true });

      if (validationErrors.length > 0) {
        openModal(
          'error',
          'Cannot Start Automation',
          validationErrors[0]
        );
        return;
      }
    }

    if (formData.automationStatus) {
      toggleAutomation();
      return;
    }

    openModal(
      'automation',
      'Start Auto Booking?',
      <BookingPlanSummary formData={formData} />,
      toggleAutomation
    );
  };

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        padding: '10px 20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Container>
        <Stack
          spacing={2}
          direction={isSmallScreen ? 'column' : 'row'} // Use column for small screens, row for larger
          justifyContent='space-between' // Align items to the start (left)
          alignItems={isSmallScreen ? 'flex-start' : 'center'} // Align items to the start for small screens
          flexWrap='wrap'
        >
          <Stack
            display='flex'
            direction='row' // Keep logo and title on the same line
            justifyContent='start'
            alignItems='center'
            spacing={2}
          >
            <LogoIcon />
            <Typography variant='h5' fontWeight='bold'>
              Tatkal Ticket Booking
            </Typography>
            {!isSmallScreen && (
            <Stack
              display='flex'
              direction='row' // Keep button and debug settings on the same line
              justifyContent='start'
              alignItems='center'
              spacing={2}
            >
              <Button
                variant="outlined"
                color="primary"
                size='small'
                onClick={() => window.open('/how-to-use.html', '_blank')}
              >
                How to Use
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DebugSettings />
              </Box>
            </Stack>
            )}
          </Stack>
            

          {isSmallScreen && ( // Conditional rendering for small screens
            <Stack
              display='flex'
              direction='row' // Keep button and debug settings on the same line
              justifyContent='start'
              alignItems='center'
              spacing={2}
              flexWrap='wrap'
            >
              <Button
                variant="outlined"
                color="primary"
                size='small'
                onClick={() => window.open('/how-to-use.html', '_blank')}
              >
                How to Use
              </Button>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <DebugSettings />
              </Box>
            </Stack>
          )} 

          <Stack
            display='flex'
            direction='row' // Keep remaining buttons/switch on the same line
            justifyContent='end'
            alignItems='center'
            spacing={3}
            flexWrap='wrap'
          >
            <BookingCountdown />
            
            <CustomSwitch
              checked={formData.automationStatus}
              onChange={handleAutomationToggle}
              name='automationStatus'
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;
