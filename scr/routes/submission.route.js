import express from "express";
import {
  submitProject,
  getSubmissionsByContest,
  getMySubmissions,
  evaluateSubmission,
  declareWinner
} from "../controllers/submission.controller.js";


const router = express.Router();


// @route   POST /api/submissions
// @desc    Submit a project link
router.post("/", submitProject);

// @route   GET /api/submissions/my-submissions
// @desc    View all projects I have submitted
router.get("/my-submissions", getMySubmissions);

// @route   GET /api/submissions/contest/:contestId
// @desc    View all submissions for a contest
router.get("/contest/:contestId", getSubmissionsByContest);

// --- ADMIN / JUDGE ROUTES ---
// You should ideally protect these with an Admin middleware!

// @route   PUT /api/submissions/:id/evaluate
// @desc    Give a score and remarks to a submission
router.put("/:id/evaluate", evaluateSubmission);

// @route   PUT /api/submissions/contest/:contestId/declare-winner
// @desc    End contest and declare the winner
router.put("/contest/:contestId/declare-winner", declareWinner);

export default router;