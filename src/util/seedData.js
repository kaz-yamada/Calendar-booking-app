import moment from "moment";

import server from "../server";
import { getRandomTimeslots, isBusinessHours } from "../models/booking";
import { createBooking } from "../controllers/calendarController";

// Fill the next 7 days with random dummy data
const bookings = [];

const res = {
  status: {
    json: function(data) {
      console.log(data);
    }
  },
  json: function(data) {
    console.log(data);
  }
};

const createBookingsForWeek = () => {
  const now = moment.utc().add(1, "day");
  const end = moment.utc().add(8, "day");

  do {
    let dayBooking;
    if (isBusinessHours(now.toDate())) dayBooking = getRandomTimeslots(now);

    console.log(now.toString(), " bookings = ", dayBooking.length);

    bookings.concat(dayBooking);

    now.add(1, "day");
  } while (now.isBefore(end));
};

const addTocalendar = () => {
  for (const booking of bookings) {
    const date = moment.utc(booking.startTime);

    const req = {
      query: {
        year: date.year(),
        month: date.month() + 1,
        day: date.date(),
        hour: date.hour(),
        minute: date.minute()
      }
    };
    createBooking(req, res);
  }
};

const app = server();

const listener = app.listen(process.env.PORT | 3000, function() {
  const { port } = listener.address();
  console.log("Your app is listening on  http://localhost:" + port);
});

createBookingsForWeek();
addTocalendar();
