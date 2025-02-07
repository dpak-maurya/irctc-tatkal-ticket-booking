import React from 'react';
import { 
  FormControlLabel, 
  Switch,
  Tooltip,
} from '@mui/material';

function DebugSettings() {
  const [debugMode, setDebugMode] = React.useState(false);

  React.useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get('debugMode', function(result) {
        setDebugMode(result.debugMode || false);
      });
    } else {
      console.warn('Chrome storage is not available.');
    }
  }, []);

  const handleDebugModeChange = (event) => {
    const newDebugMode = event.target.checked;
    setDebugMode(newDebugMode);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ debugMode: newDebugMode }, function() {
        if (chrome.runtime.lastError) {
          console.error('Error saving debug mode:', chrome.runtime.lastError);
        }
      });
    }
  };

  return (
    <Tooltip title="Enable event logging to view script events in the IRCTC console." arrow>
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
        label="Debug Mode"
        sx={{ 
          ml: 0,
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            color: 'text.secondary'
          }
        }}
      />
    </Tooltip>
  );
}

export default DebugSettings; 