import React from 'react';
import { TextField, Box, Typography, FormControlLabel, Checkbox } from '@mui/material';
import PropTypes from 'prop-types';
import { sharedStyles } from '../styles';

function PaymentDetails({ formData, handleChange }) {
  return (
    <Box sx={sharedStyles.container}>
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
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
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
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
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
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
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
    </Box>
  );
}

PaymentDetails.propTypes = {
  formData: PropTypes.shape({
    paymentType: PropTypes.string.isRequired,
    paymentMethod: PropTypes.string.isRequired,
    paymentProvider: PropTypes.string.isRequired,
    autoPay: PropTypes.bool.isRequired, 
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default PaymentDetails;
