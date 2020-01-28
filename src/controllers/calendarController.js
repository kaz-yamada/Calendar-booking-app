import moment from "moment";

import {
  getTimeslots,
  getBookingDays,
  returnBookingSlot,
  isValidTimeslot,
  isBusinessHours
} from "../models/booking";
import { getEventsInPeriod, createEvent } from "../models/event";
import { padNumber } from "../util/datetime";

/**
 * GET /days
 * @param {*} req
 * @param {*} res
 * @return {any}
 */
export const getAvailableDays = (req, res) => {
  const { year, month } = req.query;

  if (!(year && month)) {
    const message = missingParamsMessage({ year, month });
    return res.json(returnFailMessage(message));
  }

  let queryDate;
  try {
    queryDate = moment.utc(`${year}-${month}`, "YYYY-MM", true);

    if (!queryDate.isValid()) throw queryDate.invalidAt();
  } catch (error) {
    return res.json(returnFailMessage("Invalid date format"));
  }

  // Get all events in month
  getEventsInPeriod(queryDate.toDate(), "month", (err, events) => {
    if (err) return res.json(returnFailMessage(err));

    const days = getBookingDays(queryDate, day => {
      return checkOpenTimeslots(events, day);
    });

    return res.json({ success: true, days });
  });

  return res.json(returnFailMessage("Unknown"));
};

/**
 * GET /timeslots
 * @param {*} req
 * @param {*} res
 * @return {any}
 */
export const getAvailableTimeslots = (req, res) => {
  const { year, month, day } = req.query;

  if (!(year && month && day)) {
    const message = missingParamsMessage({ year, month, day });
    return res.json(returnFailMessage(message));
  }

  let queryDate;

  try {
    queryDate = moment.utc(
      `${year}-${padNumber(month, 2)}-${padNumber(day, 2)}`,
      "YYYY-MM-DD",
      true
    );

    if (!queryDate.isValid()) throw queryDate.invalidAt();
  } catch (error) {
    return res.json(returnFailMessage("Invalid date format"));
  }

  if (queryDate) {
    getEventsInPeriod(queryDate, "day", (err, events) => {
      if (err) return res.json(returnFailMessage(err));

      console.log(events);

      const startTimes = events.map(event => event.start.dateTime);
      const timeSlots = getTimeslots(queryDate, startTimes);

      return res.json({ success: true, timeSlots });
    });
  }
};

/**
 *
 * @param {*} req
 * @param {*} res
 * @return {any}
 */
export const createBooking = (req, res) => {
  const { year, month, day, hour, minute } = req.query;

  if (!(year && month && day && hour && minute !== null)) {
    const message = missingParamsMessage({ year, month, day, hour, minute });
    return res.json(returnFailMessage(message));
  }

  const date = moment.utc(`${year}-${month}-${day}`, "YYYY-MM-DD");
  date.hour(hour).minute(minute);

  if (!isBusinessHours(date)) {
    return res.json(returnFailMessage("Invalid time slot"));
  }

  if (!isValidTimeslot(date)) {
    return res.json(
      returnFailMessage("Cannot book outside bookable timeframe")
    );
  }

  if (date.isBefore(new Date())) {
    return res.json(returnFailMessage("Cannot book time in the past"));
  }

  if (date.diff(new Date(), "hour") < 24) {
    return res.json(
      returnFailMessage("Cannot book with less than 24 hours in advance")
    );
  }
  const { startTime, endTime } = returnBookingSlot(date);

  createEvent({ startTime, endTime }, (err, data) => {
    if (err) return res.json(returnFailMessage("Invalid time slot " + err));

    res.status(200).json({ success: true, startTime, endTime });
  });
};

/**
 * Checks if there are open timeslots in events list
 * @param {*} events
 * @param {*} day
 * @return {Boolean}
 */
const checkOpenTimeslots = (events, day) => {
  const eventsInDay = events
    .filter(event => moment.utc(day).isSame(moment.utc(event.start.dateTime)))
    .map(event => event.start.dateTime);

  // No events in day means day is free
  if (eventsInDay === 0) return true;

  const timeSlots = getTimeslots(day, eventsInDay);
  return timeSlots.length > 0;
};

/**
 * Create an error message for missing parameters
 * @param {Object} params s
 * @return {String} A message
 */
const missingParamsMessage = params => {
  let message = "Request is missing parameter:";

  Object.keys(params).forEach(key => {
    if (!params[key]) message += ` ${key},`;
  });

  return message.replace(/(^,)|(,$)/g, "");
};

/**
 *
 * @param {String} message
 * @return {Object}
 */
const returnFailMessage = message => ({
  success: false,
  message
});
