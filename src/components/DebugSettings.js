import React from 'react';
import { 
  FormControlLabel, 
  Switch,
} from '@mui/material';

function DebugSettings() {
  const [debugMode, setDebugMode] = React.useState(false);

  React.useEffect(() => {
    chrome.storage.local.get('debugMode', function(result) {
      setDebugMode(result.debugMode || false);
    });
  }, []);

  const handleDebugModeChange = (event) => {
    const newDebugMode = event.target.checked;
    setDebugMode(newDebugMode);
    
    chrome.storage.local.set({ debugMode: newDebugMode }, function() {
      if (chrome.runtime.lastError) {
        console.error('Error saving debug mode:', chrome.runtime.lastError);
      }
    });
  };

  return (
    <FormControlLabel
      control={
        <Switch
          checked={debugMode}
          onChange={handleDebugModeChange}
          name="debugMode"
          size="small"
          color="primary"
        />
      }
      label="Console Log"
      sx={{ 
        ml: 0,
        '& .MuiFormControlLabel-label': {
          fontSize: '0.875rem',
          color: 'text.secondary'
        }
      }}
    />
  );
}

export default DebugSettings; 