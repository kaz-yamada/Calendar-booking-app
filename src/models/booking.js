import moment from "moment";

import { isWeekday } from "../util/datetime";

const START_OF_DAY = 9;
const END_OF_DAY = 18;
const BOOKING_LENGTH = 40;
const BREAK_LENGTH = 5;

/**
 * Get a list of days that have available bookings based on callback
 * @param {*} date The month to check
 * @param {*} callback A callback that checks if the day has any bookings
 * @return {Array} An
 */
export const getBookingDays = (date, callback) => {
  const days = [];
  const curr = moment.utc(date).startOf("month");
  const end = moment.utc(date).endOf("month");

  for (
    let index = curr.date();
    index <= end.date();
    index++, curr.add(1, "day")
  ) {
    let hasTimeSlots = false;

    // Check for weekdays only
    if (isWeekday(curr)) hasTimeSlots = callback(curr);

    days.push({ day: index, hasTimeSlots });
  }

  return days;
};

export const isValidTime = date => {
  return isBusinessHours(date) && isValidTimeslot(date);
};

/**
 * Get an array of times available for booking
 * @param {Date} day The day to check for available bookings
 * @param {Array} bookedTimes List of times that have bookings
 * @return {Array} A formatted list of available bookings object with start and end times
 */
export const getTimeslots = (day, bookedTimes) => {
  const timeSlots = [];
  const curr = getStartOfDay(day);
  const finishTime = moment.utc(day).hour(END_OF_DAY);

  do {
    if (!bookedTimes.find(time => curr.utc().isSame(moment.utc(time)))) {
      timeSlots.push(returnBookingSlot(curr));
      curr.add(BREAK_LENGTH, "m");
    } else {
      curr.add(BOOKING_LENGTH + BREAK_LENGTH, "m");
    }
  } while (curr.isBefore(finishTime));

  return timeSlots;
};

export const getRandomTimeslots = day => {
  const timeSlots = [];
  const curr = getStartOfDay(day);
  const finishTime = moment.utc(day).hour(END_OF_DAY);

  do {
    if (Math.random() >= 0.5) {
      timeSlots.push(returnBookingSlot(curr));
      curr.add(BREAK_LENGTH, "m");
    } else {
      curr.add(BOOKING_LENGTH + BREAK_LENGTH, "m");
    }
  } while (curr.isBefore(finishTime));

  return timeSlots;
};

/**
 * Checks if date is during business hours
 * @param {*} date
 * @return {Boolean}
 */
export const isBusinessHours = date => {
  const startTime = getStartOfDay(date);
  const momentDate = moment.utc(date);

  // Date is in the weekend
  if (!isWeekday(date)) return false;

  // Outside business hours
  if (
    momentDate.isBefore(startTime) &&
    momentDate.isAfter(startTime.hour(END_OF_DAY))
  )
    return false;

  return true;
};

/**
 * Check if passed date is in a valid time slot
 * @param {*} date
 * @return {Boolean}
 */
export const isValidTimeslot = date => {
  const startTime = getStartOfDay(date);
  const momentDate = moment.utc(date);

  do {
    if (momentDate.isSame(startTime.utc())) {
      return true;
    }
    startTime.add(BOOKING_LENGTH + BREAK_LENGTH, "m");
  } while (startTime.utc().isBefore(momentDate.hour(END_OF_DAY)));

  return false;
};

/**
 *
 * @param {*} date
 * @return {object}
 */
export const returnBookingSlot = date => ({
  startTime: date.utc().toDate(),
  endTime: date.add(BOOKING_LENGTH, "m").toDate()
});

const getStartOfDay = date =>
  moment
    .utc(date)
    .hour(START_OF_DAY)
    .startOf("h");
