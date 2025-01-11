import React, { useEffect, useState } from 'react';
import { LocalizationProvider, TimePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import PropTypes from 'prop-types';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';

function MyTimePicker() {
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
        label="Tatkal Start Timer"
        value={selectedTime}
        onChange={handleTimeChange}
        views={['hours', 'minutes', 'seconds']} // Only hours, minutes, and seconds
        format="HH:mm:ss" // Ensure the format is set
        // Ensure 24-hour format
        ampm={false} // Disable AM/PM
        timeSteps={{ hours: 1, minutes: 1, seconds: 1 }}
        placeholder="Enter Tatkal Start Timer i.e. 09:59:53"
        sx={{ width: '100%', backgroundColor: 'white', borderRadius: 1 }} // Optional styling
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
};

export default MyTimePicker;
