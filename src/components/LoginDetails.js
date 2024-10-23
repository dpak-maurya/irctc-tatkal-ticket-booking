import React from 'react';

const LoginDetails = ({ formData, handleChange }) => {
  return (
    <div className="form-section">
      <h3>Login Details</h3>
      <div className="form-group">
        <label htmlFor="username">Username:</label>
        <input 
          type="text" 
          id="username" 
          name="username" 
          value={formData.username} 
          onChange={handleChange}
          placeholder="Enter IRTC username" 
        />
      </div>
      <div className="form-group">
        <label htmlFor="password">Password:</label>
        <input 
          type="password" 
          id="password" 
          name="password" 
          value={formData.password} 
          onChange={handleChange}
          placeholder="Enter IRTC password" 
        />
      </div>
    </div>
  );
};

export default LoginDetails;
