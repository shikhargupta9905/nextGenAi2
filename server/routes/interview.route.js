import express from "express";
import isAuth from "../middlewares/isAuth.js";
import upload from "../middlewares/multer.js";

import {
  startInterview,
  submitAnswer,
  generateInterviewReport,
  getInterviewReport,
  analyzeResume
} from "../controllers/interview.controller.js";

const interviewRouter = express.Router();

interviewRouter.post(
  "/resume",
  isAuth,
  upload.single("resume"), // or upload.single("file") depending on your frontend FormData key
  analyzeResume
);

interviewRouter.post(
  "/start",
  isAuth,
  upload.single("resume"),
  startInterview
);


interviewRouter.post(
  "/answer",
  isAuth,
  submitAnswer
);

interviewRouter.post(
  "/report",
  isAuth,
  generateInterviewReport
);

interviewRouter.get(
  "/report/:interviewId",
  isAuth,
  getInterviewReport
);

export default interviewRouter;
