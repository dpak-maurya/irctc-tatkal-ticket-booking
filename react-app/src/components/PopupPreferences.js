import React from 'react';
import {
  Box,
  Checkbox,
  FormControlLabel,
  FormGroup,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
  Typography,
  Tooltip
} from '@mui/material';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';

const PopupPreferences = () => {
  const { formData, handleChange } = useAppContext();

  return (
    <Box sx={sharedStyles.container}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Popup Configurations
      </Typography>
      
      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Preferred Website Language Popup</FormLabel>
        <RadioGroup
          row
          name="preferredLanguage"
          value={formData.preferredLanguage || 'English'}
          onChange={handleChange}
        >
          <FormControlLabel value="English" control={<Radio />} label="English" />
          <FormControlLabel value="हिंदी" control={<Radio />} label="Hindi (हिंदी)" />
        </RadioGroup>
      </FormControl>

      <FormGroup sx={{ mt: 2 }}>
        <Tooltip 
          title="When you search for a generic city code (like NDLS for New Delhi) but the train actually departs from a different station in the same city (like NZM or DLI), IRCTC shows a confirmation popup. Enable this to automatically click 'Yes' and proceed without interrupting the booking."
          placement="top"
          arrow
        >
          <FormControlLabel
            control={
              <Checkbox
                checked={formData.autoProcessPopup || false}
                onChange={handleChange}
                name="autoProcessPopup"
              />
            }
            label="Auto-Accept 'From/To Station' Confirmation Dialogs"
          />
        </Tooltip>
      </FormGroup>

    </Box>
  );
};

export default PopupPreferences;
