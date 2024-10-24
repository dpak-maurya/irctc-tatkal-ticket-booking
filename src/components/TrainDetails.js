import React from 'react';
import { TextField, Box, Typography, Select, MenuItem, FormControl, InputLabel } from '@mui/material';
import PropTypes from 'prop-types';
import { sharedStyles } from '../styles';

function TrainDetails({ formData, handleChange }) {
  return (
    <Box 
      sx={sharedStyles.container}
    >
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Train Details
      </Typography>
      <TextField
        fullWidth
        label="Date"
        type="date"
        id="dateString"
        name="dateString"
        value={formData.dateString || new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0]}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <TextField
        fullWidth
        label="Train Number"
        id="trainNumber"
        name="trainNumber"
        value={formData.trainNumber}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <TextField
        fullWidth
        label="From"
        id="from"
        name="from"
        value={formData.from}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <TextField
        fullWidth
        label="To"
        id="to"
        name="to"
        value={formData.to}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        InputProps={{
          sx: sharedStyles.input, // Apply shared input styles
        }}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="quotaType-label">Quota Type</InputLabel>
        <Select
          labelId="quotaType-label"
          id="quotaType"
          name="quotaType"
          value={formData.quotaType}
          onChange={handleChange}
          label="Quota Type"
          variant="outlined"
          InputProps={{
            sx: sharedStyles.select, // Apply shared input styles
          }}
          sx={{backgroundColor: 'white'}}
        >
          <MenuItem value="GENERAL">GENERAL</MenuItem>
          <MenuItem value="TATKAL">TATKAL</MenuItem>
        </Select>
      </FormControl>
      <FormControl fullWidth margin="normal">
        <InputLabel id="accommodationClass-label">Accommodation Class</InputLabel>
        <Select
          labelId="accommodationClass-label"
          id="accommodationClass"
          name="accommodationClass"
          value={formData.accommodationClass}
          onChange={handleChange}
          label="Accommodation Class"
          variant="outlined"
          sx={{backgroundColor: 'white'}}
          InputProps={{
            sx: sharedStyles.select, // Apply shared input styles
          }}
        >
          <MenuItem value="SL">Sleeper (SL)</MenuItem>
          <MenuItem value="3A" selected>AC 3 Tier (3A)</MenuItem>
          <MenuItem value="2A">AC 2 Tier (2A)</MenuItem>
          <MenuItem value="1A">AC First Class (1A)</MenuItem>
          <MenuItem value="3E">AC 3 Economy (3E)</MenuItem>
          <MenuItem value="EC">Exec. Chair Car (EC)</MenuItem>
          <MenuItem value="CC">AC Chair car (CC)</MenuItem>
          <MenuItem value="EV">Vistadome AC (EV)</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}

TrainDetails.propTypes = {
  formData: PropTypes.shape({
    dateString: PropTypes.string.isRequired,
    trainNumber: PropTypes.string.isRequired,
    from: PropTypes.string.isRequired,
    to: PropTypes.string.isRequired,
    quotaType: PropTypes.string.isRequired,
    accommodationClass: PropTypes.string.isRequired,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TrainDetails;
