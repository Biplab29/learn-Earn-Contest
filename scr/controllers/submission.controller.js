
// import asyncHandler from "../middleware/asyncHandler.js";
// import { Submission } from "../models/submission.model.js";
// import { Contest } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";


// // Submit a project to a contest
// // export const submitProject = asyncHandler(async (req, res) => {
// //   const { contestId, teamId, githubLink, liveUrl } = req.body;

// //   const contest = await Contest.findById(contestId);
// //   if (!contest || contest?.status !== "active") {
// //     return res.status(400).json({ message: "Contest is not active for submissions" });
// //   }

// //   const existingSubmission = await Submission.findOne({
// //     user: req.user._id,
// //     contest: contestId
// //   });

// //   if (existingSubmission) {
// //     return res.status(400).json({
// //       message: "You have already submitted a project for this contest"
// //     });
// //   }

// //   const submission = await Submission.create({
// //     user: req.user._id,
// //     team: teamId || null,
// //     contest: contestId,
// //     githubLink,
// //     liveUrl,
// //   });

// //   res.status(201).json({
// //     message: "Project submitted successfully!",
// //     submission
// //   });
// // });

// // export const submitProject = asyncHandler(async (req, res) => {
// //   const { contestId, githubLink, liveUrl } = req.body;
// //   const userId = req.user._id;

// //   // 1. Check if contest exists and is active
// //   const contest = await Contest.findById(contestId);
// //   if (!contest || contest?.status !== "active") {
// //     return res.status(400).json({ message: "Contest is not active for submissions" });
// //   }

// //   // 2. Verify the user actually joined the contest
// //   const participation = await Participation.findOne({
// //     user: userId,
// //     contest: contestId
// //   });

// //   if (!participation) {
// //     return res.status(403).json({ message: "You must join this contest before submitting." });
// //   }

// //   // 3. Check for existing submissions smartly (Solo vs Team)
// //   let existingSubmission;
  
// //   if (participation.participationType === "team") {
// //     // If they are in a team, check if ANY team member already submitted for this team
// //     existingSubmission = await Submission.findOne({
// //       contest: contestId,
// //       team: participation.team
// //     });
// //   } else {
// //     existingSubmission = await Submission.findOne({
// //       contest: contestId,
// //       user: userId,
// //       team: null 
// //     });
// //   }

// //   if (existingSubmission) {
// //     return res.status(400).json({
// //       message: "A submission already exists for you or your team in this contest."
// //     });
// //   }

// //   // 4. Create the submission
// //   const submission = await Submission.create({
// //     user: userId, // Tracks exactly WHO clicked the submit button
// //     team: participation.team || null, // Auto-assigns team ID securely from the database
// //     contest: contestId,
// //     githubLink,
// //     liveUrl,
// //   });

// //   res.status(201).json({
// //     message: "Project submitted successfully!",
// //     submission
// //   });
// // });

// export const submitProject = asyncHandler(async (req, res) => {
//   const { contestId, githubLink, liveUrl } = req.body;
//   const userId = req.user._id;

//   // Ensure they actually provided the required links
//   if (!githubLink) {
//     return res.status(400).json({ message: "A GitHub link is required to submit." });
//   }

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
//     user: userId, 
//     team: participation.team || null, 
//     contest: contestId,
//     githubLink,
//     liveUrl,
//   });

//   res.status(201).json({
//     message: "Project submitted successfully!",
//     submission
//   });
// });

// // Get all submissions for a specific contest
// export const getSubmissionsByContest = asyncHandler(async (req, res) => {
//   const submissions = await Submission.find({ contest: req.params.contestId })
//     .populate("user", "name email")
//     .populate("team", "teamName")
//     .sort({ totalScore: -1 });

//   res.status(200).json({
//     message: "Contest submissions",
//     submissions
//   });
// });

// // Get my submissions
// export const getMySubmissions = asyncHandler(async (req, res) => {
//   const submissions = await Submission.find({ user: req.user._id })
//     .populate("contest", "title status");

//   res.status(200).json({
//     message: "My submissions",
//     submissions
//   });
// });

// // Evaluate submission
// export const evaluateSubmission = asyncHandler(async (req, res) => {
//   const { totalScore, remarks } = req.body;

//   const submission = await Submission.findByIdAndUpdate(
//     req.params.id,
//     {
//       totalScore,
//       remarks,
//       status: "evaluated"
//     },
//     { new: true, runValidators: true }
//   );

//   if (!submission) {
//     return res.status(404).json({ message: "Submission not found" });
//   }

//   res.status(200).json({
//     message: "Submission evaluated successfully",
//     submission
//   });
// });

// // Declare winner
// export const declareWinner = asyncHandler(async (req, res) => {
//   const contest = await Contest.findById(req.params.contestId);

//   if (!contest) {
//     return res.status(404).json({ message: "Contest not found" });
//   }

