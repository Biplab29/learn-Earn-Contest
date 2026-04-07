import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  const now = new Date();

  const [
    activeContestsCount,
    activeContestsList,
    completedContestsCount,
    completedContestsList,
    upcomingContestsCount,
    upcomingContestsList,
    totalUsers,
    totalSubmissions,
    pendingApprovals,
  ] = await Promise.all([
    // ✅ Active contests
    Contest.countDocuments({
      startDate: { $lte: now },
      deadline: { $gt: now },
    }),

    Contest.find({
      startDate: { $lte: now },
      deadline: { $gt: now },
    })
      .select("title description startDate deadline rewards image status")
      .sort({ deadline: 1 }),

    // ✅ Completed contests
    Contest.countDocuments({
      deadline: { $lte: now },
    }),

    Contest.find({
      deadline: { $lte: now },
    })
      .select("title description startDate deadline rewards image status")
      .sort({ deadline: -1 }),

    // ✅ Upcoming contests
    Contest.countDocuments({
      startDate: { $gt: now },
    }),

    Contest.find({
      startDate: { $gt: now },
    })
      .select("title description startDate deadline rewards image status")
      .sort({ startDate: 1 }),

    // ✅ Users
    User.countDocuments(),

    // ✅ Total submissions
    Submission.countDocuments(),

    // ✅ Pending approvals
    Submission.countDocuments({ status: "pending" }),
  ]);


  return res.status(200).json({
    success: true,
    message: "Dashboard stats fetched successfully",
    data: {
      activeContests: {
        count: activeContestsCount,
        list: activeContestsList,
      },
      completedContests: {
        count: completedContestsCount,
        list: completedContestsList,
      },
      upcomingContests: {
        count: upcomingContestsCount,
        list: upcomingContestsList,
      },
      totalUsers,
      submissions: {
        total: totalSubmissions,
        pending: pendingApprovals
      },
    },
  });
});