
// import mongoose from "mongoose";
// import asyncHandler from "../middleware/asyncHandler.js";
// import crypto from "crypto";
// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";
// import { Invitation } from "../models/invitation.model.js";
// import { Notification } from "../models/notification.model.js";

// const toArray = (value) => {
//   if (Array.isArray(value)) {
//     return value;
//   }

//   if (value == null || value === "") {
//     return [];
//   }

//   return [value];
// };

// const buildPendingInvitationQuery = ({ teamId, userId }) => {
//   return {
//     team: teamId,
//     invitedUser: userId,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   };
// };

// const getInvitationReference = (req) => {
//   const rawReference =
//     req.params.token ||
//     req.params.id ||
//     req.body?.token ||
//     req.body?.invitationToken ||
//     req.body?.invitationId ||
//     req.query?.token ||
//     req.query?.invitationToken ||
//     req.query?.invitationId;

//   return typeof rawReference === "string" ? rawReference.trim() : "";
// };

// const buildInvitationLookup = (reference) => {
//   if (!reference) {
//     return null;
//   }

//   if (mongoose.Types.ObjectId.isValid(reference)) {
//     return {
//       status: "pending",
//       $or: [{ token: reference }, { _id: reference }],
//     };
//   }

//   return {
//     token: reference,
//     status: "pending",
//   };
// };

// const createInvitationNotification = async ({
//   recipientId,
//   invitation,
//   team,
//   contest,
//   invitedBy,
// }) => {
//   if (!recipientId) {
//     return false;
//   }

//   try {
//     await Notification.create({
//       recipient: recipientId,
//       type: "team_invitation",
//       title: `Invitation to join ${team.teamName}`,
//       message: `${
//         invitedBy?.name || invitedBy?.email || "A teammate"
//       } invited you to join ${team.teamName}${
//         contest?.title ? ` for ${contest.title}` : ""
//       }.`,
//       link: `/invite/confirm/${invitation.token}`,
//       data: {
//         invitationId: invitation._id,
//         invitationToken: invitation.token,
//         teamId: team._id,
//         teamName: team.teamName,
//         contestId: contest?._id || team.contest,
//       },
//     });

//     return true;
//   } catch (error) {
//     console.error("Failed to create invitation notification:", error.message);

//     return false;
//   }
// };

// const createInvitationForTarget = async ({
//   target,
//   team,
//   contest,
//   invitedBy,
// }) => {
//   if (!target.user) {
//     return {
//       sent: false,
//       reason: "invalid-target",
//       invitation: null,
//       userId: null,
//       notificationSent: false,
//     };
//   }

//   const existingInvite = await Invitation.findOne(
//     buildPendingInvitationQuery({
//       teamId: team._id,
//       userId: target.user?._id,
//     })
//   );

//   if (existingInvite) {
//     return {
//       sent: false,
//       reason: "already invited",
//       invitation: existingInvite,
//       userId: target.user?._id || null,
//       notificationSent: false,
//     };
//   }

//   const inviteToken = crypto.randomBytes(32).toString("hex");
//   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

//   const invitation = await Invitation.create({
//     invitedUser: target.user._id,
//     team: team._id,
//     invitedBy: invitedBy._id,
//     token: inviteToken,
//     tokenExpiry,
//     status: "pending",
//   });

//   const notificationSent = await createInvitationNotification({
//     recipientId: target.user?._id,
//     invitation,
//     team,
//     contest,
//     invitedBy,
//   });

//   return {
//     sent: true,
//     invitation,
//     userId: target.user?._id || null,
//     notificationSent,
//   };
// };

// // ==========================================
// // CREATE TEAM
// // ==========================================
// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, contest } = req.body;
//   const inviteUserIdsInput =
//     req.body.inviteUserIds ?? req.body.invitedUserIds ?? req.body.userIds ?? [];

//   if (!teamName || !contest) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name and contest are required",
//     });
//   }

//   const contestDoc = await Contest.findById(contest);
//   if (!contestDoc) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   if (contestDoc.participationType === "solo") {
//     return res.status(400).json({
//       success: false,
//       message: "Teams cannot be created for solo-only contests",
//     });
//   }

//   if (getContestStatus(contestDoc) === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline has passed.",
//     });
//   }

