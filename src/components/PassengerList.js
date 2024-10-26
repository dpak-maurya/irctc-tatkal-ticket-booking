import React, { useState } from 'react';
import PropTypes from 'prop-types';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Button,
  TextField,
  Select,
  MenuItem,
  InputLabel,
  FormControl,
  IconButton,
  Grid
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import { useAppContext } from '../contexts/AppContext';

const tableCellStyles = {
  border: '1px solid rgba(224, 224, 224, 1)',
};

const PassengerList = () => {
  const { formData, setFormData } = useAppContext();
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    age: '',
    gender: '',
    preference: 'No Preference',
  });

  // Handler for adding a new passenger
  const addPassenger = () => {
    if (newPassenger.name && newPassenger.age && newPassenger.gender) {
      if (newPassenger.preference.toLowerCase() === 'no preference') {
        newPassenger.preference = '';
      }
      const updatedPassengers = [...formData.passengerList, { ...newPassenger, isSelected: true }];
      setFormData((prevState) => ({ ...prevState, passengerList: updatedPassengers }));
      setNewPassenger({ name: '', age: '', gender: '', preference: '' });
    }
  };

  // Handler for form input changes
  const handlePassengerChange = (e) => {
    let { name, value } = e.target;
    if(name === 'age'){
      value = value.replace(/\D/g, '')
    }
    setNewPassenger((prev) => ({ ...prev, [name]: value }));
  };

  // Handler for removing a passenger
  const handleRemovePassenger = (index) => {
    const updatedPassengers = formData.passengerList.filter((_, i) => i !== index);
    setFormData((prevState) => ({ ...prevState, passengerList: updatedPassengers }));
  };

  // Handler for marking/unmarking a passenger
  const handleMarkPassenger = (index) => {
    const updatedPassengers = formData.passengerList.map((passenger, i) => 
      i === index ? { ...passenger, isSelected: !passenger.isSelected } : passenger
    );
    setFormData((prevState) => ({ ...prevState, passengerList: updatedPassengers }));
  };

  return (
    <Box >
      <TableContainer component={Paper} sx={{ mt: 3 }}>
        <Table sx={{ minWidth: 650, border: '1px solid rgba(224, 224, 224, 1)' }}>
          <TableHead>
            <TableRow>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Select
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Name
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Age
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Gender
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Preference
              </TableCell>
              <TableCell sx={{ fontWeight: 'bold', ...tableCellStyles }}>
                Action
              </TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {formData.passengerList?.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} align="center" sx={{ color: '#999', ...tableCellStyles }}>
                  No passengers found.
                </TableCell>
              </TableRow>
            ) : (
              formData.passengerList?.map((passenger, index) => (
                <TableRow
                  key={index}
                  sx={{
                    '&:hover': { backgroundColor: '#f1f1f1' },
                    border: '1px solid rgba(224, 224, 224, 1)',
                  }}
                >
                  <TableCell sx={tableCellStyles}>
                    <input 
                      type="checkbox" 
                      checked={passenger.isSelected} 
                      onChange={() => handleMarkPassenger(index)} // Toggle mark/unmark
                    />
                  </TableCell>
                  <TableCell sx={tableCellStyles}>{passenger.name}</TableCell>
                  <TableCell sx={tableCellStyles}>{passenger.age}</TableCell>
                  <TableCell sx={tableCellStyles}>{passenger.gender}</TableCell>
                  <TableCell sx={tableCellStyles}>{passenger.preference}</TableCell>
                  <TableCell sx={tableCellStyles}>
                    <IconButton onClick={() => handleRemovePassenger(index)} color="error">
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Input for new passenger */}
      <Grid container spacing={2} mt={3}>
        <Grid item xs={3}>
          <TextField
            label="Enter Passenger Name"
            name="name"
            value={newPassenger.name}
            onChange={handlePassengerChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '#fff' }}
          />
        </Grid>
        <Grid item xs={3}>
          <TextField
            label="Enter Passenger Age"
            name="age"
            value={newPassenger.age}
            onChange={handlePassengerChange}
            fullWidth
            variant="outlined"
            sx={{ backgroundColor: '#fff' }}
          />
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Gender</InputLabel>
            <Select
              name="gender"
              value={newPassenger.gender}
              onChange={handlePassengerChange}
              label="Gender"
              sx={{backgroundColor: 'white'}}
            >
              <MenuItem value="M">Male</MenuItem>
              <MenuItem value="F">Female</MenuItem>
              <MenuItem value="T">Transgender</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={3}>
          <FormControl fullWidth variant="outlined">
            <InputLabel>Preference</InputLabel>
            <Select
              name="preference"
              value={newPassenger.preference}
              onChange={handlePassengerChange}
              label="Preference"
              sx={{backgroundColor: 'white'}}
            >
              <MenuItem value="No Preference">No Preference</MenuItem>
              <MenuItem value="LB">Lower</MenuItem>
              <MenuItem value="MB">Middle</MenuItem>
              <MenuItem value="UB">Upper</MenuItem>
              <MenuItem value="SL">Side Lower</MenuItem>
              <MenuItem value="SU">Side Upper</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
          <Button variant="contained" color="primary" onClick={addPassenger}>
            Add Passenger
          </Button>
        </Grid>
      </Grid>
    </Box>
  );
};

PassengerList.propTypes = {
  formData: PropTypes.shape({
    passengerList: PropTypes.arrayOf(
      PropTypes.shape({
        isSelected: PropTypes.bool.isRequired,
        name: PropTypes.string.isRequired,
        age: PropTypes.string.isRequired,
        gender: PropTypes.string,
        preference: PropTypes.string,
      })
    ).isRequired,
  }).isRequired,
  setFormData: PropTypes.func.isRequired,
};

export default PassengerList;
