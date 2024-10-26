import React, { useEffect, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import { getTimeFromString } from '../utils'; // Ensure you have this utility function
import { Button, Typography } from '@mui/material';

const BookingCountdown = () => {
    const {savedData,formData} = useAppContext();
    const { targetTime, loginMinutesBefore } = savedData;
    const {automationStatus} = formData;
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isBookingReady, setIsBookingReady] = useState(false);
    let intervalId = null;

    const startBookingCountdown = () => {
        clearInterval(intervalId);
        
        const targetDateTime = getTimeFromString(targetTime);
        const clickTime = new Date(targetDateTime.getTime() - loginMinutesBefore * 60 * 1000);
        const currentTime = new Date();
        
        const timeDifferenceInSeconds = Math.floor((clickTime - currentTime) / 1000);

        if (timeDifferenceInSeconds < 0) {
            setIsBookingReady(true);
            return;
        }

        setIsBookingReady(false);
        setTimeRemaining(timeDifferenceInSeconds);

        // Update the time remaining every second
        intervalId = setInterval(() => {
            const now = new Date();
            const remaining = Math.floor((clickTime - now) / 1000);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearInterval(intervalId);
                setIsBookingReady(true); // Ready to book
            }
        }, 1000);
    };

    useEffect(() => {
        if (automationStatus) {
            startBookingCountdown();
        } else {
            clearInterval(intervalId);
            setTimeRemaining(0);
            setIsBookingReady(false);
        }

        // Clean up on component unmount
        return () => clearInterval(intervalId);
    }, [automationStatus, targetTime, loginMinutesBefore]);

    return (
        <div>
            {timeRemaining > 0 ? (
                <Typography variant="body1" color='secondary' fontSize="bold" fontWeight="600" >Automatic Login to IRCTC starts in: {timeRemaining} seconds</Typography>
            ) : (
                <Button
                    id="book-button"
                    variant="contained"
                    
                    color={isBookingReady ? 'secondary' : 'primary'}
                    onClick={() => window.open('https://www.irctc.co.in/nget/train-search', '_blank')}
                >
                    {isBookingReady ? 'Book Ticket on IRCTC' : 'Go to IRCTC Website'}
                </Button>
            )}
        </div>
    );
};

export default BookingCountdown;