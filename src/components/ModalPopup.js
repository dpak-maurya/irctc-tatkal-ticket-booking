import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from '@mui/material';

const ModalPopup = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant = 'info', // Accepts 'info', 'warning', 'error', 'confirmation'
}) => {
  // Define styles and actions based on variant
  const getVariantProps = () => {
    switch (variant) {
      case 'warning':
        return {
          color: 'warning.main',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'error':
        return {
          color: 'error.main',
          confirmText: 'Dismiss',
          showCancel: false,
        };
      case 'confirmation':
        return {
          color: 'primary.main',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          showCancel: true,
        };
      case 'info':
      default:
        return {
          color: 'primary.main',
          confirmText: 'OK',
          showCancel: false,
        };
    }
  };

  const { color, confirmText, cancelText, showCancel } = getVariantProps();

  return (
    <Dialog open={open} onClose={onClose} maxWidth='xs' fullWidth>
      <DialogTitle>
        <Typography
          variant='h6'
          color={color}
          sx={{
            fontWeight: 'bold',
            letterSpacing: '0.3px',
          }}
        >
          {title}
        </Typography>
      </DialogTitle>
      <DialogContent dividers>
        <Typography variant='body1' color='text.secondary'>
          {message}
        </Typography>
      </DialogContent>
      <DialogActions>
        {showCancel && (
          <Button onClick={onClose} color='primary' variant='outlined'>
            {cancelText}
          </Button>
        )}
        <Button onClick={onConfirm} variant='outlined'  color={showCancel? 'error':'primary'} autoFocus={!showCancel}>
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

ModalPopup.propTypes = {
  open: PropTypes.bool.isRequired,
  onClose: PropTypes.func.isRequired,
  onConfirm: PropTypes.func,
  title: PropTypes.string.isRequired,
  message: PropTypes.string.isRequired,
  variant: PropTypes.oneOf(['info', 'warning', 'error', 'confirmation']),
};

export default ModalPopup;
