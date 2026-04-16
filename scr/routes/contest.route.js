

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



//\ admin contest create / update / delete korte parbe


// বাংলা: নতুন contest create
// English: Create a contest
contestRouter.post(
  "/create",
  verifyJWT,
  authorizeRoles("admin"),
  contestAssetFields,
  createContest
);

// বাংলা: existing contest update
// English: Update contest
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


// sobai contest list / details dhekte pabe


// বাংলা: সব contest দেখাবে
// English: Get all contests
contestRouter.get("/", getAllContests);

// বাংলা: active contest list
// English: Get active contests
contestRouter.get("/active", getActiveContests);

// বাংলা: upcoming contest list
// English: Get upcoming contests
contestRouter.get("/upcoming", getUpcomingContests);

// বাংলা: completed contest list
// English: Get completed contests
contestRouter.get("/completed", getCompletedContests);

// বাংলা: project briefing file download
// English: Download contest project briefing
contestRouter.get("/:id/project-briefing/download", downloadProjectBriefing);

// বাংলা: single contest details
// English: Get single contest by id
contestRouter.get("/:id", getContestById);

export default contestRouter;

console.log("contest route is working");