import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { isEqual } from '../utils';
import defaultSettings from '../defaultSettings';
import { 
  getFormDataFromStorage, 
  saveFormDataToStorage, 
  removeFormDataFromStorage, 
  getAutomationStatus, 
  setAutomationStatus 
} from '../apis';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [savedData, setSavedData] = useState(defaultSettings);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isBookingReady, setIsBookingReady] = useState(true);

  // Handle change for form fields
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;

    setFormData((prevState) => ({
      ...prevState,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  // Load form data on mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const data = await getFormDataFromStorage();
        if (data) {
          setFormData(data);
          setSavedData(data);
        }
        setIsFormLoaded(true);
      } catch (error) {
        console.error('Failed to load data:', error);
      }
    };
    loadData();
  }, []);

  // Track unsaved changes after form load
  useEffect(() => {
    if (isFormLoaded) {
      setIsDirty(!isEqual(formData, savedData, ['automationStatus']));
    }
  }, [formData, savedData, isFormLoaded]);

  // Save form data to chrome.storage
  const saveFormData = async () => {
    try {
      await saveFormDataToStorage(formData);
      setSavedData(formData);
      setIsDirty(false);
    } catch (error) {
      console.error('Failed to save data:', error);
    }
  };

  // Warn user about unsaved changes on page unload
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      if (isDirty) {
        e.preventDefault();
        e.returnValue = ''; // Modern browsers show a default message
      }
    };
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [isDirty]);

  const toggleAutomation = async () => {
    try {
      setFormData((prevState) => ({
        ...prevState,
        automationStatus: !prevState.automationStatus,
      }));
      const currentStatus = await getAutomationStatus();
      const updatedStatus = !currentStatus;

      await setAutomationStatus(updatedStatus);

    } catch (error) {
      console.error('Failed to toggle automation status:', error);
    }
  };

  const resetSettings = async () => {
    setFormData(defaultSettings);
    setSavedData(defaultSettings);
    try {
      await removeFormDataFromStorage();
    } catch (error) {
      console.error('Failed to reset settings:', error);
    }
    setIsDirty(false);
  };

  return (
    <AppContext.Provider
      value={{
        formData,
        setFormData,
        savedData,
        isDirty,
        saveFormData,
        handleChange,
        toggleAutomation,
        isBookingReady,
        setIsBookingReady,
        resetSettings,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useAppContext = () => useContext(AppContext);

AppProvider.propTypes = {
  children: PropTypes.node.isRequired,
};

export default AppContext;