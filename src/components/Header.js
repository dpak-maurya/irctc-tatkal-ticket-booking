import React from 'react';
import { Box, Button, Typography, Switch } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LogoIcon from './LogoIcon';
import PropTypes from 'prop-types'; // Add this import

const useStyles = makeStyles({
    headerContainer: {
        marginTop: '20px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff', // Set background color for visibility
        padding: '10px 20px', // Add padding for better appearance
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)', // Optional shadow for elevation effect
        position: 'sticky',
        top: 0, // Stick to the top of the viewport
        zIndex: 1000, // Ensure it stays on top of other content
      },
  title: {
    display: 'flex',
    alignItems: 'center',
  },
  icon: {
    height: '40px',
    marginRight: '10px',
  },
  customButton: {
    marginLeft: '20px',
  },
  labelText: {
    paddingRight: '10px',
    fontWeight: 'bold',
  },
  switch: {
    display: 'flex',
    alignItems: 'center',
  },
});

const Header = ({ formData, toggleAutomation }) => {
  const classes = useStyles();
  

  return (
    <Box className={classes.headerContainer}>
      <Box className={classes.title}>
        <LogoIcon className={classes.icon} />
        <Typography variant="h4" ml={2} className={classes.title} fontWeight="bold">
          Tatkal Ticket Booking
        </Typography>
        <Button variant="outlined" className={classes.customButton} href="HowToUse.js" target="_blank">
          How to Use
        </Button>
      </Box>
      <Box id="countdown" className={classes.countdown}></Box>
      <Box className={classes.switch}>
        <Typography className={classes.labelText}>Auto Booking</Typography>
        <Switch
          checked={formData.automationStatus}
          onChange={toggleAutomation}
          color="primary"
          name="automationStatus"
        />
      </Box>
    </Box>
  );
};

Header.propTypes = { // Add this section
  formData: PropTypes.shape({
    automationStatus: PropTypes.bool.isRequired, // Define the shape and required status
  }).isRequired,
  toggleAutomation: PropTypes.func.isRequired, // Validate handleChange as a required function
};

export default Header;
