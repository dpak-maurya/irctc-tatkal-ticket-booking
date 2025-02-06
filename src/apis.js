// apis.js
const STORAGE_KEY = 'tatkalTicketBookingFormData';

import defaultSettings from './defaultSettings';
// Async function to get data from Chrome storage
export const getFormDataFromStorage = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise(async (resolve, reject) => {
      chrome.storage.local.get([STORAGE_KEY], async (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          if (!result[STORAGE_KEY]) {
            // Initialize storage with default settings if empty
            await saveFormDataToStorage(defaultSettings);
            resolve(defaultSettings); // Return default settings
          } else {
            resolve(result[STORAGE_KEY]);
          }
        }
      });
    });
  }
  return null;
};

// Async function to save data to Chrome storage
export const saveFormDataToStorage = async (formData) => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.set({ [STORAGE_KEY]: formData }, () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

// Async function to remove data from Chrome storage
export const removeFormDataFromStorage = async () => {
  if (typeof chrome !== 'undefined' && chrome.storage) {
    return new Promise((resolve, reject) => {
      chrome.storage.local.remove([STORAGE_KEY], () => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve();
        }
      });
    });
  }
};

// New functions for automation status
export const getAutomationStatus = async () => {
  const data = await getFormDataFromStorage();
  return data ? data.automationStatus : false;
};

export const setAutomationStatus = async (status) => {
  const data = await getFormDataFromStorage();
  const updatedData = { ...data, automationStatus: status };
  await saveFormDataToStorage(updatedData);
};