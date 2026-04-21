
import express from "express";

import {
  createContest,
  getAllContests,
  getContestById,
  downloadProjectBriefing,
  updateContest,
  deleteContest,
  getActiveContests,
  getUpcomingContests,
  getCompletedContests,
} from "../controllers/contest.controller.js";

import {
  contestBriefingUploadFields,
  uploadContestAssets,
} from "../middleware/uploadMiddleware.js";

import { authorizeRoles, verifyJWT } from "../middleware/checkAuthUser.js";

const contestRouter = express.Router();

//  image + project briefing upload field setup

const contestAssetFields = uploadContestAssets.fields([
  { name: "image", maxCount: 1 },
  ...contestBriefingUploadFields.map((name) => ({
    name,
    maxCount: 1,
  })),
]);



// Create a contest
contestRouter.post(
  "/create",
  verifyJWT,
  authorizeRoles("admin"),
  contestAssetFields,
  createContest
);

// Update contest
contestRouter.put(
  "/update/:id",
  verifyJWT,
  authorizeRoles("admin"),
  contestAssetFields,
  updateContest
);

//Delete contest
contestRouter.delete(
  "/delete/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteContest
);



// Get all contests
contestRouter.get("/", getAllContests);

// Get active contests
contestRouter.get("/active", getActiveContests);

// Get upcoming contests
contestRouter.get("/upcoming", getUpcomingContests);

// Get completed contests
contestRouter.get("/completed", getCompletedContests);

//Download contest project briefing
contestRouter.get("/:id/project-briefing/download", downloadProjectBriefing);

// Get single contest by id
contestRouter.get("/:id", getContestById);

export default contestRouter;

console.log("contest route is working");