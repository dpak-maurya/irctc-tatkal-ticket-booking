/**
 * Checks if the user has developer mode enabled, which is required to use the
 * User Scripts API.
 *
 * @returns If the chrome.userScripts API is available.
 */
function isUserScriptsAvailable() {
  try {
    // Property access which throws if developer mode is not enabled.
    chrome.userScripts;
    return true;
  } catch {
    console.log('enable developer mode');
    return false;
  }
}
// Function to format date string to yyyy-MM-dd format
function formatDate(dateString) {
  // Split the date string by '/'
  let parts = dateString.split('/');
  // Rearrange the parts to form yyyy-MM-dd format
  return parts[2] + '-' + parts[1] + '-' + parts[0];
}

// Function to format date string for storage
function formatDateForStorage(dateString) {
  // Split the date string by '-'
  let parts = dateString.split('-');
  // Rearrange the parts to form dd/MM/yyyy format
  return parts[2] + '/' + parts[1] + '/' + parts[0];
}

// Function to retrieve values from Chrome storage
async function getSettings() {
  // Define an array of field names you want to retrieve
  const fieldNames = ['username', 'password', 'targetTime', 'passengerNames','refreshTime', 'trainNumber', 'from', 'to', 'quotaType', 'accommodationClass', 'dateString','paymentType','paymentMethod','paymentProvider'];

  try {
    // Retrieve values from Chrome storage using async/await
    const data = await new Promise((resolve, reject) => {
      chrome.storage.local.get(fieldNames, (result) => {
        if (chrome.runtime.lastError) {
          reject(chrome.runtime.lastError);
        } else {
          resolve(result);
        }
      });
    });

    // Update UI with retrieved values
    fieldNames.forEach((fieldName) => {
      if(data.hasOwnProperty(fieldName) && fieldName==='dateString'){
        document.getElementById(fieldName).value = formatDate(data[fieldName]);
      }
      else if (data.hasOwnProperty(fieldName)) {
        document.getElementById(fieldName).value = data[fieldName];
      } else {
        console.log(`Value for ${fieldName} not found in storage.`);
      }
    });
  } catch (error) {
    console.error('Error retrieving settings:', error);
  }
}

async function updateUi() {
  if (!isUserScriptsAvailable()) return;

  await getSettings();
}


function saveSettings() {
  if (!isUserScriptsAvailable()) return;
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;
  const targetTime = document.getElementById('targetTime').value;
  const passengerNames = document.getElementById('passengerNames').value;
  const refreshTime = document.getElementById('refreshTime').value;
  const dateString = document.getElementById('dateString').value;
  const trainNumber = document.getElementById('trainNumber').value;
  const from = document.getElementById('from').value;
  const to = document.getElementById('to').value;
  const quotaType = document.getElementById('quotaType').value;
  const accommodationClass = document.getElementById('accommodationClass').value;
  const paymentType = document.getElementById('paymentType').value;
  const paymentMethod = document.getElementById('paymentMethod').value;
  const paymentProvider = document.getElementById('paymentProvider').value;
  
  // Save to Chrome storage
  chrome.storage.local.set({
    username: username,
    password: password,
    targetTime: targetTime,
    passengerNames: passengerNames,
    refreshTime:refreshTime,
    dateString: formatDateForStorage(dateString),
    trainNumber: trainNumber,
    from: from,
    to: to,
    quotaType: quotaType,
    accommodationClass: accommodationClass,
    paymentType:paymentType,
    paymentMethod:paymentMethod,
    paymentProvider:paymentProvider
  }, function() {
    alert('Settings saved successfully!');
  });
}


// Update UI immediately, and on any storage changes.
updateUi();
chrome.storage.local.onChanged.addListener(updateUi);
// Call the function to retrieve and update settings when the page loads
document.addEventListener('DOMContentLoaded', getSettings);
// Register listener for save button click.
document.getElementById('save-train').addEventListener('click', saveSettings);
