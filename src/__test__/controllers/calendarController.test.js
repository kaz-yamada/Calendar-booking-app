import "@babel/polyfill";
import * as chai from "chai";
import chaiHttp from "chai-http";

import server from "../../server";

chai.use(chaiHttp);

// TODO: actually implment tests for the endpoints

before(() => {});

describe("GET /days", () => {
  it("Get request for bookable days in month", done => {
    done();
  });
});

describe("GET /timeslots", () => {
  it("Get request for bookable days in month", done => {
    done();
  });
});

describe("POST /book", () => {
  it("Makes a booking request for 9:00", done => {
    chai
      .request(server)
      .post("/api/book")
      .send({
        year: 2020,
        month: 1,
        day: 30,
        hour: 9,
        minute: 0
      })
      .end((err, res) => {
        if (err) return console.error(err);

        res.should.have.status(200);
        console.log("Response Body:", res.body);
      });
    done();
  });
});
