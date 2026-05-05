import React, { useEffect, useRef, useState } from 'react';
import { useAppContext } from '../contexts/AppContext';
import {
    formatCountdownCompact,
    getLoginDateTime,
} from '../utils';
import { alpha } from '@mui/material/styles';
import { Button, Typography, Box } from '@mui/material';
import AccessTimeRoundedIcon from '@mui/icons-material/AccessTimeRounded';

const BookingCountdown = () => {
    const {savedData,formData} = useAppContext();
    const { scheduleDate, targetTime, loginMinutesBefore } = savedData;
    const {automationStatus} = formData;
    const [timeRemaining, setTimeRemaining] = useState(null);
    const [isBookingReady, setIsBookingReady] = useState(false);
    const intervalRef = useRef(null);

    const clearCountdown = () => {
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
    };

    const startBookingCountdown = () => {
        clearCountdown();

        const clickTime = getLoginDateTime(scheduleDate, targetTime, loginMinutesBefore);
        if (!clickTime) {
            setTimeRemaining(null);
            setIsBookingReady(false);
            return;
        }

        const updateRemainingTime = () => {
            const now = new Date();
            const remaining = Math.floor((clickTime - now) / 1000);
            setTimeRemaining(remaining);

            if (remaining <= 0) {
                clearCountdown();
                setTimeRemaining(0);
                setIsBookingReady(true);
                return;
            }

            setIsBookingReady(false);
        };

        updateRemainingTime();
        intervalRef.current = setInterval(updateRemainingTime, 1000);
    };

    useEffect(() => {
        if (automationStatus) {
            startBookingCountdown();
        } else {
            clearCountdown();
            setTimeRemaining(null);
            setIsBookingReady(false);
        }

        return clearCountdown;
    }, [automationStatus, scheduleDate, targetTime, loginMinutesBefore]);

    const loginDateTime = getLoginDateTime(scheduleDate, targetTime, loginMinutesBefore);

    const getStatusLabel = () => {
        if (!loginDateTime) {
            return '';
        }

        if (!Number.isFinite(timeRemaining) || timeRemaining <= 0) {
            return '';
        }

        return `Login starts in ${formatCountdownCompact(timeRemaining)}`;
    };

    const statusLabel = getStatusLabel();
    const showStatusLabel = automationStatus && Number.isFinite(timeRemaining) && timeRemaining > 0;

    return (
        <Box sx={{ minWidth: '180px', maxWidth: '240px', display: 'flex', justifyContent: 'center', alignItems: 'center', textAlign: 'right' }}>
            {showStatusLabel ? (
                <Box
                    sx={(theme) => ({
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: 0.75,
                        px: 1.25,
                        py: 0.6,
                        borderRadius: 999,
                        backgroundColor: alpha(theme.palette.secondary.main, 0.08),
                        border: '1px solid',
                        borderColor: alpha(theme.palette.secondary.main, 0.22),
                        color: 'secondary.main',
                        whiteSpace: 'nowrap',
                    })}
                >
                    <AccessTimeRoundedIcon sx={{ fontSize: 18 }} />
                    <Typography
                        variant="body2"
                        fontWeight="700"
                        sx={{ fontSize: '0.9rem', lineHeight: 1.2 }}
                    >
                        {statusLabel}
                    </Typography>
                </Box>
            ) : (
                <Button
                    id="book-button"
                    variant="outlined"
                    color="secondary"
                    onClick={() => window.open('https://www.irctc.co.in/nget/train-search', '_blank')}
                    sx={{ maxWidth: '200px' }}
                >
                    {isBookingReady ? 'Book Ticket on IRCTC' : 'Go to IRCTC Website'}
                </Button>
            )}
        </Box>
    );
};

export default BookingCountdown;
