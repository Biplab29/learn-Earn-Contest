

import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { Team } from "../models/team.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Participation } from "../models/participation.model.js";
import { Submission } from "../models/submission.model.js";


// CREATE TEAM

import mongoose from "mongoose";


export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, contest, teamType } = req.body;

  if (!teamName || !contest || !teamType) {
    return res.status(400).json({
      success: false,
      message: "Team name, contest and teamType are required",
    });
  }

  if (!mongoose.Types.ObjectId.isValid(contest)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contest id",
    });
  }

  if (!["solo", "team"].includes(teamType)) {
    return res.status(400).json({
      success: false,
      message: "teamType must be solo or team",
    });
  }

  const trimmedTeamName = teamName.trim();

  if (!trimmedTeamName) {
    return res.status(400).json({
      success: false,
      message: "Team name required",
    });
  }

  const contestDoc = await Contest.findById(contest);

  if (!contestDoc) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const contestStatus = getContestStatus(contestDoc);

  if (contestStatus === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline passed",
    });
  }

  if (!["solo", "team", "both"].includes(contestDoc.participationType)) {
    return res.status(400).json({
      success: false,
      message: "Invalid contest participation type",
    });
  }

  if (contestDoc.participationType === "solo" && teamType !== "solo") {
    return res.status(400).json({
      success: false,
      message: "Only solo allowed in this contest",
    });
  }

  if (contestDoc.participationType === "team" && teamType !== "team") {
    return res.status(400).json({
      success: false,
      message: "Only team allowed in this contest",
    });
  }

  if (teamType === "solo" && contestDoc.maxTeamSize && contestDoc.maxTeamSize < 1) {
    return res.status(400).json({
      success: false,
      message: "Invalid team size for this contest",
    });
  }

  if (teamType === "team" && contestDoc.maxTeamSize && contestDoc.maxTeamSize < 2) {
    return res.status(400).json({
      success: false,
      message: "Team contest must allow at least 2 members",
    });
  }

  const alreadyJoined = await Team.findOne({
    contest,
    members: req.user._id,
  });

  if (alreadyJoined) {
    return res.status(400).json({
      success: false,
      message: "You already joined this contest",
    });
  }

  const existingTeamName = await Team.findOne({
    contest,
    teamName: { $regex: `^${trimmedTeamName}$`, $options: "i" },
  });

  if (existingTeamName) {
    return res.status(400).json({
      success: false,
      message: "Team name already exists",
    });
  }

  let team;

  try {
    team = await Team.create({
      teamName: trimmedTeamName,
      leader: req.user._id,
      members: [req.user._id],
      contest,
      teamType,
    });

    await Participation.findOneAndUpdate(
      {
        contest,
        team: team._id,
      },
      {
        $setOnInsert: {
          contest,
          team: team._id,
          status: "pending",
        },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      }
    );
  } catch (error) {
    if (team?._id) {
      await Team.findByIdAndDelete(team._id);
    }

    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        message: "You already joined this contest or team name already exists",
      });
    }

    throw error;
  }

  const populatedTeam = await Team.findById(team._id)
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title participationType maxTeamSize startDate deadline");

  return res.status(201).json({
    success: true,
    message:
      teamType === "solo"
        ? "Solo team created and joined successfully"
        : "Team created successfully",
    team: populatedTeam,
  });
});

// INVITE MEMBER

