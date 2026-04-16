


import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Submission } from "../models/submission.model.js";


// GET DASHBOARD STATS


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
    pendingEvaluations,
  ] = await Promise.all([
  
    // ACTIVE CONTESTS
    //active contest count

    Contest.countDocuments({
      status: "active",
    }),

    //active contest list
    
    Contest.find({
      status: "active",
    })
      .select("title description startDate deadline rewards image status participationType")
      .sort({ deadline: 1 }),

    // completed contest count

    Contest.countDocuments({
      status: "completed",
    }),

    //completed contest list
  
    Contest.find({
      status: "completed",
    })
      .select("title description startDate deadline rewards image status participationType")
      .sort({ deadline: -1 }),

    // =====================================================
    // UPCOMING CONTESTS
    // বাংলা: upcoming contest count
    // English: count upcoming contests
    // =====================================================
    Contest.countDocuments({
      status: "upcoming",
    }),

    //upcoming contest list

    Contest.find({
      status: "upcoming",
    })
      .select("title description startDate deadline rewards image status participationType")
      .sort({ startDate: 1 }),


    // TOTAL USERS
  
    User.countDocuments(),


    // TOTAL SUBMISSIONS
 
    Submission.countDocuments(),

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
        pendingEvaluation: pendingEvaluations,
      },
      evaluations: {
        pending: pendingEvaluations,
      },
    },
  });
});