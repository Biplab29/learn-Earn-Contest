import express from "express";
import {
  submitProject,
  getSubmissionsByContest,
  getMySubmissions,
  evaluateSubmission,
  declareWinner
} from "../controllers/submission.controller.js";


const router = express.Router();


router.post("/", submitProject);

router.get("/my-submissions", getMySubmissions);

router.get("/contest/:contestId", getSubmissionsByContest);

// --- ADMIN ROUTES ---

router.put("/:id/evaluate", evaluateSubmission);


router.put("/contest/:contestId/declare-winner", declareWinner);

export default router;