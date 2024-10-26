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

export function getTimeFromString(timeString) {
  const [hours, minutes, seconds] = timeString.split(':').map(Number);
  const currentTime = new Date();
  return new Date(
    currentTime.getFullYear(),
    currentTime.getMonth(),
    currentTime.getDate(),
    hours,
    minutes,
    seconds
  );
}