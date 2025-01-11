import React from 'react';
import PropTypes from 'prop-types';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Close as CloseIcon,
  Warning as WarningIcon,
  Error as ErrorIcon,
  Info as InfoIcon,
  CheckCircle as SuccessIcon
} from '@mui/icons-material';

const ModalPopup = ({
  open,
  onClose,
  onConfirm,
  title,
  message,
  variant,
}) => {
  const getVariantProps = () => {
    switch (variant) {
      case 'warning':
        return {
          icon: <WarningIcon sx={{ fontSize: 28, color: 'white' }} />,
          backgroundColor: '#ED6C02',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'error':
        return {
          icon: <ErrorIcon sx={{ fontSize: 28, color: 'white' }} />,
          backgroundColor: '#D32F2F',
          confirmText: 'Dismiss',
          showCancel: false,
        };
      case 'confirmation':
        return {
          icon: <WarningIcon sx={{ fontSize: 28, color: 'white' }} />,
          backgroundColor: '#D32F2F',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          showCancel: true,
        };
      case 'success':
        return {
          icon: <SuccessIcon sx={{ fontSize: 28, color: 'white' }} />,
          backgroundColor: '#2E7D32',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon sx={{ fontSize: 28, color: 'white' }} />,
          backgroundColor: '#0288D1',
          confirmText: 'OK',
          showCancel: false,
        };
    }
  };

  const { icon, backgroundColor, confirmText, cancelText, showCancel } = getVariantProps();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth='xs'
      PaperProps={{
        sx: {
          borderRadius: '8px',
          boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
          minWidth: '400px',
          maxWidth: '500px',
          margin: '16px'
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          p: 2,
          backgroundColor: backgroundColor,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: 'white',
          position: 'relative',
        }}
      >
        {icon}
        <Typography
          variant='h6'
          component="div"
          sx={{
            color: 'white',
            fontWeight: 600,
            flex: 1,
            fontSize: '1.125rem',
          }}
        >
          {title}
        </Typography>
        <IconButton
          aria-label="close"
          onClick={onClose}
          sx={{
            position: 'absolute',
            right: 8,
            top: 8,
            color: 'white',
            '&:hover': {
              backgroundColor: 'rgba(255,255,255,0.1)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ py: 2.5, px: 3 }}>
        <Typography 
          variant='body1'
          sx={{ 
            color: 'rgba(0, 0, 0, 0.67)',
            lineHeight: 1.5,
            fontSize: '1rem',
            my:1,
          }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 2,
          px: 3,
          backgroundColor: 'rgba(0, 0, 0, 0.02)',
          gap: 1,
        }}
      >
        {showCancel && (
          <Button 
            onClick={onClose} 
            variant='outlined'
            sx={{
              minWidth: '100px',
              textTransform: 'none',
              fontWeight: 500,
              px: 2,
            }}
          >
            {cancelText}
          </Button>
        )}
        <Button 
          onClick={onConfirm} 
          variant='contained'
          sx={{
            minWidth: '100px',
            textTransform: 'none',
            fontWeight: 500,
            px: 2,
            backgroundColor: backgroundColor,
            '&:hover': {
              backgroundColor: backgroundColor,
              filter: 'brightness(0.9)',
            }
          }}
          autoFocus={!showCancel}
        >
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
  variant: PropTypes.oneOf(['info', 'warning', 'error', 'confirmation', 'success']),
};

export default ModalPopup;
