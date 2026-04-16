

// import asyncHandler from "../middleware/asyncHandler.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";

// export const joinContestSolo = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;
//   const userId = req.user._id;

//   const contest = await Contest.findById(contestId);
//   if (!contest) {
//     return res.status(404).json({ message: "Contest not found" });
//   }

//   if (getContestStatus(contest) === "completed") {
//     return res.status(400).json({ message: "Contest deadline has passed." });
//   }

//   if (contest.participationType === "team") {
//     return res.status(400).json({
//       message: "This is a team contest. Create a team instead."
//     });
//   }

//   const existingParticipation = await Participation.findOne({
//     user: userId,
//     contest: contestId
//   });

//   if (existingParticipation) {
//     return res.status(400).json({
//       message: `You are already participating in this contest as ${existingParticipation.participationType}`
//     });
//   }

//   const participation = await Participation.create({
//     user: userId,
//     contest: contestId,
//     participationType: "solo"
//   });

//   return res.status(201).json({
//     message: "Joined contest successfully as solo participant",
//     participation
//   });
// });

// export const getMyParticipations = asyncHandler(async (req, res) => {
//   const participations = await Participation.find({ user: req.user._id })
//     .populate("contest", "title startDate deadline status image")
//     .populate({
//       path: "team",
//       select: "teamName members",
//       populate: { path: "members", select: "name email" }
//     })
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     message: "User participations retrieved",
//     count: participations.length,
//     participations
//   });
// });

// export const getContestParticipants = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   const participants = await Participation.find({ contest: contestId })
//     .populate("user", "name email")
//     .populate("team", "teamName");

//   return res.status(200).json({
//     message: "Contest participants retrieved",
//     count: participants.length,
//     participants
//   });
// });

// export const getStudentContestHistory = asyncHandler(async (req, res) => {
//   const studentId = req.user._id;

//   const participations = await Participation.find({ user: studentId })
//     .populate("contest")
//     .populate("team", "teamName members")
//     .sort({ createdAt: -1 });

//   const totalParticipations = participations.length;
//   const completedSubmissions = participations.filter(
//     (p) => p.status === "submitted"
//   ).length;

//   const pendingContests = totalParticipations - completedSubmissions;

//   const history = participations.map((participation) => ({
//     ...participation.toObject(),
//     status: participation.status || "pending"
//   }));

//   return res.status(200).json({
//     message: "Student contest history and submissions retrieved",
//     summary: {
//       totalJoined: totalParticipations,
//       totalSubmitted: completedSubmissions,
//       totalPending: pendingContests
//     },
//     history
//   });
// });



import asyncHandler from "../middleware/asyncHandler.js";
import { Team } from "../models/team.model.js";
import { Participation } from "../models/participation.model.js";


// =====================================================
// GET MY PARTICIPATIONS
// =====================================================
export const getMyParticipations = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    members: req.user._id,
  })
    .populate("contest", "title startDate deadline status image participationType")
    .populate("leader", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });

  const teamIds = teams.map((team) => team._id);

  const participations = await Participation.find({
    team: { $in: teamIds },
  }).sort({ createdAt: -1 });

  const merged = teams.map((team) => {
    const participation = participations.find(
      (p) => p.team.toString() === team._id.toString()
    );

    return {
      team,
      participation: participation || null,
    };
  });

  return res.status(200).json({
    success: true,
    message: "User participations retrieved",
    count: merged.length,
    participations: merged,
  });
});


// =====================================================
// GET CONTEST PARTICIPANTS
// =====================================================
export const getContestParticipants = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const teams = await Team.find({
    contest: contestId,
  })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title");

  const participations = await Participation.find({
    contest: contestId,
  }).populate("team", "teamName teamType");

  const participants = teams.map((team) => {
    const participation = participations.find(
      (p) => p.team?._id?.toString() === team._id.toString()
    );

    return {
      teamId: team._id,
      teamName: team.teamName,
      teamType: team.teamType,
      leader: team.leader,
      members: team.members,
      participationStatus: participation?.status || "not_joined",
    };
  });

  return res.status(200).json({
    success: true,
    message: "Contest participants retrieved",
    count: participants.length,
    participants,
  });
});


// =====================================================
// GET STUDENT CONTEST HISTORY
// =====================================================
export const getStudentContestHistory = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const teams = await Team.find({
    members: studentId,
  })
    .populate("contest")
    .populate("leader", "name email")
    .populate("members", "name email")
    .sort({ createdAt: -1 });

  const teamIds = teams.map((team) => team._id);

  const participations = await Participation.find({
    team: { $in: teamIds },
  });

  const history = teams.map((team) => {
    const participation = participations.find(
      (p) => p.team.toString() === team._id.toString()
    );

    return {
      team,
      participationStatus: participation?.status || "pending",
      
      // ✅ CHANGED HERE: participationType এখন সরাসরি team.teamType থেকে আসবে 
      participationType: team.teamType, 
      
      joinedAt: participation?.createdAt || team.createdAt,
    };
  });

  const totalParticipations = history.length;

  const completedSubmissions = history.filter(
    (item) => item.participationStatus === "submitted"
  ).length;

  const pendingContests = totalParticipations - completedSubmissions;

  return res.status(200).json({
    success: true,
    message: "Student contest history and submissions retrieved",
    summary: {
      totalJoined: totalParticipations,
      totalSubmitted: completedSubmissions,
      totalPending: pendingContests,
    },
    history,
  });
});

console.log("participation controller is working");