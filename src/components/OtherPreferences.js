import React from 'react';
import PropTypes from 'prop-types';

function OtherPreferences({ formData, handleChange }) {
  return (
    <div className="form-section other-preferences">
      <h2>Other Preferences</h2>
      <label>
        <input
          type="checkbox"
          name="autoUpgradation"
          checked={formData.autoUpgradation}
          onChange={handleChange}
        />
        Consider for Auto Upgradation.
      </label>
      <label>
        <input
          type="checkbox"
          name="bookOnlyIfConfirmed"
          checked={formData.bookOnlyIfConfirmed}
          onChange={handleChange}
        />
        Book only if confirmed berths are allotted.
      </label>

      <div className="travel-insurance">
        <p>Travel Insurance (Incl. of GST) ₹0.45/person</p>
        <label>
          <input
            type="radio"
            name="travelInsurance"
            value="yes"
            checked={formData.travelInsurance === 'yes'}
            onChange={handleChange}
          />
          Yes, and I accept the terms & conditions
        </label>
        <label>
          <input
            type="radio"
            name="travelInsurance"
            value="no"
            checked={formData.travelInsurance === 'no'}
            onChange={handleChange}
          />
          No, I {`don't`} want travel insurance
        </label>
      </div>
    </div>
  );
}

OtherPreferences.propTypes = {
  formData: PropTypes.shape({
    autoUpgradation: PropTypes.bool,
    bookOnlyIfConfirmed: PropTypes.bool,
    travelInsurance: PropTypes.bool,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default OtherPreferences;
