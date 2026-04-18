
import mongoose from "mongoose";
import asyncHandler from "../middleware/asyncHandler.js";
import { Submission } from "../models/submission.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import { Team } from "../models/team.model.js";

// valid Mongo ObjectId check
const isValidObjectId = (id) => mongoose.Types.ObjectId.isValid(id);

const isContestActive = (contest) => getContestStatus(contest) === "active";

// totalScore number এ convert করবে
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

// leaderboard rank add
const addSubmissionRanks = (submissions) =>
  submissions.map((submission, index) => ({
    rank: index + 1,
    ...submission.toObject(),
  }));

// common populate for team
const teamPopulate = {
  path: "team",
  select: "teamName members leader",
  populate: [
    { path: "members", select: "name email phoneNumber gender" },
    { path: "leader", select: "name email phoneNumber gender" },
  ],
};

// winner populate structure
const winnerPopulate = {
  path: "winner",
  populate: [teamPopulate],
};

// permission check for submission
const canManageSubmission = async ({ submission, user }) => {
  if (!submission || !user) {
    return false;
  }

  if (user.role === "admin") {
    return true;
  }

  const submissionTeamId = submission.team?._id || submission.team;

  if (!submissionTeamId) {
    return false;
  }

  const team = await Team.findById(submissionTeamId).select("members");

  if (!team) {
    return false;
  }

  return team.members.some(
    (memberId) => memberId.toString() === user._id.toString()
  );
};

// helper: single submission response shape
const formatSubmissionDetails = (item) => ({
  submissionId: item._id,
  team: item.team
    ? {
        _id: item.team._id,
        teamName: item.team.teamName,
        members: item.team.members || [],
        leader: item.team.leader || null,
      }
    : null,
  githubLink: item.githubLink,
  liveUrl: item.liveUrl,
  totalScore: item.totalScore,
  remarks: item.remarks,
  status: item.status,
  submittedAt: item.createdAt,
  updatedAt: item.updatedAt,
});

// =====================================================
// SUBMIT PROJECT
// team project submit করবে
// =====================================================
export const submitProject = asyncHandler(async (req, res) => {
  const { contestId, teamName, githubLink, liveUrl } = req.body;
  const userId = req.user._id;

  if (!contestId || !isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contestId is required",
    });
  }

  if (!teamName || !teamName.trim()) {
    return res.status(400).json({
      success: false,
      message: "Team name is required",
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


  const team = await Team.findOne({
    contest: contestId,
    teamName: teamName.trim(),
  });


  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }


  const isMember = team.members.some(
    (memberId) => memberId.toString() === userId.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: "You are not a member of this team",
    });
  }

  const existingSubmission = await Submission.findOne({
    contest: contestId,
    team: team._id,
  });

  if (existingSubmission) {
    return res.status(400).json({
      success: false,
      message: "A submission already exists for this team in this contest",
    });
  }

  const submission = await Submission.create({
    submittedBy: userId,
    team: team._id,
    contest: contestId,
    githubLink: githubLink.trim(),
    liveUrl: liveUrl?.trim() || "",
  });

  await Participation.updateOne(
    {
      contest: contestId,
      team: team._id,
    },
    {
      $set: { status: "submitted" },
    }
  );

  const populatedSubmission = await Submission.findById(submission._id)
    .populate(teamPopulate)
    .populate("submittedBy", "name email phoneNumber gender")
    .populate("contest", "title status startDate deadline");

  return res.status(201).json({
    success: true,
    message: "Project submitted successfully",
    submission: populatedSubmission,
  });
});

// =====================================================
// GET ALL SUBMISSIONS FOR ONE CONTEST
// =====================================================
export const getSubmissionsByContest = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contestId",
    });
  }

  const submissions = await Submission.find({ contest: contestId })
    .populate(teamPopulate)
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

// =====================================================
// logged-in user যেসব team-এর member, সেই team submissions দেখাবে
// =====================================================
export const getMySubmissions = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    members: req.user._id,
  }).select("_id");

  const teamIds = teams.map((team) => team._id);

  const submissions = await Submission.find({
    team: { $in: teamIds },
  })
    .populate("contest", "title status startDate deadline")
    .populate(teamPopulate)
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "My submissions fetched successfully",
    totalSubmissions: submissions.length,
    submissions,
  });
});

