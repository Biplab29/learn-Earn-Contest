
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";

// helper
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isContestActive = (contest) => getContestStatus(contest) === "active";

const normalizeScore = (value) => {
  if (value === undefined || value === null || value === "") {
    return null;
  }

  const parsedScore = Number(value);

  if (!Number.isFinite(parsedScore) || parsedScore < 0) {
    return null;
  }

  return parsedScore;
};

const addSubmissionRanks = (submissions) =>
  submissions.map((submission, index) => ({
    rank: index + 1,
    ...submission.toObject(),
  }));

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

  if (participation.participationType === "team") {
    await Participation.updateMany(
      {
        contest: contestId,
        team: participation.team,
      },
      {
        status: "submitted",
      }
    );
  } else {
    participation.status = "submitted";
    await participation.save();
  }

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

  const evaluatedSubmissions = submissions.filter(
    (item) => item.status === "evaluated"
  );

  const pendingSubmissions = submissions.filter(
    (item) => item.status !== "evaluated"
  );

  return res.status(200).json({
    success: true,
    message: "Contest submissions fetched successfully",
    totalSubmissions: submissions.length,
    totalEvaluatedSubmissions: evaluatedSubmissions.length,
    totalPendingSubmissions: pendingSubmissions.length,
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

  const normalizedScore = normalizeScore(totalScore);

  if (normalizedScore === null) {
    return res.status(400).json({
      success: false,
      message: "A valid totalScore greater than or equal to 0 is required",
    });
  }

  if (remarks !== undefined && typeof remarks !== "string") {
    return res.status(400).json({
      success: false,
      message: "Remarks must be a string",
    });
  }

  const submission = await Submission.findById(id)
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title isClosed");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  if (submission.contest?.isClosed) {
    return res.status(400).json({
      success: false,
      message: "Winner has already been declared for this contest",
    });
  }

  submission.totalScore = normalizedScore;
  submission.status = "evaluated";

  if (remarks !== undefined) {
    submission.remarks = remarks.trim();
  }

  await submission.save();
  await submission.populate("contest", "title");

  return res.status(200).json({
    success: true,
    message: "Submission evaluated successfully",
    submission,
  });
});

// ================================
// Declare winner
// ================================
// export const declareWinner = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   if (!isValidObjectId(contestId)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid contestId",
//     });
//   }

//   const contest = await Contest.findById(contestId);

//   if (!contest) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   const submissions = await Submission.find({ contest: contestId })
//     .sort({ totalScore: -1, createdAt: 1 })
//     .populate("user", "name email")
//     .populate("team", "teamName")
//     .populate("contest", "title");

//   if (submissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "No submissions found to evaluate.",
//     });
//   }

//   const evaluatedSubmissions = submissions.filter(
//     (submission) => submission.status === "evaluated"
//   );

//   if (evaluatedSubmissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "No evaluated submissions found. Evaluate submissions before declaring a winner.",
//     });
//   }

//   const pendingSubmissions = submissions.filter(
//     (submission) => submission.status !== "evaluated"
//   );

//   if (!contest.isClosed && pendingSubmissions.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Evaluate all submissions before declaring the winner.",
//       pendingSubmissions: pendingSubmissions.length,
//     });
//   }

//   const leaderboard = addSubmissionRanks(evaluatedSubmissions);
//   const winnerAlreadyDeclared = contest.isClosed;

//   if (!winnerAlreadyDeclared) {
//     contest.isClosed = true;
//     contest.status = "completed";
//     await contest.save();
//   }

