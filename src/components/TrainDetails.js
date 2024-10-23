import React from 'react';

const TrainDetails = ({ formData, handleChange }) => {
  return (
    <div className="form-section">
      <h3>Train Details</h3>
      <div className="form-group">
        <label htmlFor="date">Date:</label>
        <input 
          type="date" 
          id="date" 
          name="dateString" 
          value={formData.dateString} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="trainNumber">Train Number:</label>
        <input 
          type="text" 
          id="trainNumber" 
          name="trainNumber" 
          value={formData.trainNumber} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="from">From:</label>
        <input 
          type="text" 
          id="from" 
          name="from" 
          value={formData.from} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="to">To:</label>
        <input 
          type="text" 
          id="to" 
          name="to" 
          value={formData.to} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="quotaType">Quota Type:</label>
        <select 
          id="quotaType" 
          name="quotaType" 
          value={formData.quotaType} 
          onChange={handleChange}
        >
          <option value="TATKAL">TATKAL</option>
          <option value="GENERAL">GENERAL</option>
        </select>
      </div>
      <div className="form-group">
        <label htmlFor="accommodationClass">Accommodation Class:</label>
        <select 
          id="accommodationClass" 
          name="accommodationClass" 
          value={formData.accommodationClass} 
          onChange={handleChange}
        >
          <option value="3A">AC 3 Tier (3A)</option>
          <option value="2A">AC 2 Tier (2A)</option>
          <option value="SL">Sleeper (SL)</option>
        </select>
      </div>
    </div>
  );
};

export default TrainDetails;
