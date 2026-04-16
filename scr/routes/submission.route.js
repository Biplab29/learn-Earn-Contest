

import express from "express";
import {
  submitProject,
  getSubmissionsByContest,
  getMySubmissions,
  evaluateSubmission,
  declareWinner,
  getAllContestParticipantCount,
  getMyJoinedContestCount,
  getTotalSubmittedContests,
  getContestSubmissionSummary,
  getSingleContestSubmissionReport,
  getEvaluatedUsersByContest,
  getAllWinners,
  updateWinner,
  deleteWinner,
  updateWinnerDetails,
  updateEvaluation,
  deleteEvaluation,
  updateSubmission,
  deleteSubmission,
} from "../controllers/submission.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

const submissionRouter = express.Router();

// submit project
submissionRouter.post("/submit", verifyJWT, submitProject);

// logged-in user routes
submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);
submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount);

// admin reports
submissionRouter.get(
  "/participant-count",
  verifyJWT,
  authorizeRoles("admin"),
  getAllContestParticipantCount
);

submissionRouter.get(
  "/submitted-contests",
  verifyJWT,
  authorizeRoles("admin"),
  getTotalSubmittedContests
);

submissionRouter.get(
  "/contest-summary",
  verifyJWT,
  authorizeRoles("admin"),
  getContestSubmissionSummary
);

submissionRouter.get(
  "/contest-report/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSingleContestSubmissionReport
);

// contest submissions
submissionRouter.get(
  "/contest/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSubmissionsByContest
);

submissionRouter.get(
  "/contest/:contestId/evaluated-users",
  verifyJWT,
  authorizeRoles("admin"),
  getEvaluatedUsersByContest
);

// evaluation
submissionRouter.put(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  evaluateSubmission
);

submissionRouter.patch(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  updateEvaluation
);

submissionRouter.delete(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteEvaluation
);

// winner management
submissionRouter.put(
  "/contest/:contestId/declare-winner",
  verifyJWT,
  authorizeRoles("admin"),
  declareWinner
);

submissionRouter.get(
  "/winners",
  verifyJWT,
  authorizeRoles("admin"),
  getAllWinners
);

submissionRouter.put(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinner
);

submissionRouter.delete(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  deleteWinner
);

submissionRouter.put(
  "/contest/:contestId/winner-details",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinnerDetails
);

// submission owner/team member update/delete
submissionRouter.patch("/:id", verifyJWT, updateSubmission);
submissionRouter.delete("/:id", verifyJWT, deleteSubmission);

export default submissionRouter;

console.log("Submission Router is working");