

import crypto from "crypto";
import asyncHandler from "../middleware/asyncHandler.js";
import { Team } from "../models/team.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { User } from "../models/user.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Participation } from "../models/participation.model.js";
import { Submission } from "../models/submission.model.js";
import ErrorHandler from "../utils/ErrorHandler.js";


// CREATE TEAM

export const teamCreate = asyncHandler(async (req, res, next) => {
  const { teamName, contest, teamType } = req.body;

  if (!teamName || !contest || !teamType) {
    return next(new ErrorHandler("Team name, contest and teamType are required", 400));
  }

  if (!["solo", "team"].includes(teamType)) {
    return next(new ErrorHandler("teamType must be solo or team", 400));
  }

  const contestDoc = await Contest.findById(contest);

  if (!contestDoc) {
    return next(new ErrorHandler("Contest not found", 404));
  }

  const contestStatus = getContestStatus(contestDoc);

  if (contestStatus === "completed") {
    return next(new ErrorHandler("Contest deadline passed", 400));
  }

  // participationType validation

  if (contestDoc.participationType === "solo" && teamType !== "solo") {
    return next(new ErrorHandler("Only solo allowed in this contest", 400));
  }


  if (contestDoc.participationType === "team" && teamType !== "team") {
    return next(new ErrorHandler("Only team allowed in this contest", 400));
  }


  if (
    contestDoc.participationType !== "solo" &&
    contestDoc.participationType !== "team" &&
    contestDoc.participationType !== "both"
  ) {
    return next(new ErrorHandler("Invalid contest participation type", 400));
  }

  const trimmedTeamName = teamName.trim();

  if (!trimmedTeamName) {
    return next(new ErrorHandler("Team name required", 400));
  }

  
  const alreadyJoined = await Team.findOne({
    contest,
    members: req.user._id,
  });

  if (alreadyJoined) {
    return next(new ErrorHandler("You already joined this contest", 400));
  }


  const existingTeamName = await Team.findOne({
    contest,
    teamName: trimmedTeamName,
  });

  if (existingTeamName) {
    return next(new ErrorHandler("Team name already exists", 400));
  }

  const members = [req.user._id];


  const team = await Team.create({
    teamName: trimmedTeamName,
    leader: req.user._id,
    members,
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
      },
    },
    {
      upsert: true,
      new: true,
      runValidators: true,
      setDefaultsOnInsert: true,
    }
  );

  const populatedTeam = await Team.findById(team._id)
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate(
      "contest",
      "title participationType maxTeamSize startDate deadline"
    );

  return res.status(201).json({
    success: true,
    message: teamType === "solo"
        ? "Solo team created and joined successfully"
        : "Team created successfully",
    team: populatedTeam,
  });
});

// INVITE MEMBER

