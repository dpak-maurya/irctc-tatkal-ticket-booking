import React from 'react';
import PropTypes from 'prop-types';
import { Box } from '@mui/material';
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
          icon: <WarningIcon sx={{ fontSize: 24, color: '#ED6C02' }} />,
          accentColor: '#ED6C02',
          surfaceColor: '#FFF4E5',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'error':
        return {
          icon: <ErrorIcon sx={{ fontSize: 24, color: '#D32F2F' }} />,
          accentColor: '#D32F2F',
          surfaceColor: '#FDEDED',
          confirmText: 'Dismiss',
          showCancel: false,
        };
      case 'confirmation':
        return {
          icon: <WarningIcon sx={{ fontSize: 24, color: '#D32F2F' }} />,
          accentColor: '#D32F2F',
          surfaceColor: '#FDEDED',
          confirmText: 'Confirm',
          cancelText: 'Cancel',
          showCancel: true,
        };
      case 'success':
        return {
          icon: <SuccessIcon sx={{ fontSize: 24, color: '#2E7D32' }} />,
          accentColor: '#2E7D32',
          surfaceColor: '#EDF7ED',
          confirmText: 'OK',
          showCancel: false,
        };
      case 'automation':
        return {
          icon: <InfoIcon sx={{ fontSize: 24, color: '#415F91' }} />,
          accentColor: '#415F91',
          surfaceColor: '#D6E3FF',
          confirmText: 'Save & Start Automation',
          cancelText: 'Cancel',
          showCancel: true,
        };
      case 'info':
      default:
        return {
          icon: <InfoIcon sx={{ fontSize: 24, color: '#415F91' }} />,
          accentColor: '#415F91',
          surfaceColor: '#D6E3FF',
          confirmText: 'OK',
          showCancel: false,
        };
    }
  };

  const { icon, accentColor, surfaceColor, confirmText, cancelText, showCancel } = getVariantProps();

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth='xs'
      PaperProps={{
        sx: {
          borderRadius: '14px',
          boxShadow: '0 16px 40px rgba(65, 95, 145, 0.18)',
          minWidth: '400px',
          maxWidth: '500px',
          margin: '16px',
          backgroundColor: '#FAFAFC',
        }
      }}
    >
      <DialogTitle
        sx={{
          m: 0,
          px: 3,
          pt: 2.5,
          pb: 1,
          display: 'flex',
          alignItems: 'center',
          gap: 1.5,
          color: '#1E2A38',
          position: 'relative',
        }}
      >
        <Box
          sx={{
            width: 40,
            height: 40,
            borderRadius: '12px',
            backgroundColor: surfaceColor,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0,
          }}
        >
          {icon}
        </Box>
        <Typography
          variant='h6'
          component="div"
          sx={{
            color: '#1E2A38',
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
            color: '#5F6368',
            '&:hover': {
              backgroundColor: 'rgba(65,95,145,0.08)',
            },
          }}
        >
          <CloseIcon fontSize="small" />
        </IconButton>
      </DialogTitle>

      <DialogContent sx={{ pt: 1.5, pb: 2.5, px: 3 }}>
        {typeof message === 'string' ? (
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
        ) : (
          message
        )}
      </DialogContent>

      <DialogActions 
        sx={{ 
          p: 2,
          px: 3,
          backgroundColor: 'rgba(214, 227, 255, 0.35)',
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
              borderColor: 'rgba(65,95,145,0.45)',
              color: '#415F91',
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
            backgroundColor: accentColor,
            '&:hover': {
              backgroundColor: accentColor,
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
  message: PropTypes.node.isRequired,
  variant: PropTypes.oneOf(['info', 'warning', 'error', 'confirmation', 'success', 'automation']),
};

export default ModalPopup;