//   const normalizedTeamName = teamName.trim();

//   const existingTeamName = await Team.findOne({
//     contest,
//     teamName: normalizedTeamName,
//   });

//   if (existingTeamName) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name is already taken for this contest",
//     });
//   }

//   const existingParticipation = await Participation.findOne({
//     contest,
//     user: req.user._id,
//   });

//   if (existingParticipation) {
//     return res.status(400).json({
//       success: false,
//       message: "You are already participating in this contest",
//     });
//   }

//   const uniqueInviteUserIds = [
//     ...new Set(
//       toArray(inviteUserIdsInput)
//         .map((id) => id?.toString().trim())
//         .filter(Boolean)
//         .filter((id) => id !== req.user._id.toString())
//     ),
//   ];

//   const users = await User.find({
//     _id: { $in: uniqueInviteUserIds },
//   }).select("_id name email");

//   if (users.length !== uniqueInviteUserIds.length) {
//     return res.status(400).json({
//       success: false,
//       message: "One or more selected users do not exist",
//     });
//   }

//   const inviteTargets = users.map((user) => ({
//     user,
//   }));

//   if (inviteTargets.length + 1 > contestDoc.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`,
//     });
//   }

//   const inviteTargetUserIds = inviteTargets
//     .map((target) => target.user?._id)
//     .filter(Boolean);

//   const participatingUsers = await Participation.find({
//     contest,
//     user: { $in: inviteTargetUserIds },
//   }).populate("user", "name email");

//   if (participatingUsers.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: "Some selected users are already participating in this contest",
//     });
//   }

//   const team = await Team.create({
//     teamName: normalizedTeamName,
//     leader: req.user._id,
//     members: [req.user._id],
//     contest,
//     status: "pending",
//   });

//   await Participation.create({
//     user: req.user._id,
//     contest,
//     participationType: "team",
//     team: team._id,
//   });

//   const inviteResults = [];

//   for (const target of inviteTargets) {
//     const inviteResult = await createInvitationForTarget({
//       target,
//       team,
//       contest: contestDoc,
//       invitedBy: req.user,
//     });

//     inviteResults.push({
//       userId: inviteResult.userId,
//       sent: inviteResult.sent,
//       reason: inviteResult.reason || null,
//       invitationId: inviteResult.invitation?._id || null,
//       token: inviteResult.invitation?.token || null,
//       notificationSent: inviteResult.notificationSent || false,
//     });
//   }

//   return res.status(201).json({
//     success: true,
//     message: "Team created successfully",
//     team,
//     invitations: inviteResults,
//   });
// });

// // ==========================================
// // INVITE MEMBER
// // ==========================================
// export const inviteMember = asyncHandler(async (req, res) => {
//   const requestedUserId =
//     req.body.userId ||
//     req.body.invitedUserId ||
//     req.body.inviteUserId ||
//     req.body.memberId;

//   if (!requestedUserId) {
//     return res.status(400).json({
//       success: false,
//       message: "User id is required",
//     });
//   }

//   if (requestedUserId?.toString() === req.user._id.toString()) {
//     return res.status(400).json({
//       success: false,
//       message: "You cannot invite yourself",
//     });
//   }

//   const team = await Team.findById(req.params.id).populate(
//     "contest",
//     "title startDate deadline maxTeamSize participationType"
//   );

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   if (team.status === "rejected") {
//     return res.status(400).json({
//       success: false,
//       message: "This team has been rejected by admin",
//     });
//   }

//   const isMember = team.members.some(
//     (m) => m.toString() === req.user._id.toString()
//   );

//   if (!isMember) {
//     return res.status(403).json({
//       success: false,
//       message: "Only team members can invite users",
//     });
//   }

//   if (getContestStatus(team.contest) === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline has passed.",
//     });
//   }

//   const pendingInvitations = await Invitation.countDocuments({
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   });

//   if (team.members.length + pendingInvitations >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `Team is full (max ${team.contest.maxTeamSize} members)`,
//     });
//   }

//   const invitedUser = await User.findById(requestedUserId).select(
//     "_id name email"
//   );

//   if (!invitedUser) {
//     return res.status(404).json({
//       success: false,
//       message: "Invited user not found",
//     });
//   }

