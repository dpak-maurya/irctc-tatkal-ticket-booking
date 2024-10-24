import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { sharedStyles } from '../styles';

function TimerDetails({ formData, handleChange }) {
  return (
    <Box 
     sx={sharedStyles.container}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Timer Details
      </Typography>
      <TextField
        fullWidth
        label="Target Time"
        id="targetTime"
        name="targetTime"
        value={formData.targetTime}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <TextField
        fullWidth
        label="Refresh Time (ms)"
        id="refreshTime"
        name="refreshTime"
        value={formData.refreshTime}
        onChange={handleChange}
        margin="normal"
        required
        type="number"
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <TextField
        fullWidth
        label="Login Minutes Before"
        id="loginMinutesBefore"
        name="loginMinutesBefore"
        value={formData.loginMinutesBefore}
        onChange={handleChange}
        margin="normal"
        required
        type="number"
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
    </Box>
  );
}

TimerDetails.propTypes = {
  formData: PropTypes.shape({
    targetTime: PropTypes.string,
    refreshTime: PropTypes.string,
    loginMinutesBefore: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimerDetails;
