import React from 'react';
import PropTypes from 'prop-types';

function TimerDetails({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h3>Timer Details</h3>
      <div className="form-group">
        <label htmlFor="targetTime">Tatkal Start Timer:</label>
        <input 
          type="time" 
          id="targetTime" 
          name="targetTime" 
          value={formData.targetTime} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="refreshTime">Refresh Time (ms):</label>
        <input 
          type="number" 
          id="refreshTime" 
          name="refreshTime" 
          value={formData.refreshTime} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="loginMinutesBefore">Login Minutes Before:</label>
        <input 
          type="number" 
          id="loginMinutesBefore" 
          name="loginMinutesBefore" 
          value={formData.loginMinutesBefore} 
          onChange={handleChange}
        />
      </div>
    </div>
  );
}

TimerDetails.propTypes = {
  formData: PropTypes.shape({
    targetTime: PropTypes.string,
    refreshTime: PropTypes.string,
    loginMinutesBefore: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default TimerDetails;
