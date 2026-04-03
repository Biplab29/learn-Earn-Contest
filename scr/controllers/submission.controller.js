import asyncHandler from "../middleware/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Contest } from "../models/contest.model.js";

// Submit a project to a contest
export const submitProject = asyncHandler(async (req, res) => {
  const { contestId, teamId, githubLink, liveUrl } = req.body;

  // Check if the contest exists and is active
  const contest = await Contest.findById(contestId);
  if (!contest || contest.status !== "active") {
    return res.status(400).json({ message: "Contest is not active for submissions" });
  }

  // Prevent a user from submitting twice to the same contest
  const existingSubmission = await Submission.findOne({ user: req.user._id, contest: contestId });
  if (existingSubmission) {
    return res.status(400).json({ message: "You have already submitted a project for this contest" });
  }

  const submission = await Submission.create({
    user: req.user._id,
    team: teamId || null, // Optional, depending on if they are in a team
    contest: contestId,
    githubLink,
    liveUrl,
  });

  res.status(201).json({ message: "Project submitted successfully!", submission });
});

//Get all submissions for a specific contest (For Admins/Judges)
export const getSubmissionsByContest = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ contest: req.params.contestId })
    .populate("user", "name email")
    .populate("team", "teamName")
    .sort({ totalScore: -1 }); // Sort by highest score first

  res.status(200).json({ message: "Contest submissions", submissions });
});

//Get my submissions (For a User to see what they submitted)
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ user: req.user._id })
    .populate("contest", "title status");

  res.status(200).json({ message: "My submissions", submissions });
});

//Evaluate a submission (Admin/Judge gives a score and remarks)
export const evaluateSubmission = asyncHandler(async (req, res) => {
  const { totalScore, remarks } = req.body;

  const submission = await Submission.findByIdAndUpdate(
    req.params.id,
    { 
      totalScore, 
      remarks, 
      status: "evaluated" 
    },
    { new: true, runValidators: true }
  );

  if (!submission) {
    return res.status(404).json({ message: "Submission not found" });
  }

  res.status(200).json({ message: "Submission evaluated successfully", submission });
});

//Declare Winner (Finds the highest score and closes the contest)
export const declareWinner = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId);
  if (!contest) return res.status(404).json({ message: "Contest not found" });

  const leaderboard = await Submission.find({ contest: req.params.contestId })
    .sort({ totalScore: -1 })
    .populate("user", "name email")
    .populate("team", "teamName");

  if (leaderboard.length === 0) {
    return res.status(400).json({ message: "No submissions found to evaluate." });
  }

  // Close the contest
  contest.status = "completed";
  await contest.save();

  res.status(200).json({
    message: "Winner declared!",
    winner: leaderboard[0], 
    leaderboard 
  });
});