import React from 'react';
import PropTypes from 'prop-types';

function PaymentDetails({ formData, handleChange }) {
  return (
    <div className="form-section">
      <h3>Payment Details</h3>
      <div className="form-group">
        <label htmlFor="paymentType">Payment Type:</label>
        <input 
          type="text" 
          id="paymentType" 
          name="paymentType" 
          value={formData.paymentType} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="paymentMethod">Payment Method:</label>
        <input 
          type="text" 
          id="paymentMethod" 
          name="paymentMethod" 
          value={formData.paymentMethod} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <label htmlFor="paymentProvider">Payment Provider:</label>
        <input 
          type="text" 
          id="paymentProvider" 
          name="paymentProvider" 
          value={formData.paymentProvider} 
          onChange={handleChange}
        />
      </div>
      <div className="form-group">
        <input 
          type="checkbox" 
          id="payAndBook" 
          name="payAndBook" 
          checked={formData.payAndBook} 
          onChange={handleChange}
        />
        <label htmlFor="payAndBook">Pay & Book (Show QR Code Page)</label>
      </div>
    </div>
  );
}

PaymentDetails.propTypes = {
  formData: PropTypes.shape({
    paymentType: PropTypes.string,
    paymentMethod: PropTypes.string,
    paymentProvider: PropTypes.string,
    payAndBook: PropTypes.bool,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default PaymentDetails;