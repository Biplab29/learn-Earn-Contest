import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";
import { Team } from "../models/team.model.js";

export const getDashboardStats = asyncHandler(async (req, res) => {
  await Contest.syncStatuses();

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
    pendingTeamsCount,
    recentPendingTeams,
  ] = await Promise.all([
    // ✅ Active contests
    Contest.countDocuments({
      status: "active",
    }),

    Contest.find({
      status: "active",
    })
      .select("title description startDate deadline rewards image status")
      .sort({ deadline: 1 }),

    // ✅ Completed contests
    Contest.countDocuments({
      status: "completed",
    }),

    Contest.find({
      status: "completed",
    })
      .select("title description startDate deadline rewards image status")
      .sort({ deadline: -1 }),

    // ✅ Upcoming contests
    Contest.countDocuments({
      status: "upcoming",
    }),

    Contest.find({
      status: "upcoming",
    })
      .select("title description startDate deadline rewards image status")
      .sort({ startDate: 1 }),

    // ✅ Users
    User.countDocuments(),

    // ✅ Total submissions
    Submission.countDocuments(),

    // ✅ Pending approvals
    Submission.countDocuments({ status: "pending" }),

    // ✅ Pending team approvals
    Team.countDocuments({ status: "pending" }),

    Team.find({ status: "pending" })
      .select("teamName status createdAt")
      .populate("leader", "name email")
      .populate("contest", "title")
      .sort({ createdAt: -1 })
      .limit(10),
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
      teams: {
        pendingApproval: pendingTeamsCount,
        recentPending: recentPendingTeams
      },
      approvals: {
        submissions: pendingApprovals,
        teams: pendingTeamsCount,
        total: pendingApprovals + pendingTeamsCount
      }
    },
  });
});
