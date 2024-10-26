import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Box, Typography } from '@mui/material';
import PassengerNames from './PassengerNames';
import PassengerList from './PassengerList';
import { sharedStyles } from '../styles';
import { useAppContext } from '../contexts/AppContext';

const PassengerDetails = () => {
  const { formData, setFormData, handleChange } = useAppContext();
  const [value, setValue] = useState(0); // State to manage the active tab

  // Retrieve selected tab from Chrome storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('selectedTab', (result) => {
        if (result.selectedTab !== undefined) {
          setValue(result.selectedTab);
        }
      });
    }
  }, []);

  const handleTabChange = (event, newValue) => {
    setValue(newValue);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ 'selectedTab': newValue }); // Save the new tab value
    }
  };

  return (
    <Box sx={sharedStyles.container}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Passenger Details
      </Typography>
      <AppBar position="static" color="default">
        <Tabs value={value} onChange={handleTabChange} textColor="primary" indicatorColor="primary">
          <Tab label="Passenger List" />
          <Tab label="Passenger Master Data" />
        </Tabs>
      </AppBar>

      <Box p={2} sx={{ bgcolor: '#f5f5f5', borderBottomLeftRadius: 8, borderBottomRightRadius: 8, boxShadow: 2 }}>
        {value === 0 && (
          <PassengerList formData={formData} setFormData={setFormData} />
        )}
        {value === 1 && (
          <PassengerNames formData={formData} handleChange={handleChange} />
        )}
      </Box>
    </Box>
  );
};

export default PassengerDetails;