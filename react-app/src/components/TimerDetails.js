import React from 'react';
import { TextField, Box, Typography, Tooltip } from '@mui/material';
import { sharedStyles } from '../styles';
import MyTimePicker from './MyTimePicker';
import { useAppContext } from '../contexts/AppContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';

function TimerDetails() {
  const { formData, handleChange } = useAppContext();
  const isDisabled = false && formData.quotaType === 'GENERAL';  // Allowing general booking 2 months before at 8AM

  return (
    (<Box sx={sharedStyles.container} >
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: '#333', mb:3 }}
      >
        Timer Details
      </Typography>
      
      <MyTimePicker formData={formData} handleChange={handleChange} isDisabled={isDisabled} />
      <TextField
        fullWidth
        label={
          <span>
            Refresh Time (ms)
            <Tooltip title="Refresh the train availability status every 5 seconds(5000 milliseconds) on the IRCTC page">
              <InfoOutlinedIcon fontSize="small" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
            </Tooltip>
          </span>
          }
        id="refreshTime"
        name="refreshTime"
        value={formData.refreshTime}
        onChange={handleChange}
        margin="normal"
        type="number"
        variant="outlined"
        placeholder="Enter refresh time(milli seconds)"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
        disabled={isDisabled}
      />
      <TextField
        fullWidth
        label={
          <span>
            Login Minutes Before
            <Tooltip title="Login at specified minutes(i.e. 2 minutes) before Tatkal start timer">
              <InfoOutlinedIcon fontSize="small" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
            </Tooltip>
          </span>
          }
        id="loginMinutesBefore"
        name="loginMinutesBefore"
        value={formData.loginMinutesBefore}
        onChange={handleChange}
        margin="normal"
        type="number"
        variant="outlined"
        placeholder="Enter minutes before Tatkal timer to login"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
        disabled={isDisabled}
      />
    </Box>)
  );
}

export default TimerDetails;
