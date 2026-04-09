// import express from "express";
// import {
//   submitProject,
//   getSubmissionsByContest,
//   getMySubmissions,
//   evaluateSubmission,
//   declareWinner,
//   getContestParticipantCount,
//   getAllContestParticipantCount,
//   getMyJoinedContestCount
// } from "../controllers/submission.controller.js";
// import { verifyJWT } from "../middleware/checkAuthUser.js ";
// import { authorizeRoles } from "../middleware/checkAuthUser.js";

// const submissionRouter = express.Router();

// submissionRouter.post("/", verifyJWT, submitProject);

// submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);

// submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount); // ekjon koto gulo contest a join koreche


// submissionRouter.get("/contest/:contestId", getSubmissionsByContest);

// submissionRouter.get("/contest/:contestId/participant-count", getContestParticipantCount); //kotojon ekta contest a participatet koreche

// submissionRouter.get("/participant-count", getAllContestParticipantCount); //total kotojon All contest a participates koreche 


// submissionRouter.put("/:id/evaluate", verifyJWT, authorizeRoles("admin"),evaluateSubmission);

// submissionRouter.put("/contest/:contestId/declare-winner", authorizeRoles("admin"), verifyJWT, declareWinner);

// export default submissionRouter;

import express from "express";
import {
  submitProject,
  getSubmissionsByContest,
  getMySubmissions,
  evaluateSubmission,
  declareWinner,
  getContestParticipantCount,
  getAllContestParticipantCount,
  getMyJoinedContestCount,
  getTotalSubmittedContests,
  getContestSubmissionSummary,
  getSingleContestSubmissionReport,
} from "../controllers/submission.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

const submissionRouter = express.Router();


// ============================================
// 🟢 USER ROUTES (Student / Participant)
// ============================================

// ✅ Submit project (contest submission)
submissionRouter.post(
  "/submit",
  verifyJWT,
  submitProject
);

// ✅ Get my submissions
submissionRouter.get(
  "/my-submissions",
  verifyJWT,
  getMySubmissions
);

// ✅ How many contests I submitted
submissionRouter.get(
  "/my-contest-count",
  verifyJWT,
  getMyJoinedContestCount
);


// ============================================
// 🟡 CONTEST SPECIFIC ROUTES
// ============================================

// ✅ Get all submissions for a contest
submissionRouter.get(
  "/contest/:contestId",
  getSubmissionsByContest
);

// ✅ How many students submitted in one contest
submissionRouter.get(
  "/contest/:contestId/participant-count",
  getContestParticipantCount
);


// ============================================
// 🔵 GLOBAL STATS (All contests)
// ============================================

// ✅ Total unique users across all contests
submissionRouter.get(
  "/participant-count",
  getAllContestParticipantCount
);


// ADMIN ROUTES

// ✅ Evaluate submission
submissionRouter.put(
  "/evaluate/:id",
  verifyJWT,
  authorizeRoles("admin"),
  evaluateSubmission
);

// ✅ Declare winner
submissionRouter.put(
  "/contest/:contestId/declare-winner",
  verifyJWT,
  authorizeRoles("admin"),
  declareWinner
);

// ✅ How many contests received submissions
submissionRouter.get(
  "/submitted-contests-count",
  verifyJWT,
  authorizeRoles("admin"),
  getTotalSubmittedContests
);

// ✅ Contest summary count only
submissionRouter.get(
  "/contest-summary",
  verifyJWT,
  authorizeRoles("admin"),
  getContestSubmissionSummary
);

// ✅ Full report (student details)
submissionRouter.get(
  "/:contestId/contest-report",
  verifyJWT,
  authorizeRoles("admin"),
  getSingleContestSubmissionReport
);


export default submissionRouter;

console.log("submission route is working");