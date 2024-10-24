import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Typography,
  TextField,
  Button,
  List,
  ListItem,
  ListItemText,
  IconButton,
  FormControlLabel,
  Checkbox
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';

const PassengerNames = ({ formData, handleChange }) => {
  const [newPassenger, setNewPassenger] = useState('');

  const handleAddPassenger = () => {
    if (newPassenger.trim()) {
      const updatedNames = [...formData.passengerNames, newPassenger.trim()];
      handleChange({
        target: { name: 'passengerNames', value: updatedNames },
      });
      setNewPassenger('');
    }
  };

  const handleRemovePassenger = (index) => {
    const updatedNames = formData.passengerNames.filter((_, i) => i !== index);
    handleChange({
      target: { name: 'passengerNames', value: updatedNames },
    });
  };

  const handleKeyPress = (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAddPassenger();
    }
  };

  return (
    <Box >
     <FormControlLabel
          control={
            <Checkbox
              checked={formData.useIRCTCMasterData}
              onChange={handleChange}
              name="useIRCTCMasterData"
              sx={{ color: '#007BFF', '&.Mui-checked': { color: '#0056b3' } }}
            />
          }
          label="Use IRCTC Master Data"
        />
      
      <Box  sx={{
        p: 3,
        mb: 3,
        
        backgroundColor: '#f9f9f9',
        
        display: 'flex',
        justifyContent: 'space-between',
      }}>
    <Box sx={{ flex: 1, mr: 2 }}>
  {formData.passengerNames.length > 0 ? (
    <List>
      {formData.passengerNames.map((name, index) => (
        <ListItem
          key={index}
          secondaryAction={
            <IconButton
              edge="end"
              aria-label="delete"
              onClick={() => handleRemovePassenger(index)}
              color="error"
            >
              <DeleteIcon />
            </IconButton>
          }
          sx={{ mb: 1, p: 1, boxShadow: 2, borderRadius: '4px' }}
        >
          <ListItemText primary={`${index + 1}. ${name}`} /> {/* Displaying number */}
        </ListItem>
      ))}
    </List>
  ) : (
    <Typography variant="body1" color="textSecondary">
      No passenger name added.
    </Typography>
  )}
</Box>


    <Box sx={{ flex: 1, ml: 2 }}>
      <Box sx={{ display: 'flex', mb: 2 }}>
        <TextField
          fullWidth
          variant="outlined"
          size="small"
          placeholder="Enter first name matching with IRCTC Master Data"
          value={newPassenger}
          onChange={(e) => setNewPassenger(e.target.value)}
          onKeyPress={handleKeyPress}
          sx={{backgroundColor: 'white'}}
        />
        <Button variant="contained" color="primary" onClick={handleAddPassenger} sx={{ ml: 1 }}>
          Add
        </Button>
      </Box>
    </Box>
      </Box>
     
    </Box>
  );
};

PassengerNames.propTypes = {
  formData: PropTypes.shape({
    passengerNames: PropTypes.arrayOf(PropTypes.string),
    useIRCTCMasterData: PropTypes.bool,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default PassengerNames;
