// components/Footer.js
import React from 'react';
import { Stack, Button } from '@mui/material';
import ModalPopup from './ModalPopup';
import { useModalContext } from '../contexts/ModalContext';
import { useAppContext } from '../contexts/AppContext';

const Footer = () => {
    const { isModalOpen, modalConfig, openModal, closeModal } = useModalContext();
    const { isDirty, saveFormData, resetSettings } = useAppContext();

    return (
        <>
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
                    <Button color="warning" variant="text">
                        Unsaved changes!
                    </Button>
                )}

                {/* Save Settings Button */}
                <Button
                    variant="contained"
                    color="primary"
                    size='large'
                    onClick={() => openModal('info', 'Save Settings', 'Settings saved.', saveFormData)}
                >
                    Save Settings
                </Button>

                {/* Reset Settings Button */}
                <Button
                    variant="contained"
                    color="secondary"
                    size='large'
                    onClick={() => openModal('confirmation', 'Reset Settings', 'Are you sure you want to reset all settings?', resetSettings)}
                >
                    Reset Settings
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
        </>
    );
};

export default Footer;