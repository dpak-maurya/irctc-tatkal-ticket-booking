import React from 'react';
import { FormControlLabel, Checkbox, Typography, Box, Tooltip,Button } from '@mui/material';
import { useAppContext } from '../contexts/AppContext';
import { sharedStyles } from '../styles';

export default function CaptchaReader() {
  const { formData, handleChange } = useAppContext();

  return (
    <Box sx={sharedStyles.container}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'nowrap' }}>
        <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold', color: '#333', whiteSpace: 'nowrap' }}>
          Captcha Settings
        </Typography>
        <Typography variant="h6" color="red" sx={{ ml: 1, fontSize: '1rem', whiteSpace: 'nowrap' }}>
          (Experimental)
        </Typography>
      </Box>



      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Tooltip title="May be slow or inaccurate.">
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.autoSolveCaptcha}
                onChange={handleChange}
                name="autoSolveCaptcha"
                color="primary"
              />
            }
            label="Auto Solve"
          />
        </Tooltip>

        <Tooltip title="Submits the solved captcha automatically.">
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.autoSubmitCaptcha}
                onChange={handleChange}
                name="autoSubmitCaptcha"
                color="primary"
                disabled={!formData.autoSolveCaptcha}
              />
            }
            label="Auto Submit"
          />
        </Tooltip>
      </Box>
    </Box>
  );
}
