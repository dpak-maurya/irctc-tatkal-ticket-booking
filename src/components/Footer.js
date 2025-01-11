// components/Footer.js
import React from 'react';
import { Stack, Button, Box, Container } from '@mui/material';
import ModalPopup from './ModalPopup';
import { useModalContext } from '../contexts/ModalContext';
import { useAppContext } from '../contexts/AppContext';

const Footer = () => {
  const { isModalOpen, modalConfig, openModal, closeModal } = useModalContext();
  const { isDirty, saveFormData, resetSettings } = useAppContext();

  return (
    <Box
      sx={{
        backgroundColor: '#fff',
        padding: '10px 20px',
        boxShadow: '0 -2px 4px rgba(0, 0, 0, 0.1)',
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1000,
      }}
    >
      <Container>
        <Stack
          display='flex'
          direction='row'
          justifyContent='space-between'
          alignItems='center'
        >
          <Box>
            {/* Unsaved changes warning */}
            {isDirty && (
              <Button color='error' variant="text" size='large' >
                Unsaved changes!
              </Button>
            )}
          </Box>
          <Stack
            display='flex'
            direction='row'
            spacing={3}
            justifyContent='end'
            alignItems='center'
          >
            {/* Reset Settings Button */}
            <Button
              variant='outlined'
              color='secondary'
              size='large'
              onClick={() =>
                openModal(
                  'confirmation',
                  'Clear Booking Details',
                  'Are you sure you want to clear all booking details?',
                  resetSettings
                )
              }
            >
              Clear Booking Details
            </Button>

            {/* Save Settings Button */}
            <Button
              variant='contained'
              color='primary'
              size='large'
              onClick={() =>
                openModal(
                  'success',
                  'Save Booking Details',
                  'Your booking details have been saved.',
                  saveFormData
                )
              }
            >
              Save Booking Details
            </Button>
          </Stack>
        </Stack>
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
      </Container>
    </Box>
  );
};

export default Footer;
