/* eslint-disable new-cap */
import { Router } from "express";

import {
  getAvailableDays,
  getAvailableTimeslots,
  createBooking
} from "../controllers/calendarController";

const router = Router();

router.route("/days").get(getAvailableDays);
router.route("/timeslots").get(getAvailableTimeslots);
router.route("/book").post(createBooking);

export default router;
