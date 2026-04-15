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

  // import express from "express";
  // import {
  //   submitProject,
  //   getSubmissionsByContest,
  //   getMySubmissions,
  //   evaluateSubmission,
  //   declareWinner,
  //   // getContestParticipantCount,
  //   getAllContestParticipantCount,
  //   getMyJoinedContestCount,
  //   getTotalSubmittedContests,
  //   getContestSubmissionSummary,
  //   getSingleContestSubmissionReport,
  //   getEvaluatedUsersByContest,
  //   getAllWinners,
  //   updateWinner,
  //   deleteWinner,
  //   updateWinnerDetails,
  //   updateEvaluation,
  //   deleteEvaluation,
  //   updateSubmission,
  //   deleteSubmission,
  // } from "../controllers/submission.controller.js";

  // import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

  // const submissionRouter = express.Router();

//   // ===============================
//   // SUBMIT
//   // ===============================
//   submissionRouter.post("/submit", verifyJWT, submitProject);

//   // ===============================
//   // MY ROUTES
//   // ===============================
//   submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);
//   submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount);

//   // ===============================
//   // GENERAL CONTEST ROUTES
//   // ===============================
//   submissionRouter.get("/participant-count", getAllContestParticipantCount);
//   submissionRouter.get("/contest/:contestId", getSubmissionsByContest);
//   // submissionRouter.get(
//   //   "/contest/:contestId/participant-count",
//   //   getContestParticipantCount
//   // );

//   // ===============================
//   // ADMIN EVALUATION ROUTES
//   // ===============================

//   // evaluate one submission
//   submissionRouter.put(
//     "/evaluate/:id",
//     verifyJWT,
//     authorizeRoles("admin"),
//     evaluateSubmission
//   );

//   // declare winner
//   submissionRouter.put(
//     "/contest/:contestId/declare-winner",
//     verifyJWT,
//     authorizeRoles("admin"),
//     declareWinner
//   );

//   // all contests with full submission details
//   submissionRouter.get(
//     "/submitted-contests-count",
//     verifyJWT,
//     authorizeRoles("admin"),
//     getTotalSubmittedContests
//   );

//   // contest summary with evaluated/pending counts
//   submissionRouter.get(
//     "/contest-summary",
//     verifyJWT,
//     authorizeRoles("admin"),
//     getContestSubmissionSummary
//   );

//   // single contest full report
//   submissionRouter.get(
//     "/contest-report/:contestId",
//     verifyJWT,
//     authorizeRoles("admin"),
//     getSingleContestSubmissionReport
//   );

//   // evaluated users details in one contest
//   submissionRouter.get(
//     "/contest/:contestId/evaluated-users",
//     verifyJWT,
//     authorizeRoles("admin"),
//     getEvaluatedUsersByContest
//   );

//   submissionRouter.get(
//     "/winners",
//     verifyJWT,
//     authorizeRoles("admin"),
//     getAllWinners
//   );

//   submissionRouter.put(
//     "/contest/:contestId/winner",
//     verifyJWT,
//     authorizeRoles("admin"),
//     updateWinner
//   );

//   submissionRouter.delete(
//     "/contest/:contestId/winner",
//     verifyJWT,
//     authorizeRoles("admin"),
//     deleteWinner
//   );

//   submissionRouter.put(
//     "/contest/:contestId/winner-details",
//     verifyJWT,
//     authorizeRoles("admin"),
//     updateWinnerDetails
//   );
// // update evaluation
// submissionRouter.put(
//   "/evaluation/:id",
//   verifyJWT,
//   authorizeRoles("admin"),
//   updateEvaluation
// );

// // delete evaluation / reset to pending
// submissionRouter.delete(
//   "/evaluation/:id",
//   verifyJWT,
//   authorizeRoles("admin"),
//   deleteEvaluation
// );

// submissionRouter.put(
//   "/:id",
//   verifyJWT,
//   updateSubmission
// );

