import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTimeFromString, isEqual } from '../utils';
import defaultSettings from '../defaultSettings';
import { getFormDataFromStorage, saveFormDataToStorage, removeFormDataFromStorage, getAutomationStatus, setAutomationStatus } from '../apis';

const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [savedData, setSavedData] = useState(defaultSettings);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [showButton, setShowButton] = useState(true);
  const [timerValue, setTimerValue] = useState(0);

  // Handle change for form fields
  const handleChange = (e) => {
    let { name, value, type, checked } = e.target;
    if (name === 'trainNumber' || name === 'mobileNumber') {
      value = value.replace(/\D/g, '');
    }
    if (name === 'from' || name === 'to') {
      value = value.toUpperCase().replace(/\d/g, '');
    }
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

  const toggleAutomation = async () => {
    try {
      const currentStatus = await getAutomationStatus();
      const updatedStatus = !currentStatus;
      
      await setAutomationStatus(updatedStatus);
      
      setFormData((prevState) => ({
        ...prevState,
        automationStatus: updatedStatus,
      }));
      setShowButton(!updatedStatus && timerValue > 0);
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

  const startCountdown = () => {
    const { targetTime, loginMinutesBefore, automationStatus } = formData;
    if (!automationStatus) {
      setShowButton(true);
      setTimerValue(0);
      return;
    }

    const calculateRemainingSeconds = () => {
      const currentTime = new Date();
      const startTime = getTimeFromString(targetTime);
      const clickTime = new Date(startTime.getTime() - loginMinutesBefore * 60 * 1000);
      return Math.floor((clickTime - currentTime) / 1000);
    };

    const countdownInterval = setInterval(() => {
      const secondsRemaining = calculateRemainingSeconds();
      if (secondsRemaining <= 0) {
        clearInterval(countdownInterval);
        setShowButton(true);
        setTimerValue(0);
      } else {
        setTimerValue(secondsRemaining);
        setShowButton(false);
      }
    }, 1000);

    return () => clearInterval(countdownInterval);
  };

  return (
    <AppContext.Provider
      value={{
        formData,
        setFormData,
        isDirty,
        saveFormData,
        handleChange,
        toggleAutomation,
        showButton,
        timerValue,
        setTimerValue,
        resetSettings,
        startCountdown,
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
