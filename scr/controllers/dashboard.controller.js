import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {

  const [
    activeContestsCount,
    activeContestsList,
    totalUsers,
    totalSubmissions,
    pendingApprovals,
    completedContestsCount,
    completedContestsList
  ] = await Promise.all([

    // ✅ Count
    Contest.countDocuments({ status: "active" }),

    // ✅ Active Contest Details
    Contest.find({ status: "active" })
      .select("title startDate endDate prize status")
      .sort({ createdAt: -1 }),

    // Users
    User.countDocuments(),

    // Submissions
    Submission.countDocuments(),

    // Pending
    Submission.countDocuments({ status: "pending" }),

    // Completed Count
    Contest.countDocuments({ status: "completed" }),

    // Completed Contest Details
    Contest.find({ status: "completed" })
      .select("title startDate endDate prize status")
      .sort({ createdAt: -1 })

  ]);

  res.status(200).json({
    success: true,
    data: {
      activeContests: {
        count: activeContestsCount,
        list: activeContestsList
      },
      completedContests: {
        count: completedContestsCount,
        list: completedContestsList
      },
      totalUsers,
      totalSubmissions,
      pendingApprovals
    }
  });
});