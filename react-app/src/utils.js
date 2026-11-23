const IST_TIME_ZONE = 'Asia/Kolkata';
const IST_OFFSET = '+05:30';
const DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;
const TIME_PATTERN = /^([01]\d|2[0-3]):[0-5]\d:[0-5]\d$/;

// The right shape and a real date: 2030-13-45 is rejected like a half-typed one.
const isCompleteDate = (value) =>
  DATE_PATTERN.test(value) && !Number.isNaN(new Date(`${value}T00:00:00${IST_OFFSET}`).getTime());

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
  const selectedInfantList = (formData?.infantList || []).filter(
    (infant) => infant?.isSelected
  );
  const selectedMasterPassengers = (formData?.passengerNames || []).filter(
    (passenger) => passenger?.isSelected
  );
  const maxPassengers = isTatkalQuota ? 4 : 6;

  if (!formData?.dateString) {
    errors.push('Journey date is required.');
  } else if (!isCompleteDate(formData.dateString)) {
    errors.push('Journey date is incomplete. Enter the day, month and year.');
  } else if (formData.dateString < todayDate) {
    errors.push('Journey date cannot be in the past.');
  }

  if (!formData?.scheduleDate) {
    errors.push('Schedule date is required.');
  } else if (!isCompleteDate(formData.scheduleDate)) {
    errors.push('Schedule date is incomplete. Enter the day, month and year.');
  } else if (formData.scheduleDate < todayDate) {
    errors.push('Schedule date cannot be in the past.');
  }

  const hasCompleteDates = isCompleteDate(formData?.scheduleDate) && isCompleteDate(formData?.dateString);

  if (hasCompleteDates && formData.scheduleDate > formData.dateString) {
    errors.push('Schedule date cannot be after the journey date.');
  }

  if (isTatkalQuota && hasCompleteDates) {
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
  } else if (!TIME_PATTERN.test(formData.targetTime)) {
    errors.push('Booking start time is incomplete. Enter the hours, minutes and seconds.');
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
    } else if (selectedMasterPassengers.length > maxPassengers) {
      errors.push(`No more than ${maxPassengers} passengers can be selected in Passenger Master Data for one ticket in this quota.`);
    }

    const invalidMasterPassenger = selectedMasterPassengers.find(
      (passenger) => !String(passenger?.name || '').trim()
    );

    if (invalidMasterPassenger) {
      errors.push('Selected Passenger Master Data entries must have a passenger name.');
    }
  } else {
    if (selectedPassengerList.length === 0) {
      errors.push('At least one normal passenger is required. Infant-only bookings without berth are not allowed.');
    } else if (selectedPassengerList.length > maxPassengers) {
      errors.push(`No more than ${maxPassengers} passengers can be selected for one ticket in this quota.`);
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
      errors.push('Selected passengers must have name, valid age (1-125), gender, and berth preference.');
    }

    const sittingClasses = ['EC', 'CC', '2S', 'EV', 'VC', 'VS'];
    const sittingPreferences = ['No Preference', 'WS'];
    const sleepingPreferences = ['No Preference', 'LB', 'MB', 'UB', 'SL', 'SU'];
    const isSitting = sittingClasses.includes(formData?.accommodationClass);
    const validPreferences = isSitting ? sittingPreferences : sleepingPreferences;

    const invalidPreferencePassenger = selectedPassengerList.find(
      (passenger) => passenger?.preference && !validPreferences.includes(passenger.preference)
    );

    if (invalidPreferencePassenger) {
      if (isSitting) {
        errors.push(
          `Passenger "${invalidPreferencePassenger.name || 'Selected'}" has berth preference "${invalidPreferencePassenger.preference}" which is invalid for sitting class ${formData.accommodationClass}. Please select "No Preference" or "Window Side (WS)".`
        );
      } else {
        errors.push(
          `Passenger "${invalidPreferencePassenger.name || 'Selected'}" has seat preference "${invalidPreferencePassenger.preference}" which is invalid for sleeping class ${formData.accommodationClass}. Please select a valid berth preference.`
        );
      }
    }

    const invalidInfant = selectedInfantList.find((infant) => {
      const name = String(infant?.name || '').trim();
      const age = infant?.age;
      return (
        !name ||
        age === undefined ||
        age === '' ||
        !infant?.gender
      );
    });

    if (invalidInfant) {
      errors.push('Selected infants must have name, valid age, and gender.');
    }
  }

  if (formData?.mobileNumber && !/^\d{10}$/.test(formData.mobileNumber)) {
    errors.push('Mobile number must be exactly 10 digits, or left empty to use the number on the IRCTC account.');
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
