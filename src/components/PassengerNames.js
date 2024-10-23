import React from 'react';

const PassengerNames = ({ formData, handleChange }) => {
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
};

export default PassengerNames;
