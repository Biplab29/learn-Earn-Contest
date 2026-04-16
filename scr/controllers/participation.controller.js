



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