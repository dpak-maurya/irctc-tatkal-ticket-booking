// components/Header.js
import React from 'react';
import { Box, Button, Typography, Stack, Container, useMediaQuery } from '@mui/material';
import LogoIcon from './LogoIcon';
import CustomSwitch from './CustomSwitch';
import { useAppContext } from '../contexts/AppContext';
import BookingCountdown from './BookingCountDown';
import DebugSettings from './DebugSettings';

const Header = () => {
  const { formData, toggleAutomation } = useAppContext();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

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
            {['TATKAL', 'PREMIUM TATKAL'].includes(formData.quotaType) && <BookingCountdown />}
            {formData.quotaType === 'GENERAL' && (
              <Button
                id='book-button'
                variant='outlined'
                color='secondary'
                onClick={() =>
                  window.open(
                    'https://www.irctc.co.in/nget/train-search',
                    '_blank'
                  )
                }
              >
                Book Ticket on IRCTC
              </Button>
            )}
            
            <CustomSwitch
              checked={formData.automationStatus}
              onChange={toggleAutomation}
              name='automationStatus'
            />
          </Stack>
        </Stack>
      </Container>
    </Box>
  );
};

export default Header;