// =====================================================
// admin submission evaluate করবে
// =====================================================
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
    .populate(teamPopulate)
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

// =====================================================
// UNIQUE PARTICIPANT COUNT
// submission দেওয়া unique user count বের করবে
// =====================================================
export const getAllContestParticipantCount = asyncHandler(async (req, res) => {
  const submissions = await Submission.find({})
    .populate("team", "members")
    .select("team");

  const uniqueUsers = new Set();

  submissions.forEach((submission) => {
    const members = submission.team?.members || [];
    members.forEach((memberId) => uniqueUsers.add(memberId.toString()));
  });

  return res.status(200).json({
    success: true,
    message: "All contest unique participant count fetched successfully",
    totalUsers: uniqueUsers.size,
  });
});

// =====================================================
// HOW MANY CONTESTS CURRENT USER SUBMITTED IN
// =====================================================
export const getMyJoinedContestCount = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    members: req.user._id,
  }).select("_id");

  const teamIds = teams.map((team) => team._id);

  const contests = await Submission.distinct("contest", {
    team: { $in: teamIds },
  });

  return res.status(200).json({
    success: true,
    message: "My joined contest count fetched successfully",
    userId: req.user._id,
    totalContests: contests.length,
  });
});

// =====================================================
// TOTAL SUBMITTED CONTESTS WITH DETAILS
// =====================================================
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
        .populate(teamPopulate);

      const uniqueStudentsMap = new Map();
      const evaluatedStudentsMap = new Map();

      const evaluatedSubmissions = submissions.filter(
        (item) => item.status === "evaluated"
      );

      const pendingSubmissions = submissions.filter(
        (item) => item.status !== "evaluated"
      );

      const submissionDetails = submissions.map((item) => {
        const teamMembers = item.team?.members || [];

        teamMembers.forEach((member) => {
          const memberId = member?._id || member;
          uniqueStudentsMap.set(memberId.toString(), memberId.toString());

          if (item.status === "evaluated") {
            evaluatedStudentsMap.set(memberId.toString(), memberId.toString());
          }
        });

        return formatSubmissionDetails(item);
      });

      const evaluatedSubmissionDetails = evaluatedSubmissions.map((item) =>
        formatSubmissionDetails(item)
      );

      return {
        ...contest.toObject(),
        totalSubmissions: submissions.length,
        totalSubmittedStudents: uniqueStudentsMap.size,
        totalEvaluatedSubmissions: evaluatedSubmissions.length,
        totalPendingSubmissions: pendingSubmissions.length,
        totalEvaluatedStudents: evaluatedStudentsMap.size,
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

// =====================================================
// CONTEST SUBMISSION SUMMARY
// contest-wise submission summary
// =====================================================
export const getContestSubmissionSummary = asyncHandler(async (req, res) => {
  await Contest.syncStatuses();

  const submissions = await Submission.find({})
    .populate("team", "members")
    .populate("contest", "title status startDate deadline");

  const contestMap = new Map();

  submissions.forEach((submission) => {
    const contest = submission.contest;
    if (!contest) return;

    const key = contest._id.toString();

    if (!contestMap.has(key)) {
      contestMap.set(key, {
        contestId: contest._id,
        title: contest.title,
        status: contest.status,
        startDate: contest.startDate,
        deadline: contest.deadline,
        totalSubmissions: 0,
        uniqueStudents: new Set(),
        totalEvaluatedSubmissions: 0,
        evaluatedStudents: new Set(),
      });
    }

    const entry = contestMap.get(key);

    entry.totalSubmissions += 1;

    const members = submission.team?.members || [];
    members.forEach((memberId) => {
      entry.uniqueStudents.add(memberId.toString());

      if (submission.status === "evaluated") {
        entry.evaluatedStudents.add(memberId.toString());
      }
    });

    if (submission.status === "evaluated") {
      entry.totalEvaluatedSubmissions += 1;
    }
  });

  const summary = Array.from(contestMap.values())
    .map((item) => ({
      contestId: item.contestId,
      title: item.title,
      status: item.status,
      startDate: item.startDate,
      deadline: item.deadline,
      totalSubmissions: item.totalSubmissions,
      totalStudentsSubmitted: item.uniqueStudents.size,
      totalEvaluatedSubmissions: item.totalEvaluatedSubmissions,
      totalPendingSubmissions:
        item.totalSubmissions - item.totalEvaluatedSubmissions,
      totalEvaluatedStudents: item.evaluatedStudents.size,
    }))
    .sort((a, b) => b.totalSubmissions - a.totalSubmissions);

  return res.status(200).json({
    success: true,
    message: "Contest submission summary fetched successfully",
    totalSubmittedContests: summary.length,
    summary,
  });
});

// =====================================================
// SINGLE CONTEST SUBMISSION REPORT
// =====================================================
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
    .populate(teamPopulate)
    .sort({ createdAt: -1 });

  const uniqueStudentIds = new Set();
  const evaluatedStudentIds = new Set();

  const evaluatedSubmissions = submissions.filter(
    (item) => item.status === "evaluated"
  );

  const pendingSubmissions = submissions.filter(
    (item) => item.status !== "evaluated"
  );

  submissions.forEach((item) => {
    const members = item.team?.members || [];
    members.forEach((member) => {
      const memberId = member?._id || member;
      uniqueStudentIds.add(memberId.toString());
    });
  });

  evaluatedSubmissions.forEach((item) => {
    const members = item.team?.members || [];
    members.forEach((member) => {
      const memberId = member?._id || member;
      evaluatedStudentIds.add(memberId.toString());
    });
  });

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
      totalStudentsSubmitted: uniqueStudentIds.size,
      totalEvaluatedSubmissions: evaluatedSubmissions.length,
      totalPendingSubmissions: pendingSubmissions.length,
      totalEvaluatedStudents: evaluatedStudentIds.size,
    },
    submissionDetails: submissions.map((item) => formatSubmissionDetails(item)),
    evaluatedSubmissionDetails: evaluatedSubmissions.map((item) =>
      formatSubmissionDetails(item)
    ),
  });
});

