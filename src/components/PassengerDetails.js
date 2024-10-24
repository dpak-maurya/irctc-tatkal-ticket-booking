import React, { useState } from 'react';
import { AppBar, Tabs, Tab, Box,Typography } from '@mui/material';
import PassengerNames from './PassengerNames';
import PassengerList from './PassengerList';
import PropTypes from 'prop-types'; // Import PropTypes
import { sharedStyles } from '../styles';

const PassengerDetails = ({ formData, setFormData,handleChange }) => {
  const [value, setValue] = useState(0); // State to manage the active tab
  

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
  };

  return (
    <Box sx={sharedStyles.container}>
         <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Passenger Details
      </Typography>
        <AppBar position="static" color="default">
        <Tabs value={value} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="Passenger Names" />
          <Tab label="Passenger List" />
        </Tabs>
      </AppBar>
     
       
      
      <Box p={2} sx={{ bgcolor: '#f5f5f5', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, boxShadow: 2 }}>
        {value === 0 && (
          <PassengerNames formData={formData} handleChange={handleChange} />
        )}
        {value === 1 && (
          <PassengerList formData={formData} setFormData={setFormData} />
        )}
      </Box>
    </Box>
  );
};

// Add PropTypes validation
PassengerDetails.propTypes = {
  formData: PropTypes.object.isRequired, // Validate formData as an object
  setFormData: PropTypes.func.isRequired, // Validate setFormData as a function
  handleChange: PropTypes.func.isRequired,
};

export default PassengerDetails;
