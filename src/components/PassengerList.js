import React, { useState } from 'react';

const PassengerList = ({ formData, setFormData }) => {
  const [newPassenger, setNewPassenger] = useState({
    name: '',
    age: '',
    gender: 'Select Gender',
    preference: 'No Preference'
  });

  const handleAddPassenger = () => {
    if (newPassenger.name && newPassenger.age && newPassenger.gender !== 'Select Gender') {
      const updatedPassengers = [...(formData.passengers || []), newPassenger];
      setFormData(prevState => ({ ...prevState, passengers: updatedPassengers }));
      setNewPassenger({ name: '', age: '', gender: 'Select Gender', preference: 'No Preference' });
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setNewPassenger(prevState => ({ ...prevState, [name]: value }));
  };

  const handleRemovePassenger = (index) => {
    const updatedPassengers = formData.passengers.filter((_, i) => i !== index);
    setFormData(prevState => ({ ...prevState, passengers: updatedPassengers }));
  };

  return (
    <div className="form-section passenger-list">
      <h2>Passenger List</h2>
      <table>
        <thead>
          <tr>
            <th>Name</th>
            <th>Age</th>
            <th>Gender</th>
            <th>Preference</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {formData.passengers && formData.passengers.length > 0 ? (
            formData.passengers.map((passenger, index) => (
              <tr key={index}>
                <td>{passenger.name}</td>
                <td>{passenger.age}</td>
                <td>{passenger.gender}</td>
                <td>{passenger.preference}</td>
                <td><button onClick={() => handleRemovePassenger(index)}>Remove</button></td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="5">No passengers found.</td>
            </tr>
          )}
        </tbody>
      </table>

      <div className="add-passenger">
        <input
          type="text"
          name="name"
          value={newPassenger.name}
          placeholder="Enter Passenger name"
          onChange={handleChange}
        />
        <input
          type="number"
          name="age"
          value={newPassenger.age}
          placeholder="Enter Passenger age"
          onChange={handleChange}
        />
        <select name="gender" value={newPassenger.gender} onChange={handleChange}>
          <option>Select Gender</option>
          <option>Male</option>
          <option>Female</option>
          <option>Other</option>
        </select>
        <select name="preference" value={newPassenger.preference} onChange={handleChange}>
          <option>No Preference</option>
          <option>Lower</option>
          <option>Middle</option>
          <option>Upper</option>
        </select>
        <button onClick={handleAddPassenger}>Add Passenger</button>
      </div>
    </div>
  );
};

export default PassengerList;