// =====================================================
// GET EVALUATED USERS BY CONTEST
// evaluated submission-এর unique user/member list
// =====================================================
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
  }).populate(teamPopulate);

  const uniqueUsersMap = new Map();

  submissions.forEach((item) => {
    const members = item.team?.members || [];

    members.forEach((member) => {
      const memberId = member?._id || member;

      uniqueUsersMap.set(memberId.toString(), {
        userId: memberId,
        user: member || null,
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
    });
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

// =====================================================
// DECLARE WINNER
// deadline-এর পরে evaluated submission থেকে winner declare করবে
// =====================================================
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

  if (now < deadline) {
    return res.status(400).json({
      success: false,
      message: "Winner can be declared only after contest deadline.",
    });
  }

  if (contest.isClosed) {
    const alreadyClosedContest = await Contest.findById(contestId).populate(
      winnerPopulate
    );

    return res.status(200).json({
      success: true,
      message: "Winner already declared for this contest",
      contestId: alreadyClosedContest._id,
      contestTitle: alreadyClosedContest.title,
      winner: alreadyClosedContest.winner,
    });
  }

  const submissions = await Submission.find({ contest: contestId })
    .populate(teamPopulate)
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
      message:
        "No evaluated submissions found. Evaluate submissions before declaring a winner.",
    });
  }

  const pendingSubmissions = submissions.filter(
    (submission) => submission.status !== "evaluated"
  );

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

  const updatedContest = await Contest.findById(contestId).populate(
    winnerPopulate
  );

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

// =====================================================
// GET ALL WINNERS
// =====================================================
export const getAllWinners = asyncHandler(async (req, res) => {
  const contests = await Contest.find({
    winner: { $exists: true, $ne: null },
  })
    .populate(winnerPopulate)
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

// =====================================================
// UPDATE WINNER
// contest winner submission manually change করা যাবে
// =====================================================
export const updateWinner = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const winnerSubmissionId =
    req.body.winnerSubmissionId || req.body.submissionId || req.body.winnerId;

  if (!isValidObjectId(contestId) || !isValidObjectId(winnerSubmissionId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contestId and winner submission id are required",
    });
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const winnerSubmission = await Submission.findOne({
    _id: winnerSubmissionId,
    contest: contestId,
    status: "evaluated",
  }).populate(teamPopulate);

  if (!winnerSubmission) {
    return res.status(404).json({
      success: false,
      message: "Evaluated submission not found for this contest",
    });
  }

  contest.winner = winnerSubmission._id;
  contest.isClosed = true;
  contest.status = "completed";
  await contest.save();

  const updatedContest = await Contest.findById(contestId).populate(
    winnerPopulate
  );

  return res.status(200).json({
    success: true,
    message: "Winner updated successfully",
    contestId: updatedContest._id,
    contestTitle: updatedContest.title,
    winner: updatedContest.winner,
  });
});

// =====================================================
// DELETE WINNER
// winner remove করবে
// =====================================================
export const deleteWinner = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contestId is required",
    });
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  if (!contest.winner) {
    return res.status(400).json({
      success: false,
      message: "No winner declared for this contest",
    });
  }

  contest.winner = null;
  contest.isClosed = false;
  contest.status = getContestStatus(contest);
  await contest.save();

  return res.status(200).json({
    success: true,
    message: "Winner deleted successfully",
    contestId: contest._id,
    contestTitle: contest.title,
  });
});

