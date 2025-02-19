import React, { useEffect, useState } from 'react';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import Tooltip from '@mui/material/Tooltip';

function MyTimePicker({isDisabled}) {
  const { formData,handleChange } = useAppContext();
  const [selectedTime, setSelectedTime] = useState(null);

  // Use effect to initialize the selected time from formData
  useEffect(() => {
    if (formData.targetTime) {
      setSelectedTime(dayjs(formData.targetTime, 'HH:mm:ss'));
    }
  }, [formData.targetTime]);

  const handleTimeChange = (newValue) => {
    if (newValue) {
      const formattedTime = newValue.format('HH:mm:ss'); // Format the time as HH:mm:ss
      setSelectedTime(newValue);
      handleChange({ target: { name: 'targetTime', value: formattedTime } });
    } else {
      // If the time is cleared, set selectedTime to null and update formData accordingly
      setSelectedTime(null);
      handleChange({ target: { name: 'targetTime', value: '' } });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <TimePicker
       label={
        <span>
          Tatkal Start Timer
          <Tooltip title="This timer auto-clicks the 'Search' button when it matches the IRCTC clock, moving you from 'Search Train' to 'Train List' automatically.">
            <InfoOutlinedIcon fontSize="small" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
          </Tooltip>
        </span>
        }
        value={selectedTime}
        onChange={handleTimeChange}
        views={['hours', 'minutes', 'seconds']}
        format="HH:mm:ss"
        ampm={false}
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        placeholder="Enter Tatkal Start Timer i.e. 09:59:53"
        sx={{ width: '100%', backgroundColor: 'white', borderRadius: 1 }}
        disabled={isDisabled}
      />
    </LocalizationProvider>
  );
}

// Add prop types validation
MyTimePicker.propTypes = {
  formData: PropTypes.shape({
    targetTime: PropTypes.string, // Validate targetTime as a string
  }).isRequired,
  handleChange: PropTypes.func.isRequired, // Validate handleChange as a function
  isDisabled: PropTypes.bool // Add this line
};

export default MyTimePicker;
