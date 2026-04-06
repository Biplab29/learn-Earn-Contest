import express from "express";
import {
  submitProject,
  getSubmissionsByContest,
  getMySubmissions,
  evaluateSubmission,
  declareWinner,
  getContestParticipantCount,
  getAllContestParticipantCount,
  getMyJoinedContestCount
} from "../controllers/submission.controller.js";
import { verifyJWT } from "../middleware/checkAuthUser.js ";
import { authorizeRoles } from "../middleware/checkAuthUser.js";

const submissionRouter = express.Router();

submissionRouter.post("/", verifyJWT, submitProject);

submissionRouter.get("/my-submissions", verifyJWT, getMySubmissions);

submissionRouter.get("/my-contest-count", verifyJWT, getMyJoinedContestCount); // ekjon koto gulo contest a join koreche


submissionRouter.get("/contest/:contestId", getSubmissionsByContest);

submissionRouter.get("/contest/:contestId/participant-count", getContestParticipantCount); //kotojon ekta contest a participatet koreche

submissionRouter.get("/participant-count", getAllContestParticipantCount); //total kotojon All contest a participates koreche 


submissionRouter.put("/:id/evaluate", verifyJWT, authorizeRoles("admin"),evaluateSubmission);

submissionRouter.put("/contest/:contestId/declare-winner", authorizeRoles("admin"), verifyJWT, declareWinner);

export default submissionRouter;