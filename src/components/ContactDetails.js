import React from 'react';

const ContactDetails = ({ formData, handleChange }) => {
  return (
    <div className="form-section contact-details">
      <h2>Contact Details</h2>
      <label>Mobile Number</label>
      <input
        type="text"
        name="mobileNumber"
        value={formData.mobileNumber}
        placeholder="Enter Passenger Mobile No."
        onChange={handleChange}
      />
      <p className="error-message">
        Please enter a valid mobile number (if empty IRCTC logged-in user mobile number will be taken by default)
      </p>
    </div>
  );
};

export default ContactDetails;