//   const leaderboard = await Submission.find({ contest: req.params.contestId })
//     .sort({ totalScore: -1 })
//     .populate("user", "name email")
//     .populate("team", "teamName");

//   if (leaderboard.length === 0) {
//     return res.status(400).json({ message: "No submissions found to evaluate." });
//   }

//   contest.status = "completed";
//   await contest.save();

//   res.status(200).json({
//     message: "Winner declared!",
//     winner: leaderboard[0],
//     leaderboard
//   });
// });

// // 1) How many users joined one contest
// export const getContestParticipantCount = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   const users = await Submission.distinct("user", {
//     contest: contestId
//   });

//   res.status(200).json({
//     message: "Contest participant count fetched successfully",
//     contestId,
//     totalUsers: users.length
//   });
// });

// // 2) How many users joined all contests
// export const getAllContestParticipantCount = asyncHandler(async (req, res) => {
//   const users = await Submission.distinct("user");

//   res.status(200).json({
//     message: "All contest unique participant count fetched successfully",
//     totalUsers: users.length
//   });
// });

// // 3) How many contests one user joined
// export const getMyJoinedContestCount = asyncHandler(async (req, res) => {
//   const contests = await Submission.distinct("contest", {
//     user: req.user._id
//   });

//   res.status(200).json({
//     message: "My joined contest count fetched successfully",
//     userId: req.user._id,
//     totalContests: contests.length
//   });
// });

import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Contest } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";

// helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isContestActive = (contest) => {
  const now = new Date();
  return new Date(contest.startDate) <= now && new Date(contest.deadline) > now;
};

// ================================
// Submit Project
// ================================
export const submitProject = asyncHandler(async (req, res) => {
  const { contestId, githubLink, liveUrl } = req.body;
  const userId = req.user._id;

  if (!contestId || !isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contestId is required",
    });
  }

  if (!githubLink || !githubLink.trim()) {
    return res.status(400).json({
      success: false,
      message: "GitHub link is required",
    });
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  if (!isContestActive(contest)) {
    return res.status(400).json({
      success: false,
      message: "Contest is not active for submissions",
    });
  }

  const participation = await Participation.findOne({
    user: userId,
    contest: contestId,
  });

  if (!participation) {
    return res.status(403).json({
      success: false,
      message: "You must join this contest before submitting.",
    });
  }

  let existingSubmission = null;

  if (participation.participationType === "team") {
    if (!participation.team) {
      return res.status(400).json({
        success: false,
        message: "Team participation found, but no team is assigned.",
      });
    }

    existingSubmission = await Submission.findOne({
      contest: contestId,
      team: participation.team,
    });
  } else {
    existingSubmission = await Submission.findOne({
      contest: contestId,
      user: userId,
      team: null,
    });
  }

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: "A submission already exists for you or your team in this contest.",
    });
  }

  const submission = await Submission.create({
    user: userId,
    team: participation.team || null,
    contest: contestId,
    githubLink: githubLink.trim(),
    liveUrl: liveUrl?.trim() || "",
  });

  const populatedSubmission = await Submission.findById(submission._id)
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title");

  return res.status(201).json({
    success: true,
    message: "Project submitted successfully!",
    submission: populatedSubmission,
  });
});

// ================================
// Get all submissions for one contest
// ================================
export const getSubmissionsByContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contestId",
    });
  }

  const submissions = await Submission.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName members")
    .populate("contest", "title status startDate deadline")
    .sort({ totalScore: -1, createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Contest submissions fetched successfully",
    totalSubmissions: submissions.length,
    submissions,
  });
});

// ================================
// Get my submissions
// ================================
export const getMySubmissions = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({ user: req.user._id })
    .populate("contest", "title status startDate deadline")
    .populate("team", "teamName")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "My submissions fetched successfully",
    totalSubmissions: submissions.length,
    submissions,
  });
});

// ================================
// Evaluate submission
// ================================
export const evaluateSubmission = asyncHandler(async (req, res) => {
  const { totalScore, remarks } = req.body;
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findByIdAndUpdate(
    id,
    {
      totalScore,
      remarks,
      status: "evaluated",
    },
    { new: true, runValidators: true }
  )
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Submission evaluated successfully",
    submission,
  });
});

// ================================
// Declare winner
// ================================
export const declareWinner = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contestId",
    });
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const leaderboard = await Submission.find({ contest: contestId })
    .sort({ totalScore: -1, createdAt: 1 })
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title");

  if (leaderboard.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No submissions found to evaluate.",
    });
  }

  contest.status = "completed";
  await contest.save();

  return res.status(200).json({
    success: true,
    message: "Winner declared successfully",
    winner: leaderboard[0],
    leaderboard,
  });
});

// ================================
// 1) How many users submitted in one contest
// ================================
export const getContestParticipantCount = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contestId",
    });
  }

  const users = await Submission.distinct("user", { contest: contestId });

  return res.status(200).json({
    success: true,
    message: "Contest participant count fetched successfully",
    contestId,
    totalUsers: users.length,
  });
});