//   const inviteTarget = {
//     user: invitedUser,
//   };

//   const alreadyMember = inviteTarget.user
//     ? team.members.some(
//         (member) => member.toString() === inviteTarget.user._id.toString()
//       )
//     : false;

//   if (alreadyMember) {
//     return res.status(400).json({
//       success: false,
//       message: "This user is already a member of the team",
//     });
//   }

//   const alreadyParticipating = inviteTarget.user
//     ? await Participation.findOne({
//         contest: team.contest._id,
//         user: inviteTarget.user._id,
//       })
//     : null;

//   if (inviteTarget.user && alreadyParticipating) {
//     return res.status(400).json({
//       success: false,
//       message: "This user is already participating in this contest",
//     });
//   }

//   const existingInvite = await Invitation.findOne(
//     buildPendingInvitationQuery({
//       teamId: team._id,
//       userId: inviteTarget.user._id,
//     })
//   );

//   if (existingInvite) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation already sent to this user",
//     });
//   }

//   const inviteResult = await createInvitationForTarget({
//     target: inviteTarget,
//     team,
//     contest: team.contest,
//     invitedBy: req.user,
//   });

//   return res.status(200).json({
//     success: true,
//     message: "Invitation created successfully",
//     invitation: inviteResult.invitation,
//     notificationSent: inviteResult.notificationSent || false,
//   });
// });

// // ==========================================
// // CONFIRM INVITATION
// // ==========================================
// export const confirmInvitation = asyncHandler(async (req, res) => {
//   const invitationReference = getInvitationReference(req);

//   if (!invitationReference) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation token or id is required",
//     });
//   }

//   const invitation = await Invitation.findOne(
//     buildInvitationLookup(invitationReference)
//   );

//   if (!invitation) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid or already used invitation token",
//     });
//   }

//   if (invitation.tokenExpiry < new Date()) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation link has expired",
//     });
//   }

//   if (invitation.invitedUser.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       success: false,
//       message: "This invitation is not for you",
//     });
//   }

//   const team = await Team.findById(invitation.team).populate(
//     "contest",
//     "title startDate deadline maxTeamSize"
//   );

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team no longer exists",
//     });
//   }

//   if (team.status === "rejected") {
//     return res.status(400).json({
//       success: false,
//       message: "This team has been rejected by admin",
//     });
//   }

//   if (getContestStatus(team.contest) === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline has passed.",
//     });
//   }

//   if (team.members.length >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `Team is already full (max ${team.contest.maxTeamSize} members)`,
//     });
//   }

//   const alreadyMember = team.members.some(
//     (m) => m.toString() === req.user._id.toString()
//   );

//   if (alreadyMember) {
//     return res.status(400).json({
//       success: false,
//       message: "You are already a member of this team",
//     });
//   }

//   const alreadyParticipating = await Participation.findOne({
//     contest: team.contest._id,
//     user: req.user._id,
//   });

//   if (alreadyParticipating) {
//     return res.status(400).json({
//       success: false,
//       message: "You are already participating in this contest",
//     });
//   }

//   team.members.push(req.user._id);
//   await team.save();

//   await Participation.create({
//     user: req.user._id,
//     contest: team.contest._id,
//     participationType: "team",
//     team: team._id,
//   });

//   invitation.status = "accepted";
//   await invitation.save();

//   await Invitation.updateMany(
//     {
//       _id: { $ne: invitation._id },
//       team: team._id,
//       status: "pending",
//       invitedUser: req.user._id,
//     },
//     {
//       $set: {
//         status: "rejected",
//       },
//     }
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Invitation accepted successfully",
//     team,
//   });
// });

// // ==========================================
// // GET MY INVITATIONS
// // ==========================================
// export const getMyInvitations = asyncHandler(async (req, res) => {
//   const invitations = await Invitation.find({
//     invitedUser: req.user._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   })
//     .populate({
//       path: "team",
//       select: "teamName status members contest leader",
//       populate: [
//         { path: "members", select: "name email" },
//         { path: "contest", select: "title startDate deadline" },
//         { path: "leader", select: "name email" },
//       ],
//     })
//     .populate("invitedUser", "name email")
//     .populate("invitedBy", "name email")
//     .sort({ createdAt: -1 });

