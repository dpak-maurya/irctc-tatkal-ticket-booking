import React, { useEffect } from 'react';
import PropTypes from 'prop-types';
import { useAppContext } from '../contexts/AppContext';

const CountdownTimer = ({ targetTime, loginMinutesBefore, automationStatus }) => {
  const { timerValue, startCountdown } = useAppContext();

  useEffect(() => {
    if (automationStatus) {
      startCountdown(); // Start the countdown based on the context
    }
  }, [targetTime, loginMinutesBefore, automationStatus, startCountdown]);

  return (
    <div>
      {automationStatus && timerValue > 0 && <p>Automatic Login to IRCTC starts in: {timerValue} seconds</p>}
    </div>
  );
};

CountdownTimer.propTypes = {
  targetTime: PropTypes.string.isRequired,
  loginMinutesBefore: PropTypes.number.isRequired,
  automationStatus: PropTypes.bool.isRequired,
};

export default CountdownTimer;
