import React from 'react';
import { Box, Button, Typography } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LogoIcon from './LogoIcon';
import PropTypes from 'prop-types';
import CustomSwitch from './CustomSwitch';
import CountdownTimer from './CountDownTimer'; // Corrected casing

const useStyles = makeStyles({
  headerContainer: {
    marginTop: '20px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    padding: '10px 20px',
    boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    '@media (max-width: 600px)': { // Use plain media query for small screens
      flexDirection: 'column', // Stack elements vertically on small screens
      alignItems: 'flex-start',
    },
  },
  title: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 600px)': { // Adjust for small screens
      marginBottom: '10px',
      fontSize: '1.2rem', // Smaller text for title
    },
  },
  icon: {
    height: '40px',
    marginRight: '10px',
    '@media (max-width: 600px)': { // Reduce icon size for small screens
      height: '30px',
      marginRight: '5px',
    },
  },
  customButton: {
    marginLeft: '20px',
    '@media (max-width: 600px)': { // Remove margin on small screens
      marginLeft: '0',
      marginBottom: '10px',
      fontSize: '0.8rem', // Smaller button text
    },
  },
  labelText: {
    paddingRight: '10px',
    fontWeight: 'bold',
    '@media (max-width: 600px)': { // Smaller label text for small screens
      fontSize: '0.9rem',
    },
  },
  switch: {
    display: 'flex',
    alignItems: 'center',
    '@media (max-width: 600px)': { // Add space on smaller screens
      marginTop: '10px',
    },
  },
  autoBookingText: {
    fontWeight: 'bold',
    '@media (max-width: 600px)': { // Smaller text for "Auto Booking"
      fontSize: '1rem',
    },
  },
});

const Header = ({ formData, toggleAutomation }) => {
  const classes = useStyles();
  

  return (
    <Box className={classes.headerContainer}>
      <Box className={classes.title}>
        <LogoIcon className={classes.icon} />
        <Typography variant="h5" ml={2} className={classes.title} fontWeight="bold">
          Tatkal Ticket Booking
        </Typography>
        <Button variant="outlined" className={classes.customButton} href="HowToUse.js" target="_blank">
          How to Use
        </Button>
      </Box>
      <CountdownTimer targetTime={formData.targetTime} loginMinutesBefore={formData.loginMinutesBefore} automationStatus={formData.automationStatus}/>

      <Box display="flex" alignItems="center">
      <Typography variant="h6" fontWeight="bold" pr={2}>Auto Booking</Typography>
        <CustomSwitch
          checked={formData.automationStatus}
          onChange={toggleAutomation}
          name="automationStatus"
        />
      </Box>
    </Box>
  );
};

Header.propTypes = {
  formData: PropTypes.shape({
    automationStatus: PropTypes.bool.isRequired,
    targetTime: PropTypes.string.isRequired, // Added validation for targetTime
    loginMinutesBefore: PropTypes.number.isRequired, // Added validation for loginMinutesBefore
  }).isRequired,
  toggleAutomation: PropTypes.func.isRequired,
};

export default Header;
