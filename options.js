// Initial form values
const initialFormValues = {
  automationStatus:false,
  username: '',
  password: '',
  targetTime: '10:00:10',
  passengerNames: '',
  refreshTime: '5000',
  trainNumber: '11061',
  from: 'LTT',
  to: 'BSB',
  quotaType: 'TATKAL',
  accommodationClass: '3A',
  dateString: getNextDay(),
  paymentType: 'BHIM/UPI',
  paymentMethod: 'BHIM/ UPI/ USSD',
  paymentProvider: 'PAYTM',
  autoPay: false,
};
function getNextDay() {
  const currentDate = new Date();
  const nextDate = new Date(currentDate.setDate(currentDate.getDate() + 1)); // Modified line

  const day = String(nextDate.getDate()).padStart(2, '0');
  const month = String(nextDate.getMonth() + 1).padStart(2, '0');
  const year = nextDate.getFullYear();

  return `${day}/${month}/${year}`;
}

/**
 * Checks if the user has developer mode enabled, which is required to use the
 * User Scripts API.
 *
 * @returns If the chrome.userScripts API is available.
 */
function isUserScriptsAvailable() {
  try {
    chrome.userScripts;
    return true;
  } catch {
    console.log('Developer mode is not enabled');
    return false;
  }
}

// Function to format date string to yyyy-MM-dd format
function formatDate(dateString) {
  const parts = dateString.split('/');
  return `${parts[2]}-${parts[1]}-${parts[0]}`;
}

// Function to format date string for storage
function formatDateForStorage(dateString) {
  const parts = dateString.split('-');
  return `${parts[2]}/${parts[1]}/${parts[0]}`;
}

async function getSettings() {
  // Merge default form values with values from Chrome local storage
  const mergedValues = {
    ...initialFormValues,
    ...(await retrieveFromLocalStorage()),
  };
  console.log(mergedValues);
  // Iterate through merged values and update form elements
  Object.keys(mergedValues).forEach((fieldName) => {
    const fieldValue = mergedValues[fieldName];
    const formElement = document.getElementById(fieldName);
    if (formElement) {
      if(formElement.type === 'checkbox'){
        formElement.checked = fieldValue;
      }
      else if(formElement.type ==='date'){
        formElement.value = formatDate(fieldValue);
      }
       else {
        formElement.value = fieldValue;
      }
    } else {
      console.log(`Form element with ID '${fieldName}' not found.`);
    }
  });
}

async function saveSettings() {
  if (!isUserScriptsAvailable()) return;
  const formData = retrieveFormData();

  // Save form data to Chrome local storage
  await saveToLocalStorage(formData);

  alert('Settings saved successfully!');
}

// Function to retrieve data from Chrome local storage
async function retrieveFromLocalStorage() {
  return new Promise((resolve) => {
    chrome.storage.local.get(initialFormValues, (result) => {
      resolve(result);
    });
  });
}

// Function to save data to Chrome local storage
async function saveToLocalStorage(formData) {
  return new Promise((resolve) => {
    chrome.storage.local.set(formData, () => {
      resolve();
    });
  });
}

// Function to retrieve form data
function retrieveFormData() {
  const formData = {};
  Object.keys(initialFormValues).forEach((fieldName) => {
    const formElement = document.getElementById(fieldName);
    if(formElement.type === 'checkbox'){
      formData[fieldName] = formElement.checked;
    }
    else if(formElement.type ==='date'){
      formData[fieldName] = formatDateForStorage(formElement.value);
    }
    else{
      formData[fieldName] = formElement.value;
    }
  });
  console.log(formData);
  return formData;
}

// Update UI immediately, and on any storage changes.
getSettings();
chrome.storage.local.onChanged.addListener(getSettings);

// Call the function to retrieve and update settings when the page loads
document.addEventListener('DOMContentLoaded', getSettings);

// Register listener for save button click.
document.getElementById('save-train').addEventListener('click', saveSettings);


document.getElementById('automationStatus').addEventListener('change',function(){
  chrome.storage.local.set({ 'automationStatus': this.checked });
  updateButtonText();
})


async function getAutomationStatus() {
  return new Promise((resolve, reject) => {
    chrome.storage.local.get('automationStatus', function(result) {
      if (chrome.runtime.lastError) {
        reject(chrome.runtime.lastError);
      } else {
        resolve(result.automationStatus);
      }
    });
  });
}

// Function to update the text of the button based on the automation status
async function updateButtonText() {
  const automationStatus = await getAutomationStatus();
  const button = document.getElementById('book-train');

  if (automationStatus) {
    button.textContent = 'Book Ticket on IRCTC';
  } else {
    button.textContent = 'Go To IRCTC Website';
  }
}

// Call the function to update the button text when the page loads
document.addEventListener('DOMContentLoaded', updateButtonText);