//   return res.status(200).json({
//     success: true,
//     message: winnerAlreadyDeclared
//       ? "Winner already declared for this contest"
//       : "Winner declared successfully",
//     winner: leaderboard[0],
//     leaderboard,
//     totalEvaluatedSubmissions: leaderboard.length,
//   });
// });

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
// ***4) Total contests that received at least one submission
// ================================
export const getTotalSubmittedContests = asyncHandler(async (req, res) => {
  await Contest.syncStatuses();

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
      const evaluatedStudentsMap = new Map();

      const evaluatedSubmissions = submissions.filter(
        (item) => item.status === "evaluated"
      );

      const pendingSubmissions = submissions.filter(
        (item) => item.status !== "evaluated"
      );

      const submissionDetails = submissions.map((item) => {
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

          if (item.status === "evaluated") {
            evaluatedStudentsMap.set(item.user._id.toString(), {
              _id: item.user._id,
              name: item.user.name,
              email: item.user.email,
              team: item.team
                ? {
                    _id: item.team._id,
                    teamName: item.team.teamName,
                  }
                : null,
              totalScore: item.totalScore,
              remarks: item.remarks,
            });
          }
        }

        return {
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
              }
            : null,
          githubLink: item.githubLink,
          liveUrl: item.liveUrl,
          totalScore: item.totalScore,
          remarks: item.remarks,
          status: item.status,
          submittedAt: item.createdAt,
          updatedAt: item.updatedAt,
        };
      });

      const evaluatedSubmissionDetails = evaluatedSubmissions.map((item) => ({
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
            }
          : null,
        githubLink: item.githubLink,
        liveUrl: item.liveUrl,
        totalScore: item.totalScore,
        remarks: item.remarks,
        status: item.status,
        submittedAt: item.createdAt,
        updatedAt: item.updatedAt,
      }));

      const studentDetails = Array.from(uniqueStudentsMap.values());
      const evaluatedStudentDetails = Array.from(evaluatedStudentsMap.values());

      return {
        ...contest.toObject(),
        totalSubmissions: submissions.length,
        totalSubmittedStudents: studentDetails.length,
        totalEvaluatedSubmissions: evaluatedSubmissions.length,
        totalPendingSubmissions: pendingSubmissions.length,
        totalEvaluatedStudents: evaluatedStudentDetails.length,
        studentDetails,
        evaluatedStudentDetails,
        submissionDetails,
        evaluatedSubmissionDetails,
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
  await Contest.syncStatuses();

  const summary = await Submission.aggregate([
    {
      $group: {
        _id: "$contest",
        totalSubmissions: { $sum: 1 },
        uniqueStudents: { $addToSet: "$user" },
        totalEvaluatedSubmissions: {
          $sum: {
            $cond: [{ $eq: ["$status", "evaluated"] }, 1, 0],
          },
        },
        evaluatedStudents: {
          $addToSet: {
            $cond: [
              { $eq: ["$status", "evaluated"] },
              "$user",
              "$$REMOVE",
            ],
          },
        },
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
        totalEvaluatedSubmissions: 1,
        totalPendingSubmissions: {
          $subtract: ["$totalSubmissions", "$totalEvaluatedSubmissions"],
        },
        totalEvaluatedStudents: { $size: "$evaluatedStudents" },
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

  if (!contestId || !isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contest ID is required",
    });
  }

  await Contest.syncStatuses({ _id: contestId });

  const contest = await Contest.findById(contestId).select(
    "title status startDate deadline"
  );

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const submissions = await Submission.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName members")
    .sort({ createdAt: -1 });

  const uniqueStudentIds = [
    ...new Set(
      submissions
        .filter((item) => item.user?._id)
        .map((item) => item.user._id.toString())
    ),
  ];

  const evaluatedSubmissions = submissions.filter(
    (item) => item.status === "evaluated"
  );

  const pendingSubmissions = submissions.filter(
    (item) => item.status !== "evaluated"
  );

  const evaluatedStudentIds = [
    ...new Set(
      evaluatedSubmissions
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
      totalEvaluatedSubmissions: evaluatedSubmissions.length,
      totalPendingSubmissions: pendingSubmissions.length,
      totalEvaluatedStudents: evaluatedStudentIds.length,
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
    evaluatedSubmissionDetails: evaluatedSubmissions.map((item) => ({
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


export const getEvaluatedUsersByContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!contestId || !mongoose.Types.ObjectId.isValid(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contestId",
    });
  }

  const submissions = await Submission.find({
    contest: contestId,
    status: "evaluated",
  })
    .populate("user", "name email")
    .populate("team", "teamName");

  const uniqueUsersMap = new Map();

  submissions.forEach((item) => {
    if (item.user) {
      uniqueUsersMap.set(item.user._id.toString(), {
        _id: item.user._id,
        name: item.user.name,
        email: item.user.email,
        team: item.team
          ? {
              _id: item.team._id,
              teamName: item.team.teamName,
            }
          : null,
        totalScore: item.totalScore,
        remarks: item.remarks,
        evaluatedAt: item.updatedAt,
      });
    }
  });

  const evaluatedUsers = Array.from(uniqueUsersMap.values());

  return res.status(200).json({
    success: true,
    message: "Evaluated users fetched successfully",
    contestId,
    totalEvaluatedUsers: evaluatedUsers.length,
    evaluatedUsers,
  });
});

// export const declareWinner = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   if (!isValidObjectId(contestId)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid contestId",
//     });
//   }

//   const contest = await Contest.findById(contestId);

//   if (!contest) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   const submissions = await Submission.find({ contest: contestId })
//     .sort({ totalScore: -1, createdAt: 1 })
//     .populate("user", "name email")
//     .populate("team", "teamName")
//     .populate("contest", "title");

//   if (submissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "No submissions found to evaluate.",
//     });
//   }

//   const evaluatedSubmissions = submissions.filter(
//     (submission) => submission.status === "evaluated"
//   );

//   if (evaluatedSubmissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message:
//         "No evaluated submissions found. Evaluate submissions before declaring a winner.",
//     });
//   }

//   const pendingSubmissions = submissions.filter(
//     (submission) => submission.status !== "evaluated"
//   );

//   if (!contest.isClosed && pendingSubmissions.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Evaluate all submissions before declaring the winner.",
//       pendingSubmissions: pendingSubmissions.length,
//     });
//   }

//   const leaderboard = addSubmissionRanks(evaluatedSubmissions);
//   const winnerAlreadyDeclared = contest.isClosed;

//   if (!winnerAlreadyDeclared) {
//     contest.isClosed = true;
//     contest.status = "completed";
//     contest.winner = leaderboard[0]._id; // ✅ save winner in DB
//     await contest.save();
//   }

//   const updatedContest = await Contest.findById(contestId).populate({
//     path: "winner",
//     populate: [
//       { path: "user", select: "name email" },
//       { path: "team", select: "teamName" },
//     ],
//   });

//   return res.status(200).json({
//     success: true,
//     message: winnerAlreadyDeclared
//       ? "Winner already declared for this contest"
//       : "Winner declared successfully",
//     contestId: contest._id,
//     contestTitle: contest.title,
//     winner: updatedContest?.winner || leaderboard[0],
//     leaderboard,
//     totalEvaluatedSubmissions: leaderboard.length,
//   });
// });


// export const declareWinner = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   if (!isValidObjectId(contestId)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid contestId",
//     });
//   }

//   const contest = await Contest.findById(contestId);

//   if (!contest) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   const submissions = await Submission.find({ contest: contestId })
//     .populate("user", "name email")
//     .populate("team", "teamName")
//     .populate("contest", "title");

//   if (submissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "No submissions found to evaluate.",
//     });
//   }

//   const evaluatedSubmissions = submissions
//     .filter((submission) => submission.status === "evaluated")
//     .sort((a, b) => {
//       if (b.totalScore !== a.totalScore) {
//         return b.totalScore - a.totalScore;
//       }
//       return new Date(a.createdAt) - new Date(b.createdAt);
//     });

//   if (evaluatedSubmissions.length === 0) {
//     return res.status(400).json({
//       success: false,
//       message: "No evaluated submissions found. Evaluate submissions before declaring a winner.",
//     });
//   }

//   const pendingSubmissions = submissions.filter(
//     (submission) => submission.status !== "evaluated"
//   );

//   if (!contest.isClosed && pendingSubmissions.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Evaluate all submissions before declaring the winner.",
//       pendingSubmissions: pendingSubmissions.length,
//     });
//   }

//   const leaderboard = addSubmissionRanks(evaluatedSubmissions);
//   const winnerAlreadyDeclared = contest.isClosed;

//   if (!winnerAlreadyDeclared) {
//     contest.isClosed = true;
//     contest.status = "completed";
//     contest.winner = leaderboard[0]._id;
//     await contest.save();
//   }

//   const updatedContest = await Contest.findById(contestId).populate({
//     path: "winner",
//     populate: [
//       { path: "user", select: "name email" },
//       { path: "team", select: "teamName" },
//     ],
//   });

//   return res.status(200).json({
//     success: true,
//     message: winnerAlreadyDeclared
//       ? "Winner already declared for this contest"
//       : "Winner declared successfully",
//     contestId: contest._id,
//     contestTitle: contest.title,
//     winner: updatedContest?.winner || leaderboard[0],
//     leaderboard,
//     totalEvaluatedSubmissions: leaderboard.length,
//   });
// });


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

  const now = new Date();
  const deadline = new Date(contest.deadline);

  // before deadline -> cannot declare winner
  if (now < deadline) {
    return res.status(400).json({
      success: false,
      message: "Winner can be declared only after contest deadline.",
    });
  }

  // already declared
  if (contest.isClosed) {
    const alreadyClosedContest = await Contest.findById(contestId).populate({
      path: "winner",
      populate: [
        { path: "user", select: "name email" },
        { path: "team", select: "teamName" },
      ],
    });

    return res.status(200).json({
      success: true,
      message: "Winner already declared for this contest",
      contestId: alreadyClosedContest._id,
      contestTitle: alreadyClosedContest.title,
      winner: alreadyClosedContest.winner,
    });
  }

  const submissions = await Submission.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title");

  if (submissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No submissions found.",
    });
  }

  const evaluatedSubmissions = submissions
    .filter((submission) => submission.status === "evaluated")
    .sort((a, b) => {
      if (b.totalScore !== a.totalScore) {
        return b.totalScore - a.totalScore;
      }
      return new Date(a.createdAt) - new Date(b.createdAt);
    });

  if (evaluatedSubmissions.length === 0) {
    return res.status(400).json({
      success: false,
      message: "No evaluated submissions found. Evaluate submissions before declaring a winner.",
    });
  }

  const pendingSubmissions = submissions.filter(
    (submission) => submission.status !== "evaluated"
  );

  // strict rule -> all submissions must be evaluated
  if (pendingSubmissions.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Evaluate all submissions before declaring the winner.",
      pendingSubmissions: pendingSubmissions.length,
    });
  }

  const leaderboard = addSubmissionRanks(evaluatedSubmissions);

  contest.isClosed = true;
  contest.status = "completed";
  contest.winner = leaderboard[0]._id;
  await contest.save();

  const updatedContest = await Contest.findById(contestId).populate({
    path: "winner",
    populate: [
      { path: "user", select: "name email" },
      { path: "team", select: "teamName" },
    ],
  });

  return res.status(200).json({
    success: true,
    message: "Winner declared successfully",
    contestId: updatedContest._id,
    contestTitle: updatedContest.title,
    winner: updatedContest.winner,
    leaderboard,
    totalEvaluatedSubmissions: leaderboard.length,
  });
});

export const getAllWinners = asyncHandler(async (req, res) => {
  const contests = await Contest.find({
    winner: { $exists: true, $ne: null },
  })
    .populate({
      path: "winner",
      populate: [
        { path: "user", select: "name email" },
        { path: "team", select: "teamName" },
      ],
    })
    .select("title status startDate deadline winner")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "All winners fetched successfully",
    totalWinners: contests.length,
    winners: contests.map((contest) => ({
      contestId: contest._id,
      contestTitle: contest.title,
      status: contest.status,
      startDate: contest.startDate,
      deadline: contest.deadline,
      winner: contest.winner,
    })),
  });
});

export const updateEvaluation = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { totalScore, remarks } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findById(id)
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title isClosed");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  if (submission.contest?.isClosed) {
    return res.status(400).json({
      success: false,
      message: "Winner already declared. Evaluation cannot be updated.",
    });
  }

  if (submission.status !== "evaluated") {
    return res.status(400).json({
      success: false,
      message: "This submission has not been evaluated yet",
    });
  }

  if (totalScore !== undefined) {
    const normalizedScore = normalizeScore(totalScore);

    if (normalizedScore === null) {
      return res.status(400).json({
        success: false,
        message: "A valid totalScore greater than or equal to 0 is required",
      });
    }

    submission.totalScore = normalizedScore;
  }

  if (remarks !== undefined) {
    if (typeof remarks !== "string") {
      return res.status(400).json({
        success: false,
        message: "Remarks must be a string",
      });
    }

    submission.remarks = remarks.trim();
  }

  await submission.save();
  await submission.populate("contest", "title");

  return res.status(200).json({
    success: true,
    message: "Evaluation updated successfully",
    submission,
  });
});

export const deleteEvaluation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findById(id)
    .populate("user", "name email")
    .populate("team", "teamName")
    .populate("contest", "title isClosed");

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  if (submission.contest?.isClosed) {
    return res.status(400).json({
      success: false,
      message: "Winner already declared. Evaluation cannot be deleted.",
    });
  }

  if (submission.status !== "evaluated") {
    return res.status(400).json({
      success: false,
      message: "This submission is not evaluated yet",
    });
  }

  submission.totalScore = 0;
  submission.remarks = "";
  submission.status = "pending";

  await submission.save();
  await submission.populate("contest", "title");

  return res.status(200).json({
    success: true,
    message: "Evaluation deleted successfully",
    submission,
  });
});
