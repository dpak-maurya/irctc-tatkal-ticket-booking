import React, { useState } from 'react';
import { Box, TextField, Typography } from '@mui/material';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';

const ContactDetails = () => {
  const {formData,setFormData} = useAppContext();

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
    const { name, value } = e.target;
    // Transform to uppercase and filter out non-alphabetic characters
    const formattedValue = value.replace(/\D/g, '');
    // Update state
    setFormData({ ...formData, [name]: formattedValue });
    validateMobileNumber(formattedValue); // Validate the input value
  };

  return (
    (<Box
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
        required
        helperText={"Please enter a valid mobile number (if empty IRCTC logged-in user's number will be taken by default)"}
        // Display error if there's an error
        error={Boolean(error)}
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
    </Box>)
  );
};

export default ContactDetails;