export const inviteMember = asyncHandler(async (req, res, next) => {
  const { userId } = req.body;

  if (!userId) {
    return next(new ErrorHandler("User id required", 400));
  }

  const team = await Team.findById(req.params.id).populate("contest");

  if (!team) {
    return next(new ErrorHandler("Team not found", 404));
  }

  if (team.teamType === "solo") {
    return next(new ErrorHandler("Solo team cannot invite members", 400));
  }

  // only leader can invite
  if (team.leader.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only team leader can invite members", 403));
  }

  if (userId.toString() === req.user._id.toString()) {
    return next(new ErrorHandler("You cannot invite yourself", 400));
  }

  const contestStatus = getContestStatus(team.contest);

  if (contestStatus === "completed") {
    return next(new ErrorHandler("Contest deadline passed", 400));
  }

  const user = await User.findById(userId);

  if (!user) {
    return next(new ErrorHandler("User not found", 404));
  }

  const alreadyMember = team.members.some(
    (member) => member.toString() === user._id.toString()
  );

  if (alreadyMember) {
    return next(new ErrorHandler("User already in team", 400));
  }

  const alreadyJoined = await Team.findOne({
    contest: team.contest._id,
    members: user._id,
  });

  if (alreadyJoined) {
    return next(new ErrorHandler("User already in another team in this contest", 400));
  }

  const existingInvite = await Invitation.findOne({
    team: team._id,
    invitedUser: user._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  if (existingInvite) {
    return next(new ErrorHandler("Invitation already sent", 400));
  }

  const pendingInvites = await Invitation.countDocuments({
    team: team._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  const maxTeamSize = team.contest.maxTeamSize || 1;

  if (team.members.length + pendingInvites >= maxTeamSize) {
    return next(new ErrorHandler(`Team is full (max ${maxTeamSize} members)`, 400));
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

export const confirmInvitation = asyncHandler(async (req, res, next) => {
  const token = req.body.token || req.params.token;

  if (!token) {
    return next(new ErrorHandler("Token required", 400));
  }

  const invitation = await Invitation.findOne({
    token,
    status: "pending",
  });

  if (!invitation) {
    return next(new ErrorHandler("Invalid token", 400));
  }

  if (invitation.tokenExpiry < new Date()) {
    invitation.status = "expired";
    await invitation.save();

    return next(new ErrorHandler("Invitation expired", 400));
  }

  // only invited user can accept
  if (invitation.invitedUser.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("This invitation is not for you", 403));
  }

  const team = await Team.findById(invitation.team).populate("contest");

  if (!team) {
    return next(new ErrorHandler("Team not found", 404));
  }

  const contestStatus = getContestStatus(team.contest);

  if (contestStatus === "completed") {
    return next(new ErrorHandler("Contest deadline passed", 400));
  }

  const alreadyJoined = await Team.findOne({
    contest: team.contest._id,
    members: req.user._id,
  });

  if (alreadyJoined) {
    return next(new ErrorHandler("You already joined this contest", 400));
  }

  const maxTeamSize = team.contest.maxTeamSize || 1;

  if (team.members.length >= maxTeamSize) {
    return next(new ErrorHandler(`Team is full (max ${maxTeamSize} members)`, 400));
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
export const getMyInvitations = asyncHandler(async (req, res, next) => {
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
    message: "Invitations fetched successfully",
    count: invitations.length,
    invitations,
  });
});

// =====================================================
// GET MY TEAMS
// =====================================================
export const getMyTeams = asyncHandler(async (req, res, next) => {
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
    message: "Teams fetched successfully",
    teams,
  });
});

// =====================================================
// GET TEAMS BY CONTEST
// =====================================================
export const getTeamsByContest = asyncHandler(async (req, res, next) => {
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
    message: "Contest teams fetched successfully",
    teams,
  });
});

// =====================================================
// UPDATE TEAM
// only leader can update team name
// =====================================================
export const updateTeam = asyncHandler(async (req, res, next) => {
  const { teamName } = req.body;

  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new ErrorHandler("Team not found", 404));
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only leader can update team", 403));
  }

  const contestDoc = await Contest.findById(team.contest);

  if (contestDoc && getContestStatus(contestDoc) === "completed") {
    return next(new ErrorHandler("Completed contest team cannot be updated", 400));
  }

  if (teamName !== undefined) {
    const trimmedName = teamName.trim();

    if (!trimmedName) {
      return next(new ErrorHandler("Team name is required", 400));
    }

    const existingTeamName = await Team.findOne({
      _id: { $ne: team._id },
      contest: team.contest,
      teamName: trimmedName,
    });

    if (existingTeamName) {
      return next(new ErrorHandler("Team name already exists in this contest", 400));
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
export const deleteTeam = asyncHandler(async (req, res, next) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return next(new ErrorHandler("Team not found", 404));
  }

  if (team.leader.toString() !== req.user._id.toString()) {
    return next(new ErrorHandler("Only leader can delete", 403));
  }

  const submissionExists = await Submission.findOne({ team: team._id });

  if (submissionExists) {
    return next(new ErrorHandler("Submitted team cannot be deleted", 400));
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
