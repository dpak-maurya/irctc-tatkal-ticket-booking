// components/Header.js
import React from 'react';
import { Box, Button, Typography, Grid } from '@mui/material';
import { makeStyles } from '@mui/styles';
import LogoIcon from './LogoIcon';
import CustomSwitch from './CustomSwitch';
import { useAppContext } from '../contexts/AppContext';
import BookingCountdown from './BookingCountDown';

const useStyles = makeStyles({
    headerContainer: {
        backgroundColor: '#fff',
        padding: '10px 20px',
        boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
    },
    title: {
        display: 'flex',
        alignItems: 'center',
        '@media (max-width: 600px)': {
            marginBottom: '10px',
            fontSize: '1.2rem',
            justifyContent: 'center',
            width: '100%',
        },
    },
    icon: {
        height: '40px',
        marginRight: '10px',
        '@media (max-width: 600px)': {
            height: '30px',
            marginRight: '5px',
        },
    },
    customButton: {
        marginLeft: '20px',
        '@media (max-width: 600px)': {
            marginLeft: '0',
            marginBottom: '10px',
            fontSize: '0.8rem',
        },
    },
    switchContainer: {
        display: 'flex',
        alignItems: 'center',
        '@media (max-width: 600px)': {
            marginTop: '10px',
            justifyContent: 'center',
            width: '100%',
        },
    },
    countdownContainer: {
        '@media (max-width: 600px)': {
            justifyContent: 'center',
            width: '100%',
            marginTop: '10px',
        },
    },
});

const Header = () => {
    const { formData, toggleAutomation } = useAppContext();
    const classes = useStyles();

    return (
        <Box className={classes.headerContainer}>
            <Grid
                container
                alignItems="center"
                justifyContent={{ xs: 'center', sm: 'space-between' }}
                spacing={2}
            >
                <Grid item xs={12} sm="auto" className={classes.title}>
                    <LogoIcon className={classes.icon} />
                    <Typography variant="h5" fontWeight="bold">
                        Tatkal Ticket Booking
                    </Typography>
                    <Button
                        variant="text"
                        color="secondary"
                        onClick={() => window.open('/how-to-use.html', '_blank')}
                        className={classes.customButton}
                    >
                        How to Use
                    </Button>
                </Grid>

                <Grid item xs={12} sm="auto" display="flex" alignItems="center" className={classes.countdownContainer}>
                    <BookingCountdown />
                </Grid>

                <Grid item xs={12} sm="auto" className={classes.switchContainer}>
                    <Typography variant="h6" fontWeight="bold" pr={2}>
                        Auto Booking
                    </Typography>
                    <CustomSwitch
                        checked={formData.automationStatus}
                        onChange={toggleAutomation}
                        name="automationStatus"
                    />
                </Grid>
            </Grid>
        </Box>
    );
};

export default Header;
