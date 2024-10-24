import React from 'react';
import { Box, Button, Typography, Switch } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LogoIcon from './LogoIcon';

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

const Header = () => {
  const classes = useStyles();
  const [autoBooking, setAutoBooking] = React.useState(false);

  const handleToggle = () => {
    setAutoBooking(!autoBooking);
  };

  return (
    <Box className={classes.headerContainer}>
      <Box className={classes.title}>
        <LogoIcon className={classes.icon} />
        <Typography variant="h4" ml={2} className={classes.title} fontWeight="bold">
          Tatkal Ticket Booking
        </Typography>
        <Button variant="outlined" className={classes.customButton} href="how-to-use.html" target="_blank">
          How to Use
        </Button>
      </Box>
      <Box id="countdown" className={classes.countdown}></Box>
      <Box className={classes.switch}>
        <Typography className={classes.labelText}>Auto Booking</Typography>
        <Switch
          checked={autoBooking}
          onChange={handleToggle}
          color="primary"
        />
      </Box>
    </Box>
  );
};

export default Header;
