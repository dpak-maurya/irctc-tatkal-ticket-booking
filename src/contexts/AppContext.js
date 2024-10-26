import React, { createContext, useContext, useState, useEffect } from 'react';
import PropTypes from 'prop-types';
import { getTimeFromString, isEqual } from '../utils';
import defaultSettings from '../defaultSettings';

const STORAGE_KEY = 'tatkalTicketBookingFormData';
const AppContext = createContext();


export const AppProvider = ({ children }) => {
  const [formData, setFormData] = useState(defaultSettings);
  const [isDirty, setIsDirty] = useState(false);
  const [savedData, setSavedData] = useState(defaultSettings);
  const [isFormLoaded, setIsFormLoaded] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalConfig, setModalConfig] = useState({});
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

  // Load form data from chrome.storage on mount
  useEffect(() => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.get([STORAGE_KEY], (result) => {
        if (result[STORAGE_KEY]) {
          setFormData(result[STORAGE_KEY]);
          setSavedData(result[STORAGE_KEY]);
        }
        setIsFormLoaded(true);
      });
    } else {
      setIsFormLoaded(true);
    }
  }, []);

  // Track unsaved changes after form load
  useEffect(() => {
    if (isFormLoaded) {
      setIsDirty(!isEqual(formData, savedData, ['automationStatus']));
    }
  }, [formData, savedData, isFormLoaded]);

  // Save form data to chrome.storage
  const saveFormData = () => {
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.set({ [STORAGE_KEY]: formData }, () => {
        setSavedData(formData);
        setIsDirty(false);
      });
    }
  };

  // Toggle automation status and update button visibility
  const toggleAutomation = () => {
    setFormData((prevState) => {
      const updatedFormData = {
        ...prevState,
        automationStatus: !prevState.automationStatus,
      };
      if (typeof chrome !== 'undefined' && chrome.storage) {
        chrome.storage.local.set({ [STORAGE_KEY]: updatedFormData });
      }
      return updatedFormData;
    });
    setShowButton(!formData.automationStatus && timerValue > 0);
  };

  // Open a modal with configuration
  const openModal = (variant, title, message, onConfirm) => {
    setModalConfig({ variant, title, message, onConfirm });
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setModalConfig({});
  };

  // Reset form data
  const resetSettings = () => {
    setFormData(defaultSettings);
    setSavedData(defaultSettings);
    if (typeof chrome !== 'undefined' && chrome.storage) {
      chrome.storage.local.remove([STORAGE_KEY]);
    }
    setIsDirty(false);
    setIsModalOpen(false);
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
        openModal,
        handleCloseModal,
        isModalOpen,
        modalConfig,
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
