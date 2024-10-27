import React, { useState, useEffect } from 'react';
import { AppBar, Tabs, Tab, Box, Checkbox, Typography, FormControlLabel, Stack } from '@mui/material';
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
    <Box sx={{...sharedStyles.container, minHeight: '350px'}}>
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Passenger Details
      </Typography>

      <Box sx={{ bgcolor: '#f5f5f5', borderRadius: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
          sx={{ width: '100%', overflow: 'hidden', paddingX: 2 }}
        >
          {/* AppBar with Tabs on the left side */}
          <Box sx={{ flexGrow: 1, minWidth: 0 }}>
            <AppBar position="static" color="default">
              <Tabs
                value={value}
                onChange={handleTabChange}
                textColor="primary"
                indicatorColor="primary"
              >
                <Tab label="Passenger List" />
                <Tab label="Passenger Master Data" />
              </Tabs>
            </AppBar>
          </Box>

          {/* Checkbox on the right side */}
          <Box sx={{ flexShrink: 0, marginLeft: 2 }}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.masterData}
                  onChange={handleChange}
                  name="masterData"
                  color="primary"
                  size="small"
                  sx={{ color: 'rebeccapurple', '&.Mui-checked': { color: 'primary.main' } }}
                />
              }
              label="Use IRCTC Master Data"
              sx={{ whiteSpace: 'nowrap' }}
            />
          </Box>
        </Stack>

        <Box p={2}>
          {value === 0 && (
            <PassengerList formData={formData} setFormData={setFormData} />
          )}
          {value === 1 && (
            <PassengerNames formData={formData} handleChange={handleChange} />
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default PassengerDetails;