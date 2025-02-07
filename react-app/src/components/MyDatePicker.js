import React, { useEffect, useState } from 'react';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { useAppContext } from '../contexts/AppContext';

export default function MyDatePicker() {
  const { formData, handleChange } = useAppContext();
  const [selectedDate, setSelectedDate] = useState(null);

  // Use effect to initialize the selected date from formData
  useEffect(() => {
    if (formData.dateString) {
      setSelectedDate(dayjs(formData.dateString, 'YYYY-MM-DD'));
    }
  }, [formData.dateString]);

  const handleDateChange = (newValue) => {
    if (newValue) {
      const formattedDate = newValue.format('YYYY-MM-DD');
      setSelectedDate(newValue);
      handleChange({ target: { name: 'dateString', type: 'date', value: formattedDate } });
    } else {
      // If the date is cleared, set selectedDate to null and update formData accordingly
      setSelectedDate(null);
      handleChange({ target: { name: 'dateString', type: 'date', value: '' } });
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <DatePicker
        name='dateString'
        label="Date*"
        value={selectedDate}
        onChange={handleDateChange}
        format="DD/MM/YYYY" // Ensure you set the format for display
        minDate={dayjs()} // Restrict past dates
        sx={{ width: '100%', backgroundColor: 'white', borderRadius: 1 }}
      />
    </LocalizationProvider>
  );
}

