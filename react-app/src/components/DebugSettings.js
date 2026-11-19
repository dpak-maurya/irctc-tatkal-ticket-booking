import React from 'react';
import PropTypes from 'prop-types';
import {
  FormControlLabel,
  IconButton,
  Switch,
  Tooltip,
} from '@mui/material';
import BugReportOutlinedIcon from '@mui/icons-material/BugReportOutlined';

function DebugSettings({ label = 'Debug Mode', iconOnly = false }) {
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

  // Small screens: a bug icon that is highlighted while debug logging is on.
  if (iconOnly) {
    return (
      <Tooltip title={`Debug Mode: ${debugMode ? 'on' : 'off'}`} arrow>
        <IconButton
          size="small"
          aria-label="Debug Mode"
          aria-pressed={debugMode}
          color={debugMode ? 'primary' : 'default'}
          onClick={() => handleDebugModeChange({ target: { checked: !debugMode } })}
          sx={{ backgroundColor: debugMode ? 'action.selected' : 'transparent' }}
        >
          <BugReportOutlinedIcon fontSize="small" />
        </IconButton>
      </Tooltip>
    );
  }

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
        label={label}
        sx={{ 
          ml: 0,
          mr: 0,
          whiteSpace: 'nowrap',
          '& .MuiFormControlLabel-label': {
            fontSize: '0.875rem',
            color: 'text.secondary'
          }
        }}
      />
    </Tooltip>
  );
}

DebugSettings.propTypes = {
  label: PropTypes.string,
  iconOnly: PropTypes.bool,
};

export default DebugSettings; 