// =====================================================
// UPDATE WINNER DETAILS
// winner submission / team info update করবে
// =====================================================
export const updateWinnerDetails = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const { teamName, githubLink, liveUrl, totalScore, remarks } = req.body;

  if (!isValidObjectId(contestId)) {
    return res.status(400).json({
      success: false,
      message: "Valid contestId is required",
    });
  }

  const contest = await Contest.findById(contestId);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  if (!contest.winner) {
    return res.status(400).json({
      success: false,
      message: "No winner declared for this contest",
    });
  }

  const winnerSubmission = await Submission.findById(contest.winner).populate({
    path: "team",
    select: "teamName contest members leader",
    populate: [
      { path: "members", select: "name email phoneNumber gender" },
      { path: "leader", select: "name email phoneNumber gender" },
    ],
  });

  if (!winnerSubmission) {
    return res.status(404).json({
      success: false,
      message: "Winner submission not found",
    });
  }

  if (teamName !== undefined) {
    if (!winnerSubmission.team) {
      return res.status(400).json({
        success: false,
        message: "Winner submission has no team",
      });
    }

    const normalizedTeamName = teamName.trim();

    if (!normalizedTeamName) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    const existingTeam = await Team.findOne({
      contest: contestId,
      teamName: normalizedTeamName,
      _id: { $ne: winnerSubmission.team._id },
    }).select("_id");

    if (existingTeam) {
      return res.status(400).json({
        success: false,
        message: "Team name is already taken for this contest",
      });
    }

    winnerSubmission.team.teamName = normalizedTeamName;
    await winnerSubmission.team.save();
  }

  if (githubLink !== undefined) {
    const normalizedGithubLink = githubLink.trim();

    if (!normalizedGithubLink) {
      return res.status(400).json({
        success: false,
        message: "GitHub link is required",
      });
    }

    winnerSubmission.githubLink = normalizedGithubLink;
  }

  if (liveUrl !== undefined) {
    winnerSubmission.liveUrl = liveUrl?.trim() || "";
  }

  if (totalScore !== undefined) {
    const normalizedScore = normalizeScore(totalScore);

    if (normalizedScore === null) {
      return res.status(400).json({
        success: false,
        message: "A valid totalScore greater than or equal to 0 is required",
      });
    }

    winnerSubmission.totalScore = normalizedScore;
  }

  if (remarks !== undefined) {
    if (typeof remarks !== "string") {
      return res.status(400).json({
        success: false,
        message: "Remarks must be a string",
      });
    }

    winnerSubmission.remarks = remarks.trim();
  }

  winnerSubmission.status = "evaluated";
  await winnerSubmission.save();

  const updatedContest = await Contest.findById(contestId).populate(
    winnerPopulate
  );

  return res.status(200).json({
    success: true,
    message: "Winner details updated successfully",
    contestId: updatedContest._id,
    contestTitle: updatedContest.title,
    winner: updatedContest.winner,
  });
});