//   const normalizedInvitations = invitations.map((invitation) => {
//     const invitationObject = invitation.toObject();

//     return {
//       ...invitationObject,
//       acceptToken: invitationObject.token,
//     };
//   });

//   return res.status(200).json({
//     success: true,
//     message: "My pending invitations",
//     count: normalizedInvitations.length,
//     invitations: normalizedInvitations,
//   });
// });

// // ==========================================
// // GET MY TEAMS
// // ==========================================
// export const getMyTeams = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ members: req.user._id })
//     .populate("leader", "name email")
//     .populate("members", "name email")
//     .populate("contest", "title startDate deadline status");

//   return res.status(200).json({
//     success: true,
//     message: "My teams",
//     teams,
//   });
// });

// // ==========================================
// // GET TEAMS BY CONTEST
// // ==========================================
// export const getTeamsByContest = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ contest: req.params.contestId })
//     .populate("leader", "name email")
//     .populate("members", "name email")
//     .populate("contest", "title startDate deadline");

//   return res.status(200).json({
//     success: true,
//     message: "Teams for this contest",
//     teams,
//   });
// });

// // ==========================================
// // DELETE TEAM
// // ==========================================
// export const deleteTeam = asyncHandler(async (req, res) => {
//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       success: false,
//       message: "Only team leader can delete this team",
//     });
//   }

//   await Participation.deleteMany({ team: team._id });
//   await Invitation.deleteMany({ team: team._id });
//   await team.deleteOne();

//   return res.status(200).json({
//     success: true,
//     message: "Team deleted successfully",
//   });
// });

// // ==========================================
// // UPDATE TEAM STATUS
// // ==========================================
// export const updateTeamStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;

//   if (!["pending", "approved", "rejected"].includes(status)) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid status",
//     });
//   }

//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   const previousStatus = team.status;
//   team.status = status;
//   await team.save();

//   if (status === "approved" && previousStatus !== "approved") {
//     const existingParticipations = await Participation.find({
//       contest: team.contest,
//       user: { $in: team.members },
//     }).select("user");

//     const existingUserIds = new Set(
//       existingParticipations.map((entry) => entry.user.toString())
//     );

//     const missingMembers = team.members.filter(
//       (memberId) => !existingUserIds.has(memberId.toString())
//     );

//     if (missingMembers.length > 0) {
//       await Participation.insertMany(
//         missingMembers.map((memberId) => ({
//           user: memberId,
//           contest: team.contest,
//           participationType: "team",
//           team: team._id,
//         }))
//       );
//     }
//   }

//   if (status === "rejected" && previousStatus !== "rejected") {
//     await Participation.deleteMany({ team: team._id });

//     await Invitation.updateMany(
//       { team: team._id, status: "pending" },
//       { status: "rejected" }
//     );
//   }

//   return res.status(200).json({
//     success: true,
//     message: `Team status updated to ${status}`,
//     team,
//   });
// });

// // ==========================================
// // GET PENDING TEAMS
// // ==========================================
// export const getPendingTeams = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ status: "pending" })
//     .populate("leader", "name email")
//     .populate("members", "name email")
//     .populate("contest", "title maxTeamSize participationType startDate deadline")
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     success: true,
//     message: "Pending teams fetched successfully",
//     count: teams.length,
//     teams,
//   });
// });


// import asyncHandler from "../middleware/asyncHandler.js";
// import crypto from "crypto";

// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";
// import { Invitation } from "../models/invitation.model.js";


// // =====================================================
// // CREATE TEAM
// // বাংলা: নতুন team create করবে, আর contest-এ join করাবে
// // English: Create a new team and join the contest
// // =====================================================
// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, contest, teamType } = req.body;

//   // বাংলা: required field check
//   // English: validate required fields
//   if (!teamName || !contest || !teamType) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name, contest and teamType are required",
//     });
//   }

//   // বাংলা: teamType only solo or team হবে
//   // English: only solo or team is allowed
//   if (!["solo", "team"].includes(teamType)) {
//     return res.status(400).json({
//       success: false,
//       message: "teamType must be solo or team",
//     });
//   }