// ================================
// 2) How many unique users submitted across all contests
// ================================
export const getAllContestParticipantCount = asyncHandler(async (req, res) => {
  const users = await Submission.distinct("user");

  return res.status(200).json({
    success: true,
    message: "All contest unique participant count fetched successfully",
    totalUsers: users.length,
  });
});

// ================================
// 3) How many contests current user submitted in
// ================================
export const getMyJoinedContestCount = asyncHandler(async (req, res) => {
  const contests = await Submission.distinct("contest", {
    user: req.user._id,
  });

  return res.status(200).json({
    success: true,
    message: "My joined contest count fetched successfully",
    userId: req.user._id,
    totalContests: contests.length,
  });
});

// ================================
// 4) Total contests that received at least one submission
// ================================
export const getTotalSubmittedContests = asyncHandler(async (req, res) => {
  const submittedContestIds = await Submission.distinct("contest");

  const contests = await Contest.find({
    _id: { $in: submittedContestIds },
  })
    .select("title description status startDate deadline image rewards")
    .sort({ createdAt: -1 });

  const result = await Promise.all(
    contests.map(async (contest) => {
      const submissions = await Submission.find({ contest: contest._id })
        .populate("user", "name email")
        .populate("team", "teamName");

      const uniqueStudentsMap = new Map();

      submissions.forEach((item) => {
        if (item.user) {
          uniqueStudentsMap.set(item.user._id.toString(), {
            _id: item.user._id,
            name: item.user.name,
            email: item.user.email,
            team: item.team
              ? {
                  _id: item.team._id,
                  teamName: item.team.teamName,
                }
              : null,
            githubLink: item.githubLink,
            liveUrl: item.liveUrl,
            submittedAt: item.createdAt,
          });
        }
      });

      const studentDetails = Array.from(uniqueStudentsMap.values());

      return {
        ...contest.toObject(),
        totalSubmittedStudents: studentDetails.length,
        studentDetails,
      };
    })
  );

  return res.status(200).json({
    success: true,
    message: "Submitted contest details fetched successfully",
    totalSubmittedContests: result.length,
    contests: result,
  });
});

// ================================
// 5) Every contest summary: how many submissions each contest has
// ================================
export const getContestSubmissionSummary = asyncHandler(async (req, res) => {
  const summary = await Submission.aggregate([
    {
      $group: {
        _id: "$contest",
        totalSubmissions: { $sum: 1 },
        uniqueStudents: { $addToSet: "$user" },
      },
    },
    {
      $lookup: {
        from: "contests",
        localField: "_id",
        foreignField: "_id",
        as: "contest",
      },
    },
    {
      $unwind: "$contest",
    },
    {
      $project: {
        _id: 0,
        contestId: "$contest._id",
        title: "$contest.title",
        status: "$contest.status",
        startDate: "$contest.startDate",
        deadline: "$contest.deadline",
        totalSubmissions: 1,
        totalStudentsSubmitted: { $size: "$uniqueStudents" },
      },
    },
    {
      $sort: { totalSubmissions: -1 },
    },
  ]);

  return res.status(200).json({
    success: true,
    message: "Contest submission summary fetched successfully",
    totalSubmittedContests: summary.length,
    summary,
  });
});


// ================================
// SINGLE CONTEST + STUDENT DETAILS
// ================================
export const getSingleContestSubmissionReport = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  // validate id
  if (!contestId) {
    return res.status(400).json({
      success: false,
      message: "Contest ID is required",
    });
  }

  // find contest
  const contest = await Contest.findById(contestId)
    .select("title status startDate deadline");

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  // get submissions of that contest ONLY
  const submissions = await Submission.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName members")
    .sort({ createdAt: -1 });

  // unique students
  const uniqueStudentIds = [
    ...new Set(
      submissions
        .filter((item) => item.user?._id)
        .map((item) => item.user._id.toString())
    ),
  ];

  return res.status(200).json({
    success: true,
    message: "Single contest submission report fetched successfully",
    contest: {
      contestId: contest._id,
      title: contest.title,
      status: contest.status,
      startDate: contest.startDate,
      deadline: contest.deadline,
      totalSubmissions: submissions.length,
      totalStudentsSubmitted: uniqueStudentIds.length,
    },
    studentDetails: submissions.map((item) => ({
      submissionId: item._id,
      student: item.user
        ? {
            _id: item.user._id,
            name: item.user.name,
            email: item.user.email,
          }
        : null,
      team: item.team
        ? {
            _id: item.team._id,
            teamName: item.team.teamName,
            members: item.team.members || [],
          }
        : null,
      githubLink: item.githubLink,
      liveUrl: item.liveUrl,
      totalScore: item.totalScore,
      remarks: item.remarks,
      status: item.status,
      submittedAt: item.createdAt,
    })),
  });
});


