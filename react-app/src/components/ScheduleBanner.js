import React from 'react';
import { Alert, Typography } from '@mui/material';
import { alpha } from '@mui/material/styles';
import { useAppContext } from '../contexts/AppContext';
import { formatDateTimeInIST, getLoginDateTime } from '../utils';

function ScheduleBanner() {
  const { formData } = useAppContext();
  const loginDateTime = getLoginDateTime(
    formData.scheduleDate,
    formData.targetTime,
    formData.loginMinutesBefore
  );

  if (!loginDateTime) {
    return null;
  }

  const isUpcoming = loginDateTime.getTime() > Date.now();
  const isArmedUpcoming = formData.automationStatus && isUpcoming;
  const severity = isUpcoming ? 'info' : 'warning';
  const bannerSx = (theme) => ({
    mb: 2,
    ...(isArmedUpcoming && {
      backgroundColor: alpha(theme.palette.secondary.main, 0.08),
      border: '1px solid',
      borderColor: alpha(theme.palette.secondary.main, 0.24),
      borderLeft: '4px solid',
      borderLeftColor: 'secondary.main',
      color: 'text.primary',
      '& .MuiAlert-icon': {
        color: 'secondary.main',
      },
    }),
  });
  const message = (() => {
    if (!formData.automationStatus) {
      return isUpcoming
        ? `Draft wake-up time: ${formatDateTimeInIST(loginDateTime)}`
        : `Draft wake-up time has passed: ${formatDateTimeInIST(loginDateTime)}`;
    }

    return isUpcoming
      ? `Automatic login starts at: ${formatDateTimeInIST(loginDateTime)}`
      : `Wake-up time passed: ${formatDateTimeInIST(loginDateTime)}. You can still continue manually using the button above.`;
  })();

  return (
    <Alert severity={severity} sx={bannerSx}>
      <Typography variant="body2" sx={{ fontWeight: 600 }}>
        {message}
      </Typography>
    </Alert>
  );
}

export default ScheduleBanner;