//   // বাংলা: contest আছে কিনা check
//   // English: check contest existence
//   const contestDoc = await Contest.findById(contest);
//   if (!contestDoc) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   // বাংলা: contest deadline পার হয়ে গেলে join করা যাবে না
//   // English: do not allow join if contest is completed
//   if (getContestStatus(contestDoc) === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline passed",
//     });
//   }

//   // বাংলা: contest type অনুযায়ী teamType match করতে হবে
//   // English: validate contest participation type
//   if (contestDoc.participationType === "solo" && teamType !== "solo") {
//     return res.status(400).json({
//       success: false,
//       message: "This contest allows only solo participation",
//     });
//   }

//   if (contestDoc.participationType === "team" && teamType !== "team") {
//     return res.status(400).json({
//       success: false,
//       message: "This contest allows only team participation",
//     });
//   }

//   // বাংলা: একই contest-এ same user already আছে কিনা check
//   // English: block same user from joining same contest twice
//   const alreadyJoined = await Team.findOne({
//     contest,
//     members: req.user._id,
//   });

//   if (alreadyJoined) {
//     return res.status(400).json({
//       success: false,
//       message: "You already joined this contest",
//     });
//   }

//   // বাংলা: একই contest-এ same team name duplicate block
//   // English: prevent duplicate team name inside same contest
//   const existingTeamName = await Team.findOne({
//     contest,
//     teamName: teamName.trim(),
//   });

//   if (existingTeamName) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name already exists in this contest",
//     });
//   }

//   // বাংলা: নতুন team create
//   // English: create new team
//   const team = await Team.create({
//     teamName: teamName.trim(),
//     leader: req.user._id,
//     members: [req.user._id],
//     contest,
//     teamType,
//   });

//   // বাংলা: team-based participation record create
//   // English: create team-based participation
//   await Participation.create({
//     contest,
//     participationType: teamType,
//     team: team._id,
//     status: "pending",
//   });

//   return res.status(201).json({
//     success: true,
//     message: "Team created successfully",
//     team,
//   });
// });

// // INVITE MEMBER
// // team member অন্য user-কে invite করবে

// export const inviteMember = asyncHandler(async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     return res.status(400).json({
//       success: false,
//       message: "User id required",
//     });
//   }

  
//   const team = await Team.findById(req.params.id).populate("contest");

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   //solo team invite allowed na
//   if (team.teamType === "solo") {
//     return res.status(400).json({
//       success: false,
//       message: "Solo team cannot invite members",
//     });
//   }

//   //only team leader/member invite kortee parbe

//   const isMember = team.members.some(
//     (member) => member.toString() === req.user._id.toString()
//   );

//   if (!isMember) {
//     return res.status(403).json({
//       success: false,
//       message: "Only team members can invite",
//     });
//   }

//   // বাংলা: নিজেরে নিজে invite করা যাবে না
//   // English: cannot invite yourself
//   if (userId.toString() === req.user._id.toString()) {
//     return res.status(400).json({
//       success: false,
//       message: "You cannot invite yourself",
//     });
//   }

//   //contest complete hole invite hobe na

//   if (getContestStatus(team.contest) === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline passed",
//     });
//   }

//   // বাংলা: invited user আছে কিনা check
//   // English: check invited user existence
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({
//       success: false,
//       message: "User not found",
//     });
//   }

//   //  check if already a member
//   const alreadyMember = team.members.some(
//     (member) => member.toString() === user._id.toString()
//   );

//   if (alreadyMember) {
//     return res.status(400).json({
//       success: false,
//       message: "User already in team",
//     });
//   }

//   // block if user already joined another team in same contest
//   const alreadyJoined = await Team.findOne({
//     contest: team.contest._id,
//     members: user._id,
//   });

//   if (alreadyJoined) {
//     return res.status(400).json({
//       success: false,
//       message: "User already in another team in this contest",
//     });
//   }

//   // বাংলা: একই team থেকে pending invitation already আছে কিনা
//   // English: prevent duplicate pending invitations
//   const existingInvite = await Invitation.findOne({
//     team: team._id,
//     invitedUser: user._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   });

//   if (existingInvite) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation already sent",
//     });
//   }

//   // বাংলা: maxTeamSize exceed করবে কিনা check
//   // English: check maximum team size
//   const pendingInvites = await Invitation.countDocuments({
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   });

