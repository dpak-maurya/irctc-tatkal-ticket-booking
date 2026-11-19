// components/Footer.js
import React from 'react';
import { Stack, Button, Box, Container, Typography, useMediaQuery } from '@mui/material';
import ModalPopup from './ModalPopup';
import { useModalContext } from '../contexts/ModalContext';
import { useAppContext } from '../contexts/AppContext';
import { validateBookingForm } from '../utils';

const Footer = () => {
  const { isModalOpen, modalConfig, openModal, closeModal } = useModalContext();
  const { formData, isDirty, saveFormData, resetSettings } = useAppContext();
  const isSmallScreen = useMediaQuery((theme) => theme.breakpoints.down('sm'));

  const handleSaveClick = () => {
    const validationErrors = validateBookingForm(formData);

    if (validationErrors.length > 0) {
      openModal(
        'error',
        'Cannot Save Booking Details',
        validationErrors[0]
      );
      return;
    }

    openModal(
      'success',
      'Save Booking Details',
      'Your booking details have been saved.',
      saveFormData
    );
  };

  return (
    <Box
      component="footer"
      sx={{
        position: 'sticky',
        bottom: 0,
        zIndex: (theme) => theme.zIndex.appBar,
        backgroundColor: '#fff',
        borderTop: '1px solid',
        borderColor: 'divider',
        boxShadow: '0 -2px 8px rgba(0, 0, 0, 0.06)',
      }}
    >
      <Container maxWidth="lg" sx={{ py: 1.25 }}>
        <Stack direction="row" alignItems="center" justifyContent="flex-end" gap={1.5}>
          {/* Unsaved changes warning */}
          {isDirty && (
            <Stack direction="row" alignItems="center" gap={0.75} sx={{ mr: 'auto', color: 'error.main', minWidth: 0 }}>
              <Box sx={{ width: 8, height: 8, borderRadius: '50%', backgroundColor: 'error.main', flexShrink: 0 }} />
              <Typography variant="body2" fontWeight={600} noWrap>
                {isSmallScreen ? 'Unsaved' : 'Unsaved changes'}
              </Typography>
            </Stack>
          )}

          {/* Reset Settings Button */}
          <Button
            variant='outlined'
            color='secondary'
            size={isSmallScreen ? 'medium' : 'large'}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={() =>
              openModal(
                'confirmation',
                'Clear Booking Details',
                'Are you sure you want to clear all booking details?',
                resetSettings
              )
            }
          >
            {isSmallScreen ? 'Clear' : 'Clear Booking Details'}
          </Button>

          {/* Save Settings Button */}
          <Button
            variant='contained'
            color='primary'
            size={isSmallScreen ? 'medium' : 'large'}
            sx={{ whiteSpace: 'nowrap' }}
            onClick={handleSaveClick}
          >
            {isSmallScreen ? 'Save' : 'Save Booking Details'}
          </Button>
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
