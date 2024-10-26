import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { sharedStyles } from '../styles'; // Import the shared styles

function LoginDetails({ formData, handleChange }) {
  return (
    (<Box sx={sharedStyles.container}> {/* Apply shared container styles */}
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Login Details
      </Typography>
      <TextField
        fullWidth
        label="Username"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        placeholder="Enter Irctc username"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
      <TextField
        fullWidth
        label="Password"
        id="password"
        name="password"
        type="password"
        value={formData.password}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        placeholder="Enter Irctc password"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
    </Box>)
  );
}

LoginDetails.propTypes = {
  formData: PropTypes.shape({
    username: PropTypes.string.isRequired,
    password: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default LoginDetails;
