// When IRCTC opens booking. Used by the Train Details form and the How to Use guide.
export const NON_AC_CLASSES = ['SL', 'FC', '2S', 'VS'];

export const getTargetTime = (quotaType, accommodationClass, isOpeningDayBooking, currentTargetTime) => {
  if (quotaType === 'GENERAL') {
    return isOpeningDayBooking ? '08:00:00' : currentTargetTime;
  }
  if (NON_AC_CLASSES.includes(accommodationClass)) return '11:00:00';
  return '10:00:00';
};
