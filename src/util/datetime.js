import moment from "moment";

export const isWeekday = date => {
  const dayOfWeek = moment(date)
    .utc()
    .weekday();
  return dayOfWeek !== 0 || dayOfWeek !== 6;
};

export const padNumber = (number, length) => {
  let str = "" + number;
  while (str.length < length) {
    str = "0" + str;
  }

  return str;
};
