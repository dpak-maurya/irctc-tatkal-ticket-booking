const STORAGE_KEY = 'tatkalTicketBookingFormData';
const BOOKING_ALARM = 'tatkal-booking-warmup';
const BOOKING_NOTIFICATION = 'tatkal-booking-notification';
const IRCTC_URL = 'https://www.irctc.co.in/nget/train-search';
const IST_OFFSET = '+05:30';

const getScheduledDateTime = (scheduleDate, targetTime) => {
  if (!scheduleDate || !targetTime) {
    return null;
  }

  const scheduledDateTime = new Date(`${scheduleDate}T${targetTime}${IST_OFFSET}`);
  return Number.isNaN(scheduledDateTime.getTime()) ? null : scheduledDateTime;
};

const getLoginDateTime = (settings) => {
  const scheduledDateTime = getScheduledDateTime(
    settings?.scheduleDate,
    settings?.targetTime
  );

  if (!scheduledDateTime) {
    return null;
  }

  return new Date(
    scheduledDateTime.getTime() - Number(settings?.loginMinutesBefore || 0) * 60 * 1000
  );
};

const getJourneySummary = (settings) => {
  const parts = [settings?.trainNumber, settings?.from, settings?.to].filter(Boolean);
  return parts.length ? parts.join(' ') : 'your booking';
};

const getSettings = async () => {
  const result = await chrome.storage.local.get(STORAGE_KEY);
  return result?.[STORAGE_KEY] || null;
};

const focusOrOpenIrctc = async () => {
  const existingTabs = await chrome.tabs.query({ url: ['*://www.irctc.co.in/*', '*://*.irctc.co.in/*'] });
  const targetTab = existingTabs.find((tab) => tab.url?.includes('/nget/train-search')) || existingTabs[0];

  if (targetTab?.id) {
    await chrome.tabs.update(targetTab.id, { url: IRCTC_URL, active: true });
    if (targetTab.windowId) {
      await chrome.windows.update(targetTab.windowId, { focused: true });
    }
    return;
  }

  const createdTab = await chrome.tabs.create({ url: IRCTC_URL, active: true });
  if (createdTab?.windowId) {
    await chrome.windows.update(createdTab.windowId, { focused: true });
  }
};

const syncBookingAlarm = async () => {
  await chrome.alarms.clear(BOOKING_ALARM);

  const settings = await getSettings();
  if (!settings?.automationStatus) {
    return;
  }

  const loginDateTime = getLoginDateTime(settings);
  if (!loginDateTime || loginDateTime.getTime() <= Date.now()) {
    return;
  }

  chrome.alarms.create(BOOKING_ALARM, { when: loginDateTime.getTime() });
};

chrome.runtime.onInstalled.addListener(({ reason }) => {
  if (reason == chrome.runtime.OnInstalledReason.INSTALL) {
    chrome.runtime.openOptionsPage();
  }

  syncBookingAlarm();
});

chrome.runtime.onStartup.addListener(() => {
  syncBookingAlarm();
});

chrome.action.onClicked.addListener(() => {
  chrome.runtime.openOptionsPage();
});

// function myFunction(details) {
//   // Your code to be executed upon request completion
//   // You can access details about the response here (headers, status code, etc.)
//   console.log("Network request completed for URL:", details.url);
//   console.log("Status code:", details.statusCode);
//   // Perform actions like injecting content script, modifying DOM, etc.
// }
// chrome.webRequest.onCompleted.addListener(
//   (details) => {
//     // Other logic...

//     // Check if the URL matches the specified pattern
//     if (details.url.match(/^https:\/\/www\.irctc\.co\.in\/eticketing\/protected\/mapps1\/avlFarenquiry\/[^\/]+\/(?:[^\/]+\/)?TQ\/N$/)) {
//       // Your logic for matching URLs with "TQ/N" at the end
//       myFunction();
//     }
//   },
//   // Specify the URL patterns to match
//   { urls: ["*://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/*/TQ/N", "*://www.irctc.co.in/eticketing/protected/mapps1/avlFarenquiry/*/TQ/N/"] },
//   ["responseHeaders"]
// );

chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes[STORAGE_KEY]) {
    syncBookingAlarm();
  }
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== BOOKING_ALARM) {
    return;
  }

  const settings = await getSettings();
  if (!settings?.automationStatus) {
    return;
  }

  await chrome.notifications.create(BOOKING_NOTIFICATION, {
    type: 'basic',
    iconUrl: 'assets/icon-128.png',
    title: 'IRCTC automation started',
    message: `Opening IRCTC for ${getJourneySummary(settings)}. Keep the captcha step ready.`,
    priority: 2,
  });

  await focusOrOpenIrctc();
});

chrome.notifications.onClicked.addListener((notificationId) => {
  if (notificationId === BOOKING_NOTIFICATION) {
    chrome.runtime.openOptionsPage();
  }
});
