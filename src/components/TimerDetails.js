import React from 'react';
import { TextField, Box, Typography } from '@mui/material';
import PropTypes from 'prop-types';
import { sharedStyles } from '../styles';
import MyTimePicker from './MyTimePicker';

function TimerDetails({ formData, handleChange }) {
  return (
    (<Box sx={sharedStyles.container}>
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: '#333' }}
      >
        Timer Details
      </Typography>
      <MyTimePicker formData={formData} handleChange={handleChange} />
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
        placeholder="Enter refresh time(milli seconds)"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
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
        placeholder="Enter minutes before Tatkal timer to login"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
    </Box>)
  );
}

TimerDetails.propTypes = {
  formData: PropTypes.shape({
    targetTime: PropTypes.string,
    refreshTime: PropTypes.number,
    loginMinutesBefore: PropTypes.number,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimerDetails;
