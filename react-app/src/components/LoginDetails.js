import React, { useState } from 'react';
import { TextField, Box, Typography, InputAdornment, IconButton, FormControl, InputLabel, OutlinedInput } from '@mui/material';
import { sharedStyles } from '../styles'; // Import the shared styles
import { useAppContext } from '../contexts/AppContext';
import { Visibility, VisibilityOff } from '@mui/icons-material';

function LoginDetails() {
  const { formData, handleChange } = useAppContext();
  const [showPassword, setShowPassword] = useState(false);
  
  const handleClickShowPassword = () => setShowPassword((show) => !show);
  const handleMouseDownPassword = (event) => {
    event.preventDefault();
  };

  const handleMouseUpPassword = (event) => {
    event.preventDefault();
  };

  return (
    (<Box sx={sharedStyles.container}> {/* Apply shared container styles */}
      <Typography variant="h5" gutterBottom align="center" sx={{ fontWeight: 'bold', color: '#333' }}>
        Login Details
      </Typography>
      <TextField
        fullWidth
        label="Username"
        id="username"
        name="username"
        value={formData.username}
        onChange={handleChange}
        margin="normal"
        required
        variant="outlined"
        placeholder="Enter Irctc username"
        slotProps={{
          input: {
            sx: sharedStyles.input, // Apply shared input styles
          }
        }}
      />
      <FormControl fullWidth variant="outlined" margin="normal" >
        <InputLabel htmlFor="password">Password</InputLabel>
        <OutlinedInput
          id="password"
          type={showPassword ? 'text' : 'password'}
          value={formData.password}
          onChange={handleChange}
          name="password"
          placeholder="Enter Irctc password"
          sx={{ width: '100%', backgroundColor: 'white', borderRadius: 1, '& .MuiOutlinedInput-root': { '& fieldset': { borderRadius: 1 } } }}
          endAdornment={
            <InputAdornment position="end">
              <IconButton
                aria-label={
                  showPassword ? 'hide the password' : 'display the password'
                }
                onClick={handleClickShowPassword}
                onMouseDown={handleMouseDownPassword}
                onMouseUp={handleMouseUpPassword}
                edge="end"
              >
                {showPassword ? <VisibilityOff /> : <Visibility />}
              </IconButton>
            </InputAdornment>
          }
          label="Password"
        />
      </FormControl>
    </Box>)
  );
}


export default LoginDetails;
