import React from 'react';
import PropTypes from 'prop-types';
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

const OtherPreferences = ({ formData, handleChange }) => {
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
              checked={formData.bookOnlyIfConfirmed}
              onChange={handleChange}
              name="bookOnlyIfConfirmed"
            />
          }
          label="Book only if confirmed berths are allotted"
        />
      </FormGroup>

      <FormControl component="fieldset" sx={{ mt: 2 }}>
        <FormLabel component="legend">Travel Insurance (Incl. of GST)</FormLabel>
        <RadioGroup
          name="travelInsurance"
          value={formData.travelInsurance}
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

OtherPreferences.propTypes = {
  formData: PropTypes.shape({
    autoUpgradation: PropTypes.bool,
    bookOnlyIfConfirmed: PropTypes.bool,
    travelInsurance: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default OtherPreferences;
