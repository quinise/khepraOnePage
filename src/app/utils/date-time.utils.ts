export function mergeDateAndTime(date: Date | string, time: Date | string): Date {
  const dateObj = new Date(date);
  const timeObj = new Date(time);

  if (isNaN(dateObj.getTime()) || isNaN(timeObj.getTime())) {
    throw new Error('Invalid date or time passed to mergeDateAndTime()');
  }

  return new Date(
    dateObj.getFullYear(),
    dateObj.getMonth(),
    dateObj.getDate(),
    timeObj.getHours(),
    timeObj.getMinutes(),
    timeObj.getSeconds(),
    0 // milliseconds
  );
}