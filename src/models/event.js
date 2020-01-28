import { google } from "googleapis";
import moment from "moment";

import googleAuth from "../config/googleAuth";

const CALENDAR_DEFAULTS = {
  calendarId: "primary",
  singleEvents: true,
  orderBy: "startTime",
  timeZone: "UTC"
};

/**
 *
 * @param {*} date
 * @param {*} period
 * @param {*} callback
 */
export const getEventsInPeriod = (date, period, callback) => {
  try {
    const timeMin = moment
      .utc(date)
      .startOf(period)
      .toDate();
    const timeMax = moment
      .utc(date)
      .endOf(period)
      .toDate();

    listEvents(timeMin, timeMax, callback);
  } catch (error) {
    callback(error, null);
  }
};

/**
 *
 * @param {*} startTime
 * @param {*} endTime
 * @param {*} callback
 */
const listEvents = (startTime, endTime, callback) => {
  const options = CALENDAR_DEFAULTS;
  options.timeMin = startTime;
  options.timeMax = endTime;

  googleAuth(auth => {
    const calendar = getCalendar(auth);

    calendar.events.list(options, (err, res) => {
      if (err) {
        console.error("The API returned an error: " + err);
        callback(err, null);
      }
      const { items } = res.data;
      callback(null, items);
    });
  });
};

/**
 *
 * @param {*} param0
 * @param {*} callback
 */
export const createEvent = ({ startTime, endTime }, callback) => {
  googleAuth(auth => {
    const calendar = getCalendar(auth);
    const summary = `Booking for ${startTime.toISOString()} to ${endTime.toISOString()}`;
    const timeZone = "UTC";

    const newEvent = {
      summary,
      start: { dateTime: startTime, timeZone },
      end: { dateTime: endTime, timeZone }
    };

    checkConflict(
      calendar,
      auth,
      { startTime, endTime, timeZone },
      hasEvents => {
        if (hasEvents) return callback("Conflicting event", null);

        calendar.events.insert(
          {
            auth: auth,
            calendarId: "primary",
            resource: newEvent
          },
          function(err, event) {
            if (err) {
              const message =
                "There was an error contacting the Calendar service: " + err;

              callback(message, null);
            }
            console.log("Event created: %s", event.data.htmlLink);
            callback(null, event);
          }
        );
      }
    );
  });
};

/**
 * Check for checks for conflicts
 * @param {*} calendar
 * @param {*} auth
 * @param {*} Object
 * @param {*} callback
 */
const checkConflict = (
  calendar,
  auth,
  { startTime, endTime, timeZone },
  callback
) => {
  calendar.freebusy.query(
    {
      auth,
      resource: {
        timeMin: startTime,
        timeMax: endTime,
        timeZone,
        items: [
          {
            id: "primary"
          }
        ]
      }
    },
    (err, res) => {
      const { busy } = res.data.calendars.primary;
      callback(busy.length > 0);
    }
  );
};

const getCalendar = auth => google.calendar({ version: "v3", auth });