//   if (team.members.length + pendingInvites >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `Team is full (max ${team.contest.maxTeamSize} members)`,
//     });
//   }

//   // বাংলা: invitation token generate
//   // English: generate invitation token
//   const token = crypto.randomBytes(32).toString("hex");

//   // বাংলা: invitation create
//   // English: create invitation record
//   const invitation = await Invitation.create({
//     invitedUser: user._id,
//     team: team._id,
//     invitedBy: req.user._id,
//     token,
//     tokenExpiry: new Date(Date.now() + 48 * 60 * 60 * 1000),
//     status: "pending",
//   });

//   return res.status(200).json({
//     success: true,
//     message: "Invitation sent",
//     invitation,
//   });
// });


// // =====================================================
// // CONFIRM INVITATION
// // বাংলা: invited user token দিয়ে team join করবে
// // English: Confirm invitation and join team
// // =====================================================
// export const confirmInvitation = asyncHandler(async (req, res) => {
//   const token = req.body.token || req.params.token;

//   // বাংলা: token লাগবে
//   // English: token is required
//   if (!token) {
//     return res.status(400).json({
//       success: false,
//       message: "Token required",
//     });
//   }

//   // বাংলা: valid pending invitation find
//   // English: find valid pending invitation
//   const invitation = await Invitation.findOne({
//     token,
//     status: "pending",
//   });

//   if (!invitation) {
//     return res.status(400).json({
//       success: false,
//       message: "Invalid token",
//     });
//   }

//   // বাংলা: token expired কিনা check
//   // English: check invitation expiry
//   if (invitation.tokenExpiry < new Date()) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation expired",
//     });
//   }

//   // বাংলা: invitation যার জন্য, সেই user-ই accept করবে
//   // English: only invited user can accept
//   if (invitation.invitedUser.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       success: false,
//       message: "This invitation is not for you",
//     });
//   }

//   // বাংলা: team find করো
//   // English: find the invited team
//   const team = await Team.findById(invitation.team).populate("contest");

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   // বাংলা: আবার same contest-এ already joined কিনা check
//   // English: prevent same user joining same contest twice
//   const alreadyJoined = await Team.findOne({
//     contest: team.contest._id,
//     members: req.user._id,
//   });

//   if (alreadyJoined) {
//     return res.status(400).json({
//       success: false,
//       message: "You already joined this contest",
//     });
//   }

//   // বাংলা: team full কিনা check
//   // English: check team capacity
//   if (team.members.length >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `Team is full (max ${team.contest.maxTeamSize} members)`,
//     });
//   }

//   // বাংলা: new member add
//   // English: add invited user to members
//   team.members.push(req.user._id);
//   await team.save();

//   // বাংলা: accepted mark করো
//   // English: mark invitation as accepted
//   invitation.status = "accepted";
//   await invitation.save();

//   // বাংলা: same user-এর other pending invites reject
//   // English: reject other pending invites for same user in same team
//   await Invitation.updateMany(
//     {
//       _id: { $ne: invitation._id },
//       team: team._id,
//       invitedUser: req.user._id,
//       status: "pending",
//     },
//     {
//       $set: { status: "rejected" },
//     }
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Joined team successfully",
//     team,
//   });
// });


// // =====================================================
// // GET MY INVITATIONS
// // বাংলা: logged in user-এর pending invitation list
// // English: Get my pending invitations
// // =====================================================
// export const getMyInvitations = asyncHandler(async (req, res) => {
//   const invitations = await Invitation.find({
//     invitedUser: req.user._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   })
//     .populate("team", "teamName teamType contest leader members")
//     .populate("invitedUser", "name email")
//     .populate("invitedBy", "name email")
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     success: true,
//     count: invitations.length,
//     invitations,
//   });
// });


// // =====================================================
// // GET MY TEAMS
// // বাংলা: logged in user যেসব team-এ আছে সেগুলো দেখাবে
// // English: Get all teams of the logged-in user
// // =====================================================
// export const getMyTeams = asyncHandler(async (req, res) => {
//   const teams = await Team.find({
//     members: req.user._id,
//   })
//     .populate("leader", "name email")
//     .populate("members", "name email")
//     .populate("contest", "title startDate deadline participationType");

//   return res.status(200).json({
//     success: true,
//     teams,
//   });
// });


