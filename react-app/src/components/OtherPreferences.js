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
  Typography
} from '@mui/material';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';

const OtherPreferences = () => {
  const { formData, handleChange } = useAppContext();

  return (
    <Box  sx={sharedStyles.container}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Other Preferences
      </Typography>
      
      <FormGroup>
        <FormControlLabel
          control={
            <Checkbox
              checked={formData.autoUpgradation}
              onChange={handleChange}
              name="autoUpgradation"
            />
          }
          label="Consider for Auto Upgradation"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={formData.confirmberths}
              onChange={handleChange}
              name="confirmberths"
            />
          }
          label="Book only if confirmed berths are allotted"
        />

        <FormControlLabel
          control={
            <Checkbox
              checked={!!formData.noFood}
              onChange={handleChange}
              name="noFood"
            />
          }
          label="I don't want Food/Beverages (only on trains that show this option)"
        />
      </FormGroup>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Travel Insurance (Incl. of GST)</FormLabel>
        <RadioGroup
          name="travelInsuranceOpted"
          value={formData.travelInsuranceOpted}
          onChange={handleChange}
        >
          <FormControlLabel
            value="yes"
            control={<Radio />}
            label="Yes, and I accept the terms & conditions"
          />
          <FormControlLabel
            value="no"
            control={<Radio />}
            label="No, I don't want travel insurance"
          />
        </RadioGroup>
      </FormControl>
    </Box>
  );
};

export default OtherPreferences;
