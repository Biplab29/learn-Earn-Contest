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


// SUBMIT ROUTE
// বাংলা: team project submit korbe

submissionRouter.post("/submit", verifyJWT, submitProject);



// বাংলা: logged-in user এর own submission related routes

submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);
submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount);



// all contest participant count
submissionRouter.get(
  "/participant-count",
  verifyJWT,
  authorizeRoles("admin"),
  getAllContestParticipantCount
);

// get submissions by contest
submissionRouter.get(
  "/contest/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSubmissionsByContest
);


// admin evaluation and winner management

// evaluate one submission

submissionRouter.put(
  "/evaluate/:id",
  verifyJWT,
  authorizeRoles("admin"),
  evaluateSubmission
);

// declare winner

submissionRouter.put(
  "/contest/:contestId/declare-winner",
  verifyJWT,
  authorizeRoles("admin"),
  declareWinner
);

//  all submitted contests detailed report

submissionRouter.get(
  "/submitted-contests",
  verifyJWT,
  authorizeRoles("admin"),
  getTotalSubmittedContests
);

// contest summary

submissionRouter.get(
  "/contest-summary",
  verifyJWT,
  authorizeRoles("admin"),
  getContestSubmissionSummary
);

//single contest report

submissionRouter.get(
  "/contest-report/:contestId",
  verifyJWT,
  authorizeRoles("admin"),
  getSingleContestSubmissionReport
);

//evaluated users in one contest

submissionRouter.get(
  "/contest/:contestId/evaluated-users",
  verifyJWT,
  authorizeRoles("admin"),
  getEvaluatedUsersByContest
);

// all winners

submissionRouter.get(
  "/winners",
  verifyJWT,
  authorizeRoles("admin"),
  getAllWinners
);

//update winner

submissionRouter.put(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinner
);

//  delete winner
submissionRouter.delete(
  "/contest/:contestId/winner",
  verifyJWT,
  authorizeRoles("admin"),
  deleteWinner
);

//  update winner details

submissionRouter.put(
  "/contest/:contestId/winner-details",
  verifyJWT,
  authorizeRoles("admin"),
  updateWinnerDetails
);

// update evaluation

submissionRouter.put(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  updateEvaluation
);

//delete evaluation / reset pending

submissionRouter.delete(
  "/evaluation/:id",
  verifyJWT,
  authorizeRoles("admin"),
  deleteEvaluation
);

// submission owner/team member update/delete korte pparbe



//  update submission
submissionRouter.patch("/:id", verifyJWT, updateSubmission);
// delete submission
submissionRouter.delete("/:id", verifyJWT, deleteSubmission);

export default submissionRouter;

console.log("Submission Router is working");