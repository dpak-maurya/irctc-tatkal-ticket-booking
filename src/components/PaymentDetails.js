import React from 'react';
import { 
  Box, 
  Typography, 
  FormControlLabel, 
  Checkbox, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  Tooltip
} from '@mui/material';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';
import { useModalContext } from '../contexts/ModalContext';
import ModalPopup from './ModalPopup';

function PaymentDetails() {
  const { formData, handleChange } = useAppContext();
  const { isModalOpen, modalConfig, openModal, closeModal } = useModalContext();

  // Payment method options based on payment type
  const paymentMethodOptions = {
    'BHIM/UPI': ['BHIM/ UPI/ USSD'],
    'Wallets': ['IRCTC eWallet']
  };

  // Payment provider options based on payment type and method
  const paymentProviderOptions = {
    'BHIM/ UPI/ USSD': ['PAYTM'],
    'IRCTC eWallet': ['IRCTC eWallet']
  };

  const handlePaymentTypeChange = (e) => {
    const newPaymentType = e.target.value;
    
    // Show confirmation modal when changing payment type
    if (formData.paymentType && formData.paymentType !== newPaymentType) {
      openModal(
        "warning",
        "Payment Type Changed",
        "Changing payment type will update available payment methods and providers. Your previous payment method and provider selection will be reset."
      )
    }
    
    // Update payment type and set default payment method and provider
    handleChange({
      target: {
        name: 'paymentType',
        value: newPaymentType
      }
    });
    
    // Set default payment method for selected payment type
    handleChange({
      target: {
        name: 'paymentMethod',
        value: paymentMethodOptions[newPaymentType][0]
      }
    });
    
    // Set default payment provider for selected payment method
    handleChange({
      target: {
        name: 'paymentProvider',
        value: paymentProviderOptions[paymentMethodOptions[newPaymentType][0]][0]
      }
    });
  };

  return (
    <Box sx={sharedStyles.container}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Payment Details
      </Typography>
      
      <FormControl fullWidth margin='normal'>
        <InputLabel id='paymentType-label'>Payment Type</InputLabel>
        <Select
          labelId='paymentType-label'
          id='paymentType'
          name='paymentType'
          value={formData.paymentType}
          onChange={handlePaymentTypeChange}
          label="Payment Type"
          variant='outlined'
          required
          sx={{ backgroundColor: 'white' }}
        >
          <MenuItem value='BHIM/UPI'>BHIM/UPI</MenuItem>
          <MenuItem value='Wallets'>Wallets</MenuItem>
        </Select>
      </FormControl>

      <FormControl fullWidth margin='normal'>
        <InputLabel id='paymentMethod-label'>Payment Method</InputLabel>
        <Select
          labelId='paymentMethod-label'
          id='paymentMethod'
          name='paymentMethod'
          value={formData.paymentMethod}
          onChange={handleChange}
          label="Payment Method"
          variant='outlined'
          required
          disabled
          sx={{ backgroundColor: 'white' }}
        >
          {formData.paymentType && paymentMethodOptions[formData.paymentType].map((method) => (
            <MenuItem key={method} value={method}>{method}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <FormControl fullWidth margin='normal'>
        <InputLabel id='paymentProvider-label'>Payment Provider</InputLabel>
        <Select
          labelId='paymentProvider-label'
          id='paymentProvider'
          name='paymentProvider'
          value={formData.paymentProvider}
          onChange={handleChange}
          label="Payment Provider"
          variant='outlined'
          required
          disabled
          sx={{ backgroundColor: 'white' }}
        >
          {formData.paymentMethod && paymentProviderOptions[formData.paymentMethod].map((provider) => (
            <MenuItem key={provider} value={provider}>{provider}</MenuItem>
          ))}
        </Select>
      </FormControl>

      <Tooltip title={<>
        <Typography variant="body1" style={{ fontFamily: 'Arial, sans-serif', fontSize: '14px'}}>
          {formData.paymentType === 'Wallets' ? 'Enabling this will directly deduct the payment from your wallet.' : 'Enabling this will show the QR code page for payment.'}
        </Typography>
      </> } arrow>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.autoPay}
              onChange={handleChange}
              name="autoPay"
              color="primary"
            />
          }
          label={<strong style={{ color: '#1E2A38' }}>Pay & Book {formData.paymentType === 'Wallets' ? '(Direct Deduction)' : '(Show QR Code Page)'}</strong>}
        />
      </Tooltip>

       <ModalPopup
          open={isModalOpen}
          onClose={closeModal}
          onConfirm={() => {
            if (modalConfig.onConfirm) modalConfig.onConfirm();
            closeModal();
          }}
          title={modalConfig.title || ''}
          message={modalConfig.message || ''}
          variant={modalConfig.variant || 'warning'}
        />
    </Box>
  );
}

export default PaymentDetails;