export const inviteMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User id required",
    });
  }

  const team = await Team.findById(req.params.id).populate("contest");

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.teamType === "solo") {
    return res.status(400).json({
      success: false,
      message: "Solo team cannot invite members",
    });
  }

  // only leader can invite
  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only team leader can invite members",
    });
  }

  if (userId.toString() === req.user._id.toString()) {
    return res.status(400).json({
      success: false,
      message: "You cannot invite yourself",
    });
  }

  const contestStatus = getContestStatus(team.contest);

  if (contestStatus === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline passed",
    });
  }

  const user = await User.findById(userId);

  if (!user) {
    return res.status(404).json({
      success: false,
      message: "User not found",
    });
  }

  const alreadyMember = team.members.some(
    (member) => member.toString() === user._id.toString()
  );

  if (alreadyMember) {
    return res.status(400).json({
      success: false,
      message: "User already in team",
    });
  }

  const alreadyJoined = await Team.findOne({
    contest: team.contest._id,
    members: user._id,
  });

  if (alreadyJoined) {
    return res.status(400).json({
      success: false,
      message: "User already in another team in this contest",
    });
  }

  const existingInvite = await Invitation.findOne({
    team: team._id,
    invitedUser: user._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  if (existingInvite) {
    return res.status(400).json({
      success: false,
      message: "Invitation already sent",
    });
  }

  const pendingInvites = await Invitation.countDocuments({
    team: team._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  const maxTeamSize = team.contest.maxTeamSize || 1;

  if (team.members.length + pendingInvites >= maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full (max ${maxTeamSize} members)`,
    });
  }

  const token = crypto.randomBytes(32).toString("hex");

  const invitation = await Invitation.create({
    invitedUser: user._id,
    team: team._id,
    invitedBy: req.user._id,
    token,
    tokenExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
    status: "pending",
  });

  const populatedInvitation = await Invitation.findById(invitation._id)
    .populate("invitedUser", "name email")
    .populate("invitedBy", "name email")
    .populate({
      path: "team",
      select: "teamName teamType contest leader members",
      populate: [
        { path: "leader", select: "name email" },
        { path: "members", select: "name email" },
        {
          path: "contest",
          select: "title startDate deadline participationType maxTeamSize",
        },
      ],
    });

  return res.status(200).json({
    success: true,
    message: "Invitation sent successfully",
    invitation: populatedInvitation,
  });
});

// CONFIRM INVITATION

export const confirmInvitation = asyncHandler(async (req, res) => {
  const token = req.body.token || req.params.token;

  if (!token) {
    return res.status(400).json({
      success: false,
      message: "Token required",
    });
  }

  const invitation = await Invitation.findOne({
    token,
    status: "pending",
  });

  if (!invitation) {
    return res.status(400).json({
      success: false,
      message: "Invalid token",
    });
  }

  if (invitation.tokenExpiry < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    return res.status(400).json({
      success: false,
      message: "Invitation expired",
    });
  }

  // only invited user can accept
  if (invitation.invitedUser.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "This invitation is not for you",
    });
  }

  const team = await Team.findById(invitation.team).populate("contest");

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  const contestStatus = getContestStatus(team.contest);

  if (contestStatus === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline passed",
    });
  }

  const alreadyJoined = await Team.findOne({
    contest: team.contest._id,
    members: req.user._id,
  });

  if (alreadyJoined) {
    return res.status(400).json({
      success: false,
      message: "You already joined this contest",
    });
  }

  const maxTeamSize = team.contest.maxTeamSize || 1;

  if (team.members.length >= maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full (max ${maxTeamSize} members)`,
    });
  }

  team.members.push(req.user._id);
  await team.save();

  invitation.status = "accepted";
  await invitation.save();

  // same contest er jonno pending invitation auto reject
  const sameContestTeamIds = await Team.find({
    contest: team.contest._id,
  }).distinct("_id");

  await Invitation.updateMany(
    {
      _id: { $ne: invitation._id },
      team: { $in: sameContestTeamIds },
      invitedUser: req.user._id,
      status: "pending",
    },
    {
      $set: { status: "rejected" },
    }
  );

  const populatedTeam = await Team.findById(team._id)
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate(
      "contest",
      "title startDate deadline participationType maxTeamSize"
    );

  return res.status(200).json({
    success: true,
    message: "Joined team successfully",
    team: populatedTeam,
  });
});

// =====================================================
// GET MY INVITATIONS
// =====================================================
export const getMyInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    invitedUser: req.user._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  })
    .populate({
      path: "team",
      select: "teamName teamType contest leader members",
      populate: [
        { path: "leader", select: "name email" },
        { path: "members", select: "name email" },
        {
          path: "contest",
          select: "title startDate deadline participationType maxTeamSize",
        },
      ],
    })
    .populate("invitedUser", "name email")
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    count: invitations.length,
    invitations,
  });
});

// =====================================================
// GET MY TEAMS
// =====================================================
export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    members: req.user._id,
  })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate(
      "contest",
      "title startDate deadline participationType maxTeamSize"
    );

  return res.status(200).json({
    success: true,
    teams,
  });
});

// =====================================================
// GET TEAMS BY CONTEST
// =====================================================
export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    contest: req.params.contestId,
  })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate(
      "contest",
      "title startDate deadline participationType maxTeamSize"
    );

  return res.status(200).json({
    success: true,
    teams,
  });
});

// =====================================================
// UPDATE TEAM
// only leader can update team name
// =====================================================
export const updateTeam = asyncHandler(async (req, res) => {
  const { teamName } = req.body;

  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only leader can update team",
    });
  }

  const contestDoc = await Contest.findById(team.contest);

  if (contestDoc && getContestStatus(contestDoc) === "completed") {
    return res.status(400).json({
      success: false,
      message: "Completed contest team cannot be updated",
    });
  }

  if (teamName !== undefined) {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      return res.status(400).json({
        success: false,
        message: "Team name is required",
      });
    }

    const existingTeamName = await Team.findOne({
      _id: { $ne: team._id },
      contest: team.contest,
      teamName: trimmedName,
    });

    if (existingTeamName) {
      return res.status(400).json({
        success: false,
        message: "Team name already exists in this contest",
      });
    }

    team.teamName = trimmedName;
  }

  await team.save();

  const updatedTeam = await Team.findById(team._id)
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate(
      "contest",
      "title startDate deadline participationType maxTeamSize"
    );

  return res.status(200).json({
    success: true,
    message: "Team updated successfully",
    team: updatedTeam,
  });
});

// =====================================================
// DELETE TEAM
// only leader can delete team
// =====================================================
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "Only leader can delete",
    });
  }

  const submissionExists = await Submission.findOne({ team: team._id });

  if (submissionExists) {
    return res.status(400).json({
      success: false,
      message: "Submitted team cannot be deleted",
    });
  }

  await Participation.deleteMany({ team: team._id });
  await Invitation.deleteMany({ team: team._id });
  await team.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Team deleted successfully",
  });
});

console.log("team controller is working");