// // =====================================================
// // GET TEAMS BY CONTEST
// // বাংলা: নির্দিষ্ট contest-এর সব team দেখাবে
// // English: Get all teams by contest
// // =====================================================
// export const getTeamsByContest = asyncHandler(async (req, res) => {
//   const teams = await Team.find({
//     contest: req.params.contestId,
//   })
//     .populate("leader", "name email")
//     .populate("members", "name email")
//     .populate("contest", "title startDate deadline participationType");

//   return res.status(200).json({
//     success: true,
//     teams,
//   });
// });


// // =====================================================
// // UPDATE TEAM
// // বাংলা: team leader team name update করতে পারবে
// // English: Team leader can update team name
// // =====================================================
// export const updateTeam = asyncHandler(async (req, res) => {
//   const { teamName } = req.body;

//   // বাংলা: team find
//   // English: find team by id
//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   // বাংলা: only leader update করতে পারবে
//   // English: only leader can update the team
//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       success: false,
//       message: "Only leader can update team",
//     });
//   }

//   // বাংলা: teamName দিলে update হবে
//   // English: update team name if provided
//   if (teamName) {
//     const trimmedName = teamName.trim();

//     const existingTeamName = await Team.findOne({
//       _id: { $ne: team._id },
//       contest: team.contest,
//       teamName: trimmedName,
//     });

//     if (existingTeamName) {
//       return res.status(400).json({
//         success: false,
//         message: "Team name already exists in this contest",
//       });
//     }

//     team.teamName = trimmedName;
//   }

//   await team.save();

//   return res.status(200).json({
//     success: true,
//     message: "Team updated successfully",
//     team,
//   });
// });



// // team leader team delete korte parbe

// export const deleteTeam = asyncHandler(async (req, res) => {
//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({
//       success: false,
//       message: "Team not found",
//     });
//   }

//   // বাংলা: only leader delete করতে পারবে
//   // English: only leader can delete the team
//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       success: false,
//       message: "Only leader can delete",
//     });
//   }

//   // বাংলা: related participation & invitation delete
//   // English: delete related participation and invitations
//   await Participation.deleteMany({ team: team._id });
//   await Invitation.deleteMany({ team: team._id });

//   await team.deleteOne();

//   return res.status(200).json({
//     success: true,
//     message: "Team deleted",
//   });
// });

// console.log("team controller is working");



import asyncHandler from "../middleware/asyncHandler.js";
import crypto from "crypto";

import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import { Invitation } from "../models/invitation.model.js";
import { Submission } from "../models/submission.model.js";


// CREATE TEAM
//new team create korbe,and contest join korbe


// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, contest, teamType } = req.body;

//   if (!teamName || !contest || !teamType) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name, contest and teamType are required",
//     });
//   }

//   if (!["solo", "team"].includes(teamType)) {
//     return res.status(400).json({
//       success: false,
//       message: "teamType must be solo or team",
//     });
//   }

//   const contestDoc = await Contest.findById(contest);

//   if (!contestDoc) {
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   const contestStatus = getContestStatus(contestDoc);

//   if (contestStatus === "completed") {
//     return res.status(400).json({
//       success: false,
//       message: "Contest deadline passed",
//     });
//   }

//   if (contestDoc.participationType === "solo" && teamType !== "solo") {
//     return res.status(400).json({
//       success: false,
//       message: "This contest allows only solo participation",
//     });
//   }

//   if (contestDoc.participationType === "team" && teamType !== "team") {
//     return res.status(400).json({
//       success: false,
//       message: "This contest allows only team participation",
//     });
//   }

//   const trimmedTeamName = teamName.trim();

//   if (!trimmedTeamName) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name is required",
//     });
//   }

//   const alreadyJoined = await Team.findOne({
//     contest,
//     members: req.user._id,
//   });

//   if (alreadyJoined) {
//     return res.status(400).json({
//       success: false,
//       message: "You already joined this contest",
//     });
//   }

//   const existingTeamName = await Team.findOne({
//     contest,
//     teamName: trimmedTeamName,
//   });

//   if (existingTeamName) {
//     return res.status(400).json({
//       success: false,
//       message: "Team name already exists in this contest",
//     });
//   }

//   const team = await Team.create({
//     teamName: trimmedTeamName,
//     leader: req.user._id,
//     members: [req.user._id],
//     contest,
//     teamType,
//   });

//   await Participation.create({
//     contest,
//     participationType: teamType,
//     team: team._id,
//     status: "pending",
//   });

//   const populatedTeam = await Team.findById(team._id)
//     .populate("leader", "name email phoneNumber")
//     .populate("members", "name email phoneNumber")
//     .populate("contest", "title startDate deadline participationType");

//   return res.status(201).json({
//     success: true,
//     message: "Team created successfully",
//     team: populatedTeam,
//   });
// });

export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, contest, teamType } = req.body;

  //  required check
  if (!teamName || !contest || !teamType) {
    return res.status(400).json({
      success: false,
      message: "Team name, contest and teamType are required",
    });
  }

  if (!["solo", "team"].includes(teamType)) {
    return res.status(400).json({
      success: false,
      message: "teamType must be solo or team",
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

  // contest rule check
  if (contestDoc.participationType === "solo" && teamType !== "solo") {
    return res.status(400).json({
      success: false,
      message: "Only solo allowed",
    });
  }

  if (contestDoc.participationType === "team" && teamType !== "team") {
    return res.status(400).json({
      success: false,
      message: "Only team allowed",
    });
  }

  const trimmedTeamName = teamName.trim();

  if (!trimmedTeamName) {
    return res.status(400).json({
      success: false,
      message: "Team name required",
    });
  }

  // already joined check
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

  // unique team name
  const existingTeamName = await Team.findOne({
    contest,
    teamName: trimmedTeamName,
  });

  if (existingTeamName) {
    return res.status(400).json({
      success: false,
      message: "Team name already exists",
    });
  }

  
  if (teamType === "solo") {
    // ensure only 1 member
    var members = [req.user._id];
  } else {
    var members = [req.user._id]; // start with leader
  }

  // create team
  const team = await Team.create({
    teamName: trimmedTeamName,
    leader: req.user._id,
    members,
    contest,
    teamType,
  });

  // participation
  await Participation.create({
    contest,
    type: teamType,
    team: team._id,
  });

  const populatedTeam = await Team.findById(team._id)
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title participationType");

  return res.status(201).json({
    success: true,
    message:
      teamType === "solo"
        ? "Solo team created & joined"
        : "Team created successfully",
    team: populatedTeam,
  });
});

// =====================================================
// INVITE MEMBER
// বাংলা: team leader অন্য user-কে invite করবে
// English: Team leader invites another user
// =====================================================
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

  if (team.members.length + pendingInvites >= team.contest.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full (max ${team.contest.maxTeamSize} members)`,
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
    .populate("team", "teamName teamType contest leader members");

  return res.status(200).json({
    success: true,
    message: "Invitation sent",
    invitation: populatedInvitation,
  });
});


// CONFIRM INVITATION
// invited user token deya team join korbe

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
    return res.status(400).json({
      success: false,
      message: "Invitation expired",
    });
  }

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

  if (team.members.length >= team.contest.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full (max ${team.contest.maxTeamSize} members)`,
    });
  }

  team.members.push(req.user._id);
  await team.save();

  invitation.status = "accepted";
  await invitation.save();

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
    .populate("contest", "title startDate deadline participationType");

  return res.status(200).json({
    success: true,
    message: "Joined team successfully",
    team: populatedTeam,
  });
});


// GET MY INVITATIONS
// logged in user er pending invitation list

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


// GET MY TEAMS
// logged in user jesob team a ache segulo k dhekabo

export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    members: req.user._id,
  })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title startDate deadline participationType");

  return res.status(200).json({
    success: true,
    teams,
  });
});


// GET TEAMS BY CONTEST
// Get all teams by contest

export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({
    contest: req.params.contestId,
  })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title startDate deadline participationType");

  return res.status(200).json({
    success: true,
    teams,
  });
});


// UPDATE TEAM
//  team leader team name update korte parbe na

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
    .populate("contest", "title startDate deadline participationType");

  return res.status(200).json({
    success: true,
    message: "Team updated successfully",
    team: updatedTeam,
  });
});


// DELETE TEAM
//  team leader team delete korte parbe

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
    message: "Team deleted",
  });
});

console.log("team controller is working");