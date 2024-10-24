import React from 'react';
import PropTypes from 'prop-types';

function PassengerNames({ formData, handleChange }) {
  return (
    <div className="form-section passenger-names">
      <h2>Passenger Names</h2>
      <textarea
        name="passengerNames"
        value={formData.passengerNames}
        placeholder="Enter passenger names, just write first name which matches with IRCTC master data and if multiple names separate with commas i.e. Ajay, Chandan"
        onChange={handleChange}
      />
      <label>
        <input
          type="checkbox"
          name="useIRCTCMasterData"
          checked={formData.useIRCTCMasterData}
          onChange={handleChange}
        />
        IRCTC Master Data
      </label>
    </div>
  );
}

PassengerNames.propTypes = {
  formData: PropTypes.shape({
    passengerNames: PropTypes.string,
    useIRCTCMasterData: PropTypes.bool,
  }).isRequired,
  handleChange: PropTypes.func.isRequired,
};

export default PassengerNames;
