import React, { useEffect } from 'react';
import { TextField, Box, Typography, Select, MenuItem, FormControl, InputLabel, FormControlLabel, Switch } from '@mui/material';
import dayjs from 'dayjs';
import { sharedStyles } from '../styles';
import MyDatePicker from './MyDatePicker';
import { useAppContext } from '../contexts/AppContext';

const getTargetTime = (quotaType, accommodationClass, isOpeningDayBooking, currentTargetTime) => {
  if (quotaType === 'GENERAL') {
    return isOpeningDayBooking ? '07:59:53' : currentTargetTime;
  }
  if (['SL', 'FC', '2S', 'VS'].includes(accommodationClass)) return '10:59:53';
  return '09:59:53';
};

const isTatkalQuota = (quotaType) => ['TATKAL', 'PREMIUM TATKAL'].includes(quotaType);
const formatStationCode = (value) => value.toUpperCase().replace(/[^A-Z]/g, '');
const formatTrainNumber = (value) => value.replace(/\D/g, '');
const getTatkalScheduleDate = (journeyDate) => journeyDate.subtract(1, 'day').format('YYYY-MM-DD');

function TrainDetails() {
  const { formData, setFormData, handleChange } = useAppContext();
  const today = dayjs().startOf('day');
  const journeyDate = formData.dateString ? dayjs(formData.dateString, 'YYYY-MM-DD') : null;
  const daysUntilJourney = journeyDate ? journeyDate.diff(today, 'day') : null;
  const canUseOpeningDayBooking = formData.quotaType === 'GENERAL' && daysUntilJourney >= 60;

  useEffect(() => {
    if (formData.quotaType === 'GENERAL' && !canUseOpeningDayBooking && formData.isOpeningDayBooking) {
      setFormData((prevState) => ({
        ...prevState,
        isOpeningDayBooking: false,
      }));
    }
  }, [canUseOpeningDayBooking, formData.isOpeningDayBooking, formData.quotaType, setFormData]);

  const handleStationCode = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: formatStationCode(value) });
  };

  const handleTrainNumber = (event) => {
    const { name, value } = event.target;
    setFormData({ ...formData, [name]: formatTrainNumber(value) });
  };

  const handleJourneyDateChange = (formattedDate, dateValue) => {
    setFormData((prevState) => ({
      ...prevState,
      dateString: formattedDate,
      ...(isTatkalQuota(prevState.quotaType) && dateValue
        ? { scheduleDate: getTatkalScheduleDate(dateValue) }
        : {}),
    }));
  };

  const handleQuotaTypeChange = (event) => {
    const { value } = event.target;
    const targetTime = getTargetTime(
      value,
      formData?.accommodationClass,
      formData?.isOpeningDayBooking,
      formData?.targetTime
    );
    setFormData({
      ...formData,
      quotaType: value,
      targetTime,
      ...(isTatkalQuota(value) && journeyDate
        ? { scheduleDate: getTatkalScheduleDate(journeyDate), isOpeningDayBooking: false }
        : {}),
    });
  };

  const handleAccommodationClassChange = (event) => {
    const { value } = event.target;
    const targetTime = getTargetTime(
      formData?.quotaType,
      value,
      formData?.isOpeningDayBooking,
      formData?.targetTime
    );
    setFormData({ ...formData, accommodationClass: value, targetTime });
  };

  const handleOpeningDayToggle = (event) => {
    const checked = event.target.checked;
    setFormData((prevState) => ({
      ...prevState,
      isOpeningDayBooking: checked,
      targetTime: checked ? '07:59:53' : prevState.targetTime,
    }));
  };

  return (
    <Box sx={sharedStyles.container}>
      <Typography
        variant='h5'
        gutterBottom
        align='center'
        sx={{ fontWeight: 'bold', color: '#333', mb: 3 }}
      >
        Train Details
      </Typography>
      <MyDatePicker onDateChange={handleJourneyDateChange} />
      <TextField
        fullWidth
        label='Train Number'
        id='trainNumber'
        name='trainNumber'
        value={formData.trainNumber}
        onChange={handleTrainNumber}
        margin='normal'
        required
        variant='outlined'
        placeholder='Enter train number i.e. 11061'
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          },
        }}
      />
      <TextField
        fullWidth
        label='From'
        id='from'
        name='from'
        value={formData.from}
        onChange={handleStationCode}
        margin='normal'
        required
        variant='outlined'
        placeholder='Enter origin station code i.e. LTT'
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          },
        }}
      />
      <TextField
        fullWidth
        label='To'
        id='to'
        name='to'
        value={formData.to}
        onChange={handleStationCode}
        margin='normal'
        required
        variant='outlined'
        placeholder='Enter destination station code i.e. BSB'
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          },
        }}
      />
      <FormControl fullWidth margin='normal'>
        <InputLabel id='quotaType-label'>Quota Type</InputLabel>
        <Select
          labelId='quotaType-label'
          id='quotaType'
          name='quotaType'
          value={formData.quotaType}
          onChange={handleQuotaTypeChange}
          label='Quota Type'
          variant='outlined'
          sx={{ backgroundColor: 'white' }}
        >
          <MenuItem value='GENERAL'>GENERAL</MenuItem>
          <MenuItem value='TATKAL'>TATKAL</MenuItem>
          <MenuItem value='PREMIUM TATKAL'>PREMIUM TATKAL</MenuItem>
        </Select>
      </FormControl>
      {canUseOpeningDayBooking && (
        <Box sx={{ mt: 1 }}>
          <FormControlLabel
            control={
              <Switch
                checked={formData.isOpeningDayBooking}
                onChange={handleOpeningDayToggle}
                color="primary"
              />
            }
            label="Opening Day Booking"
          />
          <Typography variant="body2" sx={{ color: 'text.secondary', mt: 0.5 }}>
            Use this when you want General quota automation on the first day booking opens.
          </Typography>
        </Box>
      )}
      {formData.quotaType === 'GENERAL' && !canUseOpeningDayBooking && (
        <Typography variant="body2" sx={{ color: 'text.secondary', mt: 1 }}>
          Opening Day Booking is available for General journeys 60 days away or more.
        </Typography>
      )}
      <FormControl fullWidth margin='normal'>
        <InputLabel id='accommodationClass-label'>
          Accommodation Class
        </InputLabel>
        <Select
          labelId='accommodationClass-label'
          id='accommodationClass'
          name='accommodationClass'
          value={formData.accommodationClass}
          onChange={handleAccommodationClassChange}
          label='Accommodation Class'
          variant='outlined'
          sx={{ backgroundColor: 'white' }}
        >
          <MenuItem value='SL'>Sleeper (SL)</MenuItem>
          <MenuItem value='3A'>AC 3 Tier (3A)</MenuItem>
          <MenuItem value='2A'>AC 2 Tier (2A)</MenuItem>
          <MenuItem value='1A'>AC First Class (1A)</MenuItem>
          <MenuItem value='3E'>AC 3 Economy (3E)</MenuItem>
          <MenuItem value='EC'>Exec. Chair Car (EC)</MenuItem>
          <MenuItem value='CC'>AC Chair car (CC)</MenuItem>
          <MenuItem value='EV'>Vistadome AC (EV)</MenuItem>
          <MenuItem value='2S'>Second Sitting (2S)</MenuItem>
          <MenuItem value='FC'>First Class (FC)</MenuItem>
          <MenuItem value='VC'>Vistadome Chair Car (VC)</MenuItem>
          <MenuItem value='VS'>Vistadome Non AC (VS)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

export default TrainDetails;
