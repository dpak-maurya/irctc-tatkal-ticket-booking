import React from 'react';
import { TextField, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';

function PaymentDetails() {
  const { formData, handleChange } = useAppContext();
  return (
    (<Box sx={sharedStyles.container}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Payment Details
      </Typography>
      <TextField
        fullWidth
        label="Payment Type"
        id="paymentType"
        name="paymentType"
        value={formData.paymentType}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        disabled
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
      <TextField
        fullWidth
        label="Payment Method"
        id="paymentMethod"
        name="paymentMethod"
        value={formData.paymentMethod}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        disabled      
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
      <TextField
        fullWidth
        label="Payment Provider"
        id="paymentProvider"
        name="paymentProvider"
        value={formData.paymentProvider}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        disabled
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
      <FormControlLabel
        control={
          <Checkbox
            checked={formData.autoPay}
            onChange={handleChange}
            name="autoPay"
            color="primary"
          />
        }
        label="Pay & Book (Show QR Code Page)"
      />
    </Box>)
  );
}


export default PaymentDetails;