// =====================================================
// UPDATE EVALUATION
// evaluated submission-এর score/remarks update করবে
// =====================================================
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
    .populate(teamPopulate)
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

// =====================================================
// DELETE EVALUATION
// evaluation reset/delete করবে
// =====================================================
export const deleteEvaluation = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findById(id)
    .populate(teamPopulate)
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

// =====================================================
// UPDATE SUBMISSION
// submission links update করবে
// =====================================================
export const updateSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;
  const { githubLink, liveUrl } = req.body;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findById(id)
    .populate("contest", "title startDate deadline isClosed")
    .populate(teamPopulate);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  const canManage = await canManageSubmission({
    submission,
    user: req.user,
  });

  if (!canManage) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to update this submission",
    });
  }

  if (submission.contest?.isClosed) {
    return res.status(400).json({
      success: false,
      message: "Winner already declared. Submission cannot be updated.",
    });
  }

  if (req.user.role !== "admin" && !isContestActive(submission.contest)) {
    return res.status(400).json({
      success: false,
      message: "Submission can only be updated while the contest is active",
    });
  }

  if (submission.status === "evaluated" && req.user.role !== "admin") {
    return res.status(400).json({
      success: false,
      message: "Evaluated submission cannot be updated",
    });
  }

  const nextGithubLink =
    githubLink !== undefined ? githubLink.trim() : submission.githubLink;

  const nextLiveUrl =
    liveUrl !== undefined ? liveUrl?.trim() || "" : submission.liveUrl || "";

  if (!nextGithubLink) {
    return res.status(400).json({
      success: false,
      message: "GitHub link is required",
    });
  }

  const linksChanged =
    nextGithubLink !== (submission.githubLink || "") ||
    nextLiveUrl !== (submission.liveUrl || "");

  submission.githubLink = nextGithubLink;
  submission.liveUrl = nextLiveUrl;

  const shouldResetEvaluation =
    req.user.role === "admin" &&
    submission.status === "evaluated" &&
    linksChanged;

  if (shouldResetEvaluation) {
    submission.totalScore = 0;
    submission.remarks = "";
    submission.status = "pending";
  }

  await submission.save();
  await submission.populate("contest", "title");

  return res.status(200).json({
    success: true,
    message: shouldResetEvaluation
      ? "Submission updated successfully and evaluation reset to pending"
      : "Submission updated successfully",
    submission,
  });
});

// =====================================================
// DELETE SUBMISSION
// submission delete করবে
// =====================================================
export const deleteSubmission = asyncHandler(async (req, res) => {
  const { id } = req.params;

  if (!isValidObjectId(id)) {
    return res.status(400).json({
      success: false,
      message: "Invalid submission id",
    });
  }

  const submission = await Submission.findById(id)
    .populate("contest", "title startDate deadline isClosed")
    .populate(teamPopulate);

  if (!submission) {
    return res.status(404).json({
      success: false,
      message: "Submission not found",
    });
  }

  const canManage = await canManageSubmission({
    submission,
    user: req.user,
  });

  if (!canManage) {
    return res.status(403).json({
      success: false,
      message: "You are not allowed to delete this submission",
    });
  }

  if (submission.contest?.isClosed) {
    return res.status(400).json({
      success: false,
      message: "Winner already declared. Submission cannot be deleted.",
    });
  }

  if (req.user.role !== "admin" && !isContestActive(submission.contest)) {
    return res.status(400).json({
      success: false,
      message: "Submission can only be deleted while the contest is active",
    });
  }

  const contestId = submission.contest?._id || submission.contest;
  const teamId = submission.team?._id || submission.team;

  await Participation.updateOne(
    {
      contest: contestId,
      team: teamId,
    },
    {
      $set: { status: "pending" },
    }
  );

  await submission.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Submission deleted successfully",
    submissionId: id,
    contestId,
  });
});