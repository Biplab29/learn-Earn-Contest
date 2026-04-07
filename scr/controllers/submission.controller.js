
import asyncHandler from "../middleware/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Contest } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import mongoose from "mongoose";

// Submit a project to a contest
// export const submitProject = asyncHandler(async (req, res) => {
//   const { contestId, teamId, githubLink, liveUrl } = req.body;

//   const contest = await Contest.findById(contestId);
//   if (!contest || contest?.status !== "active") {
//     return res.status(400).json({ message: "Contest is not active for submissions" });
//   }

//   const existingSubmission = await Submission.findOne({
//     user: req.user._id,
//     contest: contestId
//   });

//   if (existingSubmission) {
//     return res.status(400).json({
//       message: "You have already submitted a project for this contest"
//     });
//   }

//   const submission = await Submission.create({
//     user: req.user._id,
//     team: teamId || null,
//     contest: contestId,
//     githubLink,
//     liveUrl,
//   });

//   res.status(201).json({
//     message: "Project submitted successfully!",
//     submission
//   });
// });

// export const submitProject = asyncHandler(async (req, res) => {
//   const { contestId, githubLink, liveUrl } = req.body;
//   const userId = req.user._id;

//   // 1. Check if contest exists and is active
//   const contest = await Contest.findById(contestId);
//   if (!contest || contest?.status !== "active") {
//     return res.status(400).json({ message: "Contest is not active for submissions" });
//   }

//   // 2. Verify the user actually joined the contest
//   const participation = await Participation.findOne({
//     user: userId,
//     contest: contestId
//   });

//   if (!participation) {
//     return res.status(403).json({ message: "You must join this contest before submitting." });
//   }

//   // 3. Check for existing submissions smartly (Solo vs Team)
//   let existingSubmission;
  
//   if (participation.participationType === "team") {
//     // If they are in a team, check if ANY team member already submitted for this team
//     existingSubmission = await Submission.findOne({
//       contest: contestId,
//       team: participation.team
//     });
//   } else {
//     existingSubmission = await Submission.findOne({
//       contest: contestId,
//       user: userId,
//       team: null 
//     });
//   }

//   if (existingSubmission) {
//     return res.status(400).json({
//       message: "A submission already exists for you or your team in this contest."
//     });
//   }

//   // 4. Create the submission
//   const submission = await Submission.create({
//     user: userId, // Tracks exactly WHO clicked the submit button
//     team: participation.team || null, // Auto-assigns team ID securely from the database
//     contest: contestId,
//     githubLink,
//     liveUrl,
//   });

//   res.status(201).json({
//     message: "Project submitted successfully!",
//     submission
//   });
// });

export const submitProject = asyncHandler(async (req, res) => {
  const { contestId, githubLink, liveUrl } = req.body;
  const userId = req.user._id;

  // Ensure they actually provided the required links
  if (!githubLink) {
    return res.status(400).json({ message: "A GitHub link is required to submit." });
  }

  // 1. Check if contest exists and is active
  const contest = await Contest.findById(contestId);
  if (!contest || contest?.status !== "active") {
    return res.status(400).json({ message: "Contest is not active for submissions" });
  }

  // 2. Verify the user actually joined the contest
  const participation = await Participation.findOne({
    user: userId,
    contest: contestId
  });

  if (!participation) {
    return res.status(403).json({ message: "You must join this contest before submitting." });
  }

  // 3. Check for existing submissions smartly (Solo vs Team)
  let existingSubmission;
  
  if (participation.participationType === "team") {
    // If they are in a team, check if ANY team member already submitted for this team
    existingSubmission = await Submission.findOne({
      contest: contestId,
      team: participation.team
    });
  } else {
    existingSubmission = await Submission.findOne({
      contest: contestId,
      user: userId,
      team: null 
    });
  }

  if (existingSubmission) {
    return res.status(400).json({
      message: "A submission already exists for you or your team in this contest."
    });
  }

  // 4. Create the submission
  const submission = await Submission.create({
    user: userId, 
    team: participation.team || null, 
    contest: contestId,
    githubLink,
    liveUrl,
  });

  res.status(201).json({
    message: "Project submitted successfully!",
    submission
  });
});

// Get all submissions for a specific contest
export const getSubmissionsByContest = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ contest: req.params.contestId })
    .populate("user", "name email")
    .populate("team", "teamName")
    .sort({ totalScore: -1 });

  res.status(200).json({
    message: "Contest submissions",
    submissions
  });
});

// Get my submissions
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ user: req.user._id })
    .populate("contest", "title status");

  res.status(200).json({
    message: "My submissions",
    submissions
  });
});

// Evaluate submission
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

  res.status(200).json({
    message: "Submission evaluated successfully",
    submission
  });
});

// Declare winner
export const declareWinner = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.contestId);

  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  const leaderboard = await Submission.find({ contest: req.params.contestId })
    .sort({ totalScore: -1 })
    .populate("user", "name email")
    .populate("team", "teamName");

  if (leaderboard.length === 0) {
    return res.status(400).json({ message: "No submissions found to evaluate." });
  }

  contest.status = "completed";
  await contest.save();

  res.status(200).json({
    message: "Winner declared!",
    winner: leaderboard[0],
    leaderboard
  });
});

// 1) How many users joined one contest
export const getContestParticipantCount = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const users = await Submission.distinct("user", {
    contest: contestId
  });

  res.status(200).json({
    message: "Contest participant count fetched successfully",
    contestId,
    totalUsers: users.length
  });
});

// 2) How many users joined all contests
export const getAllContestParticipantCount = asyncHandler(async (req, res) => {
  const users = await Submission.distinct("user");

  res.status(200).json({
    message: "All contest unique participant count fetched successfully",
    totalUsers: users.length
  });
});

// 3) How many contests one user joined
export const getMyJoinedContestCount = asyncHandler(async (req, res) => {
  const contests = await Submission.distinct("contest", {
    user: req.user._id
  });

  res.status(200).json({
    message: "My joined contest count fetched successfully",
    userId: req.user._id,
    totalContests: contests.length
  });
});

