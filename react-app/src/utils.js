const IST_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET = '+05:30';

export const getTodayDateString = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: IST_TIME_ZONE }).format(new Date());

export const getNextDay = () => {
  return new Date(new Date().setDate(new Date().getDate() + 1))
    .toISOString()
    .split('T')[0];
};


// Utility function for comparing objects excluding specified keys
export const isEqual = (obj1, obj2, excludedKeys = []) => {
  const filteredObj1 = { ...obj1 };
  const filteredObj2 = { ...obj2 };
  excludedKeys.forEach((key) => {
    delete filteredObj1[key];
    delete filteredObj2[key];
  });
  return JSON.stringify(filteredObj1) === JSON.stringify(filteredObj2);
};

export const getScheduledDateTime = (scheduleDate, timeString) => {
  if (!scheduleDate || !timeString) {
    return null;
  }

  const scheduledDateTime = new Date(`${scheduleDate}T${timeString}${IST_OFFSET}`);
  return Number.isNaN(scheduledDateTime.getTime()) ? null : scheduledDateTime;
};

export const getLoginDateTime = (scheduleDate, timeString, loginMinutesBefore = 0) => {
  const scheduledDateTime = getScheduledDateTime(scheduleDate, timeString);

  if (!scheduledDateTime) {
    return null;
  }

  return new Date(
    scheduledDateTime.getTime() - Number(loginMinutesBefore || 0) * 60 * 1000
  );
};

export const formatDateTimeInIST = (date) => {
  if (!date) {
    return '';
  }

  return `${new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  }).format(date)} IST`;
};

export const formatShortDateInIST = (date) => {
  if (!date) {
    return '';
  }

  return new Intl.DateTimeFormat('en-IN', {
    timeZone: IST_TIME_ZONE,
    day: '2-digit',
    month: 'short',
  }).format(date);
};

export const formatCountdown = (totalSeconds) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0s';
  }

  const days = Math.floor(totalSeconds / 86400);
  const hours = Math.floor((totalSeconds % 86400) / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;
  const parts = [];

  if (days > 0) {
    parts.push(`${days}d`);
  }
  if (hours > 0 || days > 0) {
    parts.push(`${hours}h`);
  }
  if (minutes > 0 || hours > 0 || days > 0) {
    parts.push(`${minutes}m`);
  }
  parts.push(`${seconds}s`);

  return parts.join(' ');
};

export const formatCountdownCompact = (totalSeconds) => {
  if (!Number.isFinite(totalSeconds) || totalSeconds <= 0) {
    return '0m';
  }

  if (totalSeconds >= 86400) {
    const days = Math.floor(totalSeconds / 86400);
    const hours = Math.floor((totalSeconds % 86400) / 3600);
    return hours > 0 ? `${days}d ${hours}h` : `${days}d`;
  }

  if (totalSeconds < 3600) {
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}m ${seconds}s`;
  }

  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  return `${hours}h ${minutes}m`;
};

export const validateBookingForm = (formData, { forAutomation = false } = {}) => {
  const todayDate = getTodayDateString();
  const errors = [];
  const isTatkalQuota = ['TATKAL', 'PREMIUM TATKAL'].includes(formData?.quotaType);
  const selectedPassengerList = (formData?.passengerList || []).filter(
    (passenger) => passenger?.isSelected
  );
  const selectedMasterPassengers = (formData?.passengerNames || []).filter(
    (passenger) => passenger?.isSelected
  );

  if (!formData?.dateString) {
    errors.push('Journey date is required.');
  } else if (formData.dateString < todayDate) {
    errors.push('Journey date cannot be in the past.');
  }

  if (!formData?.scheduleDate) {
    errors.push('Schedule date is required.');
  } else if (formData.scheduleDate < todayDate) {
    errors.push('Schedule date cannot be in the past.');
  }

  if (formData?.scheduleDate && formData?.dateString && formData.scheduleDate > formData.dateString) {
    errors.push('Schedule date cannot be after the journey date.');
  }

  if (isTatkalQuota && formData?.scheduleDate && formData?.dateString) {
    const earliestTatkalScheduleDate = new Date(`${formData.dateString}T00:00:00${IST_OFFSET}`);
    earliestTatkalScheduleDate.setDate(earliestTatkalScheduleDate.getDate() - 2);
    const earliestTatkalScheduleDateString = new Intl.DateTimeFormat('en-CA', {
      timeZone: IST_TIME_ZONE,
    }).format(earliestTatkalScheduleDate);

    if (formData.scheduleDate < earliestTatkalScheduleDateString) {
      errors.push('For Tatkal booking, schedule date cannot be earlier than 2 days before journey.');
    }
  }

  if (!formData?.trainNumber) {
    errors.push('Train number is required.');
  } else if (!/^\d{5}$/.test(formData.trainNumber)) {
    errors.push('Train number must be a 5-digit number.');
  }

  if (!formData?.from) {
    errors.push('From station code is required.');
  }

  if (!formData?.to) {
    errors.push('To station code is required.');
  }

  if (formData?.from && formData?.to && formData.from === formData.to) {
    errors.push('From and To station codes cannot be the same.');
  }

  if (!formData?.targetTime) {
    errors.push('Booking start time is required.');
  }

  if (!Number.isFinite(Number(formData?.refreshTime)) || Number(formData.refreshTime) <= 0) {
    errors.push('Refresh time must be greater than 0 milliseconds.');
  }

  if (!Number.isFinite(Number(formData?.loginMinutesBefore)) || Number(formData.loginMinutesBefore) < 0) {
    errors.push('Login minutes before must be 0 or more.');
  }

  if (formData?.masterData) {
    if (selectedMasterPassengers.length === 0) {
      errors.push('Select at least one passenger in Passenger Master Data, or turn off Use IRCTC Master Data.');
    }

    const invalidMasterPassenger = selectedMasterPassengers.find(
      (passenger) => !String(passenger?.name || '').trim()
    );

    if (invalidMasterPassenger) {
      errors.push('Selected Passenger Master Data entries must have a passenger name.');
    }
  } else {
    if (selectedPassengerList.length === 0) {
      errors.push('Select at least one passenger in Passenger List.');
    }

    const invalidPassenger = selectedPassengerList.find((passenger) => {
      const name = String(passenger?.name || '').trim();
      const age = Number(passenger?.age);
      return (
        !name ||
        !Number.isFinite(age) ||
        age < 1 ||
        age > 125 ||
        !passenger?.gender ||
        !passenger?.preference
      );
    });

    if (invalidPassenger) {
      errors.push('Selected passengers must have name, valid age, gender, and berth preference.');
    }
  }

  if (forAutomation) {
    const loginDateTime = getLoginDateTime(
      formData?.scheduleDate,
      formData?.targetTime,
      formData?.loginMinutesBefore
    );

    if (!loginDateTime) {
      errors.push('A valid automation wake-up time is required.');
    }
  }

  return errors;
};

export function getTimeFromString(timeString, scheduleDate = getTodayDateString()) {
  return getScheduledDateTime(scheduleDate, timeString);
}
