import React, { useState } from 'react';
import PropTypes from 'prop-types';
import { Box, TextField, Typography } from '@mui/material';
import { sharedStyles } from '../styles';

const ContactDetails = ({ formData, handleChange }) => {
  const [error, setError] = useState('');

  const validateMobileNumber = (value) => {
    // Check if value is empty
    if (!value) {
      setError('Mobile number is required.');
      return false;
    }
    // Check if the value is a valid mobile number (10 digits)
    const mobilePattern = /^[0-9]{10}$/;
    if (!mobilePattern.test(value)) {
      setError('Please enter a valid mobile number (10 digits).');
      return false;
    }
    setError(''); // Clear error if valid
    return true;
  };

  const handleInputChange = (e) => {
    handleChange(e); // Call handleChange regardless of validation
    validateMobileNumber(e.target.value); // Validate the input value
  };

  return (
    <Box
      sx={sharedStyles.container} 
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Contact Details
      </Typography>
      <TextField
        label="Mobile Number"
        name="mobileNumber"
        value={formData.mobileNumber}
        onChange={handleInputChange}
        fullWidth
        margin="normal"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
        required
        helperText={"Please enter a valid mobile number (if empty IRCTC logged-in user's number will be taken by default)"}
        error={Boolean(error)} // Display error if there's an error
      />
    </Box>
  );
};

ContactDetails.propTypes = {
  formData: PropTypes.shape({
    mobileNumber: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default ContactDetails;
