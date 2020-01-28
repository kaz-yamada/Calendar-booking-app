import moment from "moment";

export const isWeekday = date => {
  const dayOfWeek = moment(date)
    .utc()
    .weekday();
  return dayOfWeek !== 0 || dayOfWeek !== 6;
};