// submissionRouter.patch(
//   "/:id",
//   verifyJWT,
//   updateSubmission
// );

// submissionRouter.delete(
//   "/:id",
//   verifyJWT,
//   deleteSubmission
// );

//   export default submissionRouter;

//   console.log("Submission Router is working");


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


// =====================================================
// SUBMIT ROUTE
// বাংলা: team project submit করবে
// English: submit a project
// =====================================================
submissionRouter.post("/submit", verifyJWT, submitProject);


// =====================================================
// MY ROUTES
// বাংলা: logged-in user এর own submission related routes
// English: routes for logged-in user's submissions
// =====================================================
submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);
submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount);


// =====================================================
// GENERAL / REPORT ROUTES
// বাংলা: participant count / contest submission view
// English: general submission reporting routes
// =====================================================

// বাংলা: সব contest মিলিয়ে unique participant count
// English: all contest participant count
submissionRouter.get(
  "/participant-count",
  verifyJWT,
  authorizeRoles("admin"),
  getAllContestParticipantCount
);

// বাংলা: নির্দিষ্ট contest-এর সব submissions
// English: get submissions by contest
submissionRouter.get(
  "/contest/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSubmissionsByContest
);


// =====================================================
// ADMIN EVALUATION ROUTES
// বাংলা: admin evaluation and winner management
// English: admin-only evaluation and winner routes
// =====================================================

// বাংলা: evaluate one submission
// English: evaluate a submission
submissionRouter.put(
  "/evaluate/:id",
  verifyJWT,
  authorizeRoles("admin"),
  evaluateSubmission
);

// বাংলা: declare winner
// English: declare contest winner
submissionRouter.put(
  "/contest/:contestId/declare-winner",
  verifyJWT,
  authorizeRoles("admin"),
  declareWinner
);

// বাংলা: all submitted contests detailed report
// English: detailed submitted contest report
submissionRouter.get(
  "/submitted-contests",
  verifyJWT,
  authorizeRoles("admin"),
  getTotalSubmittedContests
);

// বাংলা: contest summary
// English: contest summary report
submissionRouter.get(
  "/contest-summary",
  verifyJWT,
  authorizeRoles("admin"),
  getContestSubmissionSummary
);

// বাংলা: single contest report
// English: single contest detailed report
submissionRouter.get(
  "/contest-report/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSingleContestSubmissionReport
);

// বাংলা: evaluated users in one contest
// English: evaluated users by contest
submissionRouter.get(
  "/contest/:contestId/evaluated-users",
  verifyJWT,
  authorizeRoles("admin"),
  getEvaluatedUsersByContest
);

// বাংলা: all winners
// English: get all winners
submissionRouter.get(
  "/winners",
  verifyJWT,
  authorizeRoles("admin"),
  getAllWinners
);

// বাংলা: update winner
// English: update winner manually
submissionRouter.put(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinner
);

// বাংলা: delete winner
// English: remove winner
submissionRouter.delete(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  deleteWinner
);

// বাংলা: update winner details
// English: update winner details
submissionRouter.put(
  "/contest/:contestId/winner-details",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinnerDetails
);

// বাংলা: update evaluation
// English: update evaluation score/remarks
submissionRouter.put(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  updateEvaluation
);

// বাংলা: delete evaluation / reset pending
// English: delete evaluation
submissionRouter.delete(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteEvaluation
);


// =====================================================
// SUBMISSION MANAGEMENT ROUTES
// বাংলা: submission owner/team member update/delete করতে পারবে
// English: submission update/delete routes
// =====================================================

// বাংলা: update submission links
// English: update submission
submissionRouter.patch("/:id", verifyJWT, updateSubmission);

// বাংলা: delete submission
// English: delete submission
submissionRouter.delete("/:id", verifyJWT, deleteSubmission);

export default submissionRouter;

console.log("Submission Router is working");