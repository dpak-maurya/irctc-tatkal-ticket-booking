import React from 'react';
import PropTypes from 'prop-types';


function ContactDetails({ formData, handleChange }) {
  return (
    <div className="form-section contact-details">
      <h2>Contact Details</h2>
      <div>
        <label htmlFor="mobileNumber">Mobile Number:</label>
        <input
          type="tel"
          id="mobileNumber"
          name="mobileNumber"
          value={formData.mobileNumber}
          onChange={handleChange}
          required
        />
      </div>
      <p className="error-message">
        Please enter a valid mobile number (if empty IRCTC logged-in user mobile number will be taken by default)
      </p>
    </div>
  );
}

ContactDetails.propTypes = {
  formData: PropTypes.shape({
    mobileNumber: PropTypes.string,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default ContactDetails;
