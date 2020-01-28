import * as chai from "chai";
import chaiHttp from "chai-http";
import moment from "moment";
import {
  getTimeslots,
  returnBookingSlot,
  isValidTimeslot,
  getBookingDays
} from "../../models/booking";

chai.use(chaiHttp);

const expect = chai.expect;
const assert = chai.assert;

describe("Testing bookings", () => {
  it("Finds and removes 9:00 booking", () => {
    const today = moment.utc(new Date());
    const bookedTime = moment
      .utc(today)
      .hour(9)
      .startOf("h");

    const bookings = getTimeslots(today, [bookedTime]);

    expect(bookings).to.not.include.members([returnBookingSlot(bookedTime)]);
  });

  it("Get booking days", () => {
    const date = moment.utc("2020-01", "YYYY-MM");
    const isDayOpen = [];

    const days = getBookingDays(date, day => {
      const isBooked = Math.floor(Math.random() * 1) + 1 === 0;
      isDayOpen.push(isBooked);
      return isBooked;
    });

    days.forEach((booking, index) => {
      assert.equal(booking.hasTimeSlots, isDayOpen[index]);
    });
  });

  it("Check if booking time has correct length", () => {
    const startTime = moment
      .utc(new Date())
      .hour(9)
      .startOf("h");

    const { endTime } = returnBookingSlot(startTime);

    assert.equal(moment(endTime).diff(startTime, "minute"), 40);
  });

  it("Checks if booking time is valid", () => {
    assert.isTrue(
      isValidTimeslot(
        moment
          .utc(new Date())
          .hour(9)
          .minute(45)
          .startOf("h")
      ),
      "9:45 should return true"
    );

    assert.isTrue(
      isValidTimeslot(
        moment
          .utc(new Date())
          .hour(15)
          .startOf("h")
      ),
      "15:00 should return true"
    );

    assert.isFalse(
      isValidTimeslot(
        moment
          .utc(new Date())
          .hour(10)
          .minute(20)
          .startOf("h")
      ),
      "10:20 should return false"
    );

    assert.isFalse(
      isValidTimeslot(
        moment
          .utc(new Date())
          .hour(10)
          .startOf("h")
      ),
      "10:00 should return false"
    );
  });
});
