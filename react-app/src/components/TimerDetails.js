import React from 'react';
import { TextField, Box, Typography, Tooltip, Stack, Button } from '@mui/material';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import dayjs from 'dayjs';
import { sharedStyles } from '../styles';
import MyTimePicker from './MyTimePicker';
import { useAppContext } from '../contexts/AppContext';
import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import TodayRoundedIcon from '@mui/icons-material/TodayRounded';
import { getTodayDateString } from '../utils';

function TimerDetails() {
  const { formData, handleChange } = useAppContext();
  const isDisabled = false;
  const todayDate = dayjs(getTodayDateString(), 'YYYY-MM-DD');
  const journeyDate = formData.dateString ? dayjs(formData.dateString, 'YYYY-MM-DD') : null;
  const generalPrimaryDate = journeyDate ? journeyDate.subtract(61, 'day') : null;
  const generalFallbackDate = journeyDate ? journeyDate.subtract(60, 'day') : null;
  const showGeneralOpeningDayTools = formData.quotaType === 'GENERAL' && formData.isOpeningDayBooking;

  const handleScheduleDateChange = (newValue) => {
    if (newValue) {
      handleChange({
        target: {
          name: 'scheduleDate',
          type: 'date',
          value: newValue.format('YYYY-MM-DD'),
        },
      });
      return;
    }

    handleChange({ target: { name: 'scheduleDate', type: 'date', value: '' } });
  };

  const setSuggestedScheduleDate = (suggestedDate) => {
    handleChange({
      target: {
        name: 'scheduleDate',
        type: 'date',
        value: suggestedDate.format('YYYY-MM-DD'),
      },
    });
  };

  const setScheduleDateToToday = () => {
    setSuggestedScheduleDate(todayDate);
  };

  return (
    (<Box sx={sharedStyles.container} >
      <Typography
        variant="h5"
        gutterBottom
        align="center"
        sx={{ fontWeight: 'bold', color: '#333', mb:3 }}
      >
        Schedule & Timing
      </Typography>

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mb: 1 }}>
        Schedule
      </Typography>

      <LocalizationProvider dateAdapter={AdapterDayjs}>
        <DatePicker
          label={
            <span>
              Schedule Date
              <Tooltip title="Automation will wake up on this date. Use today for immediate runs, or pick a future booking day to prepare in advance.">
                <InfoOutlinedIcon fontSize="small" style={{ marginLeft: '4px', verticalAlign: 'text-bottom' }} />
              </Tooltip>
            </span>
          }
          value={formData.scheduleDate ? dayjs(formData.scheduleDate, 'YYYY-MM-DD') : null}
          onChange={handleScheduleDateChange}
          format="DD/MM/YYYY"
          minDate={dayjs().startOf('day')}
          sx={{ width: '100%', backgroundColor: 'white', borderRadius: 1, mb: 2 }}
          disabled={isDisabled}
        />
      </LocalizationProvider>

      <Stack direction="row" justifyContent="flex-end" sx={{ mt: -1.5, mb: 0.5, pr: 0.5 }}>
        <Button
          size="small"
          variant="text"
          startIcon={<TodayRoundedIcon fontSize="small" />}
          onClick={setScheduleDateToToday}
          disabled={formData.scheduleDate === todayDate.format('YYYY-MM-DD')}
          sx={{
            minWidth: 'auto',
            px: 0.25,
            py: 0.125,
            fontSize: '0.9rem',
            fontWeight: 500,
            color: 'primary.main',
            textTransform: 'none',
            '& .MuiButton-startIcon': {
              mr: 0.5,
            },
          }}
        >
          Today
        </Button>
      </Stack>

      {showGeneralOpeningDayTools && (
        <Box
          sx={{
            mt: 0.25,
            mb: 1.25,
            px: 1.25,
            py: 1,
            borderRadius: 2,
            backgroundColor: 'rgba(255,255,255,0.35)',
            border: '1px solid rgba(65,95,145,0.14)',
          }}
        >
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={1}
            flexWrap="wrap"
            useFlexGap
          >
            <Typography variant="body2" sx={{ color: 'text.secondary', fontWeight: 600 }}>
              General opening dates
            </Typography>

            {journeyDate ? (
              <Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
                <Button
                  size="small"
                  variant={formData.scheduleDate === generalPrimaryDate?.format('YYYY-MM-DD') ? 'contained' : 'outlined'}
                  onClick={() => setSuggestedScheduleDate(generalPrimaryDate)}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  D-61: {generalPrimaryDate.format('DD MMM')}
                </Button>
                <Button
                  size="small"
                  variant={formData.scheduleDate === generalFallbackDate?.format('YYYY-MM-DD') ? 'contained' : 'outlined'}
                  onClick={() => setSuggestedScheduleDate(generalFallbackDate)}
                  sx={{
                    minWidth: 'auto',
                    px: 1,
                    py: 0.25,
                    fontSize: '0.8rem',
                    whiteSpace: 'nowrap',
                  }}
                >
                  D-60: {generalFallbackDate.format('DD MMM')}
                </Button>
              </Stack>
            ) : (
              <Typography variant="body2" sx={{ color: 'text.secondary' }}>
                Enter the journey date to see suggestions.
              </Typography>
            )}
          </Stack>
        </Box>
      )}

      <MyTimePicker formData={formData} handleChange={handleChange} isDisabled={isDisabled} />

      <Typography variant="subtitle2" sx={{ fontWeight: 700, color: 'primary.main', mt: 2, mb: 0.5 }}>
        Advanced Timing
      </Typography>

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
