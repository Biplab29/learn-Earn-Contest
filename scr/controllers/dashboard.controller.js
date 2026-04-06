import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {

  const [
    activeContests,
    totalUsers,
    totalSubmissions,
    pendingApprovals,
    completedContests
  ] = await Promise.all([

    // Active Contest
    Contest.countDocuments({ status: "active" }),

    // Total Users
    User.countDocuments(),

    // Total Submissions
    Submission.countDocuments(),

    // Pending 
    Submission.countDocuments({ status: "pending" }),

    // Completed Contest
    Contest.countDocuments({ status: "completed" })
  ]);

  res.status(201).json({
    success: true,
    data: {
      activeContests,
      totalUsers,
      totalSubmissions,
      pendingApprovals,
      completedContests
    }
  });
});