
// import asyncHandler from "../middleware/asyncHandler.js";
// import crypto from "crypto";
// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";
// import { Invitation } from "../models/invitation.model.js";
// import { sendEmail } from "../utils/sendEmail.js";

// const normalizeInviteEmails = (emails = []) => [
//   ...new Set(
//     (Array.isArray(emails) ? emails : [])
//       .map((email) => email?.toLowerCase().trim())
//       .filter(Boolean)
//   ),
// ];

// // ==========================================
// // CREATE TEAM
// // ==========================================
// // export const teamCreate = asyncHandler(async (req, res) => {
// //   const { teamName, contest, inviteEmails = [] } = req.body;

// //   if (!teamName || !contest) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Team name and contest are required",
// //     });
// //   }

// //   const contestDoc = await Contest.findById(contest);
// //   if (!contestDoc) {
// //     return res.status(404).json({
// //       success: false,
// //       message: "Contest not found",
// //     });
// //   }

// //   if (contestDoc.participationType === "solo") {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Teams cannot be created for solo-only contests",
// //     });
// //   }

// //   if (getContestStatus(contestDoc) === "completed") {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Contest deadline has passed.",
// //     });
// //   }

// //   const normalizedTeamName = teamName.trim();

// //   const existingTeamName = await Team.findOne({
// //     contest,
// //     teamName: normalizedTeamName,
// //   });

// //   if (existingTeamName) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Team name is already taken for this contest",
// //     });
// //   }

// //   const existingParticipation = await Participation.findOne({
// //     contest,
// //     user: req.user._id,
// //   });

// //   if (existingParticipation) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "You are already participating in this contest",
// //     });
// //   }

// //   const normalizedEmails = normalizeInviteEmails(inviteEmails).filter(
// //     (email) => email !== req.user.email?.toLowerCase()
// //   );

// //   if (normalizedEmails.length + 1 > contestDoc.maxTeamSize) {
// //     return res.status(400).json({
// //       success: false,
// //       message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`,
// //     });
// //   }

// //   const usersByEmail = await User.find({
// //     email: { $in: normalizedEmails },
// //   }).select("_id email");

// //   const participatingUsers = await Participation.find({
// //     contest,
// //     user: { $in: usersByEmail.map((u) => u._id) },
// //   }).populate("user", "email");

// //   const blockedEmails = participatingUsers
// //     .map((entry) => entry.user?.email?.toLowerCase())
// //     .filter(Boolean);

// //   if (blockedEmails.length > 0) {
// //     return res.status(400).json({
// //       success: false,
// //       message: `These users are already participating: ${blockedEmails.join(", ")}`,
// //     });
// //   }

// //   const team = await Team.create({
// //     teamName: normalizedTeamName,
// //     leader: req.user._id,
// //     members: [req.user._id],
// //     contest,
// //     status: "pending",
// //   });

// //   await Participation.create({
// //     user: req.user._id,
// //     contest,
// //     participationType: "team",
// //     team: team._id,
// //   });

// //   const inviteResults = [];

// //   for (const email of normalizedEmails) {
// //     const existingInvite = await Invitation.findOne({
// //       email,
// //       team: team._id,
// //       status: "pending",
// //       tokenExpiry: { $gt: new Date() },
// //     });

// //     if (existingInvite) {
// //       inviteResults.push({
// //         email,
// //         sent: false,
// //         reason: "already invited",
// //       });
// //       continue;
// //     }

// //     const inviteToken = crypto.randomBytes(32).toString("hex");
// //     const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

// //     const invitation = await Invitation.create({
// //       email,
// //       team: team._id,
// //       invitedBy: req.user._id,
// //       token: inviteToken,
// //       tokenExpiry,
// //     });

// //     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
// //     const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

// //     const html = `
// //       <h2>You have been invited to join a team</h2>
// //       <p><strong>Team:</strong> ${team.teamName}</p>
// //       <p><strong>Contest:</strong> ${contestDoc.title}</p>
// //       <p>Please login with the invited email first, then accept invitation.</p>
// //       <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
// //         Accept Invitation
// //       </a>
// //     `;

// //     try {
// //       await sendEmail(email, `Invitation to join ${team.teamName}`, html);
// //       inviteResults.push({
// //         email,
// //         sent: true,
// //       });
// //     } catch (error) {
// //       await invitation.deleteOne();
// //       inviteResults.push({
// //         email,
// //         sent: false,
// //         reason: error.message,
// //       });
// //     }
// //   }

// //   return res.status(201).json({
// //     success: true,
// //     message: "Team created successfully",
// //     team,
// //     invitations: inviteResults,
// //   });
// // });


// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, contest, inviteUserIds = [] } = req.body;

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
//       (Array.isArray(inviteUserIds) ? inviteUserIds : [])
//         .map((id) => id?.toString())
//         .filter(Boolean)
//         .filter((id) => id !== req.user._id.toString())
//     ),
//   ];

//   if (uniqueInviteUserIds.length + 1 > contestDoc.maxTeamSize) {
//     return res.status(400).json({
//       success: false,
//       message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`,
//     });
//   }

//   const users = await User.find({
//     _id: { $in: uniqueInviteUserIds },
//   }).select("_id name email");

//   if (users.length !== uniqueInviteUserIds.length) {
//     return res.status(400).json({
//       success: false,
//       message: "One or more selected users do not exist",
//     });
//   }

//   const participatingUsers = await Participation.find({
//     contest,
//     user: { $in: uniqueInviteUserIds },
//   }).populate("user", "name email");

//   if (participatingUsers.length > 0) {
//     return res.status(400).json({
//       success: false,
//       message: `Some selected users are already participating in this contest`,
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

//   for (const invitedUserId of uniqueInviteUserIds) {
//     const existingInvite = await Invitation.findOne({
//       invitedUser: invitedUserId,
//       team: team._id,
//       status: "pending",
//       tokenExpiry: { $gt: new Date() },
//     });

//     if (existingInvite) {
//       inviteResults.push({
//         userId: invitedUserId,
//         sent: false,
//         reason: "already invited",
//       });
//       continue;
//     }

//     const inviteToken = crypto.randomBytes(32).toString("hex");
//     const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

//     const invitation = await Invitation.create({
//       invitedUser: invitedUserId,
//       team: team._id,
//       invitedBy: req.user._id,
//       token: inviteToken,
//       tokenExpiry,
//       status: "pending",
//     });

//     inviteResults.push({
//       userId: invitedUserId,
//       sent: true,
//       invitationId: invitation._id,
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


// // export const inviteMember = asyncHandler(async (req, res) => {
// //   console.log("inviteMember route hit");
// //   console.log("origin:", req.headers.origin);
// //   console.log("req.user:", req.user?.email);
// //   console.log("req.params.id:", req.params.id);
// //   console.log("req.body:", req.body);

// //   const { email } = req.body;
// //   const normalizedEmail = email?.toLowerCase().trim();

// //   if (!normalizedEmail) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Email is required",
// //     });
// //   }

// //   const team = await Team.findById(req.params.id).populate(
// //     "contest",
// //     "title startDate deadline maxTeamSize participationType"
// //   );

// //   console.log("team found:", !!team);

// //   if (!team) {
// //     return res.status(404).json({
// //       success: false,
// //       message: "Team not found",
// //     });
// //   }

// //   const isMember = team.members.some(
// //     (m) => m.toString() === req.user._id.toString()
// //   );

// //   console.log("isMember:", isMember);

// //   if (!isMember) {
// //     return res.status(403).json({
// //       success: false,
// //       message: "Only team members can invite users",
// //     });
// //   }

// //   if (getContestStatus(team.contest) === "completed") {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Contest deadline has passed.",
// //     });
// //   }

// //   const pendingInvitations = await Invitation.countDocuments({
// //     team: team._id,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() },
// //   });

// //   if (team.members.length + pendingInvitations >= team.contest.maxTeamSize) {
// //     return res.status(400).json({
// //       success: false,
// //       message: `Team is full (max ${team.contest.maxTeamSize} members)`,
// //     });
// //   }

// //   const invitedUser = await User.findOne({ email: normalizedEmail });

// //   if (invitedUser) {
// //     const alreadyMember = team.members.some(
// //       (m) => m.toString() === invitedUser._id.toString()
// //     );

// //     if (alreadyMember) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "This user is already a member of the team",
// //       });
// //     }

// //     const alreadyParticipating = await Participation.findOne({
// //       contest: team.contest._id,
// //       user: invitedUser._id,
// //     });

// //     if (alreadyParticipating) {
// //       return res.status(400).json({
// //         success: false,
// //         message: "This user is already participating in this contest",
// //       });
// //     }
// //   }

// //   const existingInvite = await Invitation.findOne({
// //     email: normalizedEmail,
// //     team: team._id,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() },
// //   });

// //   if (existingInvite) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Invitation already sent to this email",
// //     });
// //   }

// //   const inviteToken = crypto.randomBytes(32).toString("hex");
// //   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

// //   const invitation = await Invitation.create({
// //     email: normalizedEmail,
// //     team: team._id,
// //     invitedBy: req.user._id,
// //     token: inviteToken,
// //     tokenExpiry,
// //   });

// //   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
// //   const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

// //   const html = `
// //     <h2>You have been invited to join a team</h2>
// //     <p><strong>Team:</strong> ${team.teamName}</p>
// //     <p><strong>Contest:</strong> ${team.contest.title}</p>
// //     <p>Please login with the invited email first, then accept invitation.</p>
// //     <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
// //       Accept Invitation
// //     </a>
// //   `;

// //   try {
// //     console.log("before sendEmail");
// //     await sendEmail(
// //       normalizedEmail,
// //       `Invitation to join ${team.teamName}`,
// //       html
// //     );
// //     console.log("after sendEmail");

// //     return res.status(200).json({
// //       success: true,
// //       message: `Invitation sent successfully to ${normalizedEmail}`,
// //     });
// //   } catch (error) {
// //     console.error("sendEmail error:", error);

// //     await invitation.deleteOne();

// //     return res.status(500).json({
// //       success: false,
// //       message: "Email could not be sent",
// //       error: error.message,
// //     });
// //   }
// // });

// // ==========================================
// // CONFIRM INVITATION
// // ==========================================
// // export const confirmInvitation = asyncHandler(async (req, res) => {
// //   const { token } = req.params;

// //   const invitation = await Invitation.findOne({
// //     token,
// //     status: "pending",
// //   });

// //   if (!invitation) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Invalid or already used invitation token",
// //     });
// //   }

// //   if (invitation.tokenExpiry < new Date()) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Invitation link has expired",
// //     });
// //   }

// //   if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
// //     return res.status(403).json({
// //       success: false,
// //       message: "This invitation was not sent to your email",
// //     });
// //   }

// //   const team = await Team.findById(invitation.team).populate(
// //     "contest",
// //     "title startDate deadline maxTeamSize"
// //   );

// //   if (!team) {
// //     return res.status(404).json({
// //       success: false,
// //       message: "Team no longer exists",
// //     });
// //   }

// //   if (team.status === "rejected") {
// //     return res.status(400).json({
// //       success: false,
// //       message: "This team has been rejected by admin",
// //     });
// //   }

// //   if (getContestStatus(team.contest) === "completed") {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Contest deadline has passed.",
// //     });
// //   }

// //   if (team.members.length >= team.contest.maxTeamSize) {
// //     return res.status(400).json({
// //       success: false,
// //       message: `Team is already full (max ${team.contest.maxTeamSize} members)`,
// //     });
// //   }

// //   const alreadyMember = team.members.some(
// //     (m) => m.toString() === req.user._id.toString()
// //   );

// //   if (alreadyMember) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "You are already a member of this team",
// //     });
// //   }

// //   const alreadyParticipating = await Participation.findOne({
// //     contest: team.contest._id,
// //     user: req.user._id,
// //   });

// //   if (alreadyParticipating) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "You are already participating in this contest",
// //     });
// //   }

// //   team.members.push(req.user._id);
// //   await team.save();

// //   await Participation.create({
// //     user: req.user._id,
// //     contest: team.contest._id,
// //     participationType: "team",
// //     team: team._id,
// //   });

// //   invitation.status = "accepted";
// //   await invitation.save();

// //   return res.status(200).json({
// //     success: true,
// //     message: "Invitation accepted successfully",
// //     team,
// //   });
// // });


// export const inviteMember = asyncHandler(async (req, res) => {
//   const { userId } = req.body;

//   if (!userId) {
//     return res.status(400).json({
//       success: false,
//       message: "User id is required",
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

//   const invitedUser = await User.findById(userId);

//   if (!invitedUser) {
//     return res.status(404).json({
//       success: false,
//       message: "Invited user not found",
//     });
//   }

//   const alreadyMember = team.members.some(
//     (m) => m.toString() === invitedUser._id.toString()
//   );

//   if (alreadyMember) {
//     return res.status(400).json({
//       success: false,
//       message: "This user is already a member of the team",
//     });
//   }

//   const alreadyParticipating = await Participation.findOne({
//     contest: team.contest._id,
//     user: invitedUser._id,
//   });

//   if (alreadyParticipating) {
//     return res.status(400).json({
//       success: false,
//       message: "This user is already participating in this contest",
//     });
//   }

//   const existingInvite = await Invitation.findOne({
//     invitedUser: invitedUser._id,
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   });

//   if (existingInvite) {
//     return res.status(400).json({
//       success: false,
//       message: "Invitation already sent to this user",
//     });
//   }

//   const inviteToken = crypto.randomBytes(32).toString("hex");
//   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

//   const invitation = await Invitation.create({
//     invitedUser: invitedUser._id,
//     team: team._id,
//     invitedBy: req.user._id,
//     token: inviteToken,
//     tokenExpiry,
//     status: "pending",
//   });

//   return res.status(200).json({
//     success: true,
//     message: "Invitation created successfully",
//     invitation,
//   });
// });


// export const confirmInvitation = asyncHandler(async (req, res) => {
//   const { token } = req.params;

//   const invitation = await Invitation.findOne({
//     token,
//     status: "pending",
//   });

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

//   return res.status(200).json({
//     success: true,
//     message: "Invitation accepted successfully",
//     team,
//   });
// });





// // ==========================================
// // GET MY INVITATIONS
// // ==========================================
// // export const getMyInvitations = asyncHandler(async (req, res) => {
// //   const userEmail = req.user.email?.toLowerCase();

// //   if (!userEmail) {
// //     return res.status(400).json({
// //       success: false,
// //       message: "Email not found in token. Please login again.",
// //     });
// //   }

// //   const invitations = await Invitation.find({
// //     email: userEmail,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() },
// //   })
// //     .populate({
// //       path: "team",
// //       select: "teamName status members contest",
// //       populate: [
// //         { path: "members", select: "name email" },
// //         { path: "contest", select: "title startDate deadline" },
// //       ],
// //     })
// //     .sort({ createdAt: -1 });

// //   return res.status(200).json({
// //     success: true,
// //     message: "My pending invitations",
// //     count: invitations.length,
// //     invitations,
// //   });
// // });

// export const getMyInvitations = asyncHandler(async (req, res) => {
//   const invitations = await Invitation.find({
//     invitedUser: req.user._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() },
//   })
//     .populate({
//       path: "team",
//       select: "teamName status members contest",
//       populate: [
//         { path: "members", select: "name email" },
//         { path: "contest", select: "title startDate deadline" },
//       ],
//     })
//     .populate("invitedBy", "name email")
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     success: true,
//     message: "My pending invitations",
//     count: invitations.length,
//     invitations,
//   });
// });


// // ==========================================
// // GET MY TEAMS
// // ==========================================
// export const getMyTeams = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ members: req.user._id })
//     .populate("members", "name email")
//     .populate("contest", "title startDate deadline");

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
//     .populate("members", "name email");

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

//   team.status = status;
//   await team.save();

//   if (status === "rejected") {
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





import asyncHandler from "../middleware/asyncHandler.js";
import crypto from "crypto";
import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import { Invitation } from "../models/invitation.model.js";

// ==========================================
// CREATE TEAM
// ==========================================
export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, contest, inviteUserIds = [] } = req.body;

  if (!teamName || !contest) {
    return res.status(400).json({
      success: false,
      message: "Team name and contest are required",
    });
  }

  const contestDoc = await Contest.findById(contest);
  if (!contestDoc) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  if (contestDoc.participationType === "solo") {
    return res.status(400).json({
      success: false,
      message: "Teams cannot be created for solo-only contests",
    });
  }

  if (getContestStatus(contestDoc) === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline has passed.",
    });
  }

  const normalizedTeamName = teamName.trim();

  const existingTeamName = await Team.findOne({
    contest,
    teamName: normalizedTeamName,
  });

  if (existingTeamName) {
    return res.status(400).json({
      success: false,
      message: "Team name is already taken for this contest",
    });
  }

  const existingParticipation = await Participation.findOne({
    contest,
    user: req.user._id,
  });

  if (existingParticipation) {
    return res.status(400).json({
      success: false,
      message: "You are already participating in this contest",
    });
  }

  const uniqueInviteUserIds = [
    ...new Set(
      (Array.isArray(inviteUserIds) ? inviteUserIds : [])
        .map((id) => id?.toString())
        .filter(Boolean)
        .filter((id) => id !== req.user._id.toString())
    ),
  ];

  if (uniqueInviteUserIds.length + 1 > contestDoc.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`,
    });
  }

  const users = await User.find({
    _id: { $in: uniqueInviteUserIds },
  }).select("_id name email");

  if (users.length !== uniqueInviteUserIds.length) {
    return res.status(400).json({
      success: false,
      message: "One or more selected users do not exist",
    });
  }

  const participatingUsers = await Participation.find({
    contest,
    user: { $in: uniqueInviteUserIds },
  }).populate("user", "name email");

  if (participatingUsers.length > 0) {
    return res.status(400).json({
      success: false,
      message: "Some selected users are already participating in this contest",
    });
  }

  const team = await Team.create({
    teamName: normalizedTeamName,
    leader: req.user._id,
    members: [req.user._id],
    contest,
    status: "pending",
  });

  await Participation.create({
    user: req.user._id,
    contest,
    participationType: "team",
    team: team._id,
  });

  const inviteResults = [];

  for (const invitedUserId of uniqueInviteUserIds) {
    const existingInvite = await Invitation.findOne({
      invitedUser: invitedUserId,
      team: team._id,
      status: "pending",
      tokenExpiry: { $gt: new Date() },
    });

    if (existingInvite) {
      inviteResults.push({
        userId: invitedUserId,
        sent: false,
        reason: "already invited",
      });
      continue;
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

    const invitation = await Invitation.create({
      invitedUser: invitedUserId,
      team: team._id,
      invitedBy: req.user._id,
      token: inviteToken,
      tokenExpiry,
      status: "pending",
    });

    inviteResults.push({
      userId: invitedUserId,
      sent: true,
      invitationId: invitation._id,
    });
  }

  return res.status(201).json({
    success: true,
    message: "Team created successfully",
    team,
    invitations: inviteResults,
  });
});

// ==========================================
// INVITE MEMBER
// ==========================================
export const inviteMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  if (!userId) {
    return res.status(400).json({
      success: false,
      message: "User id is required",
    });
  }

  const team = await Team.findById(req.params.id).populate(
    "contest",
    "title startDate deadline maxTeamSize participationType"
  );

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  if (team.status === "rejected") {
    return res.status(400).json({
      success: false,
      message: "This team has been rejected by admin",
    });
  }

  const isMember = team.members.some(
    (m) => m.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      success: false,
      message: "Only team members can invite users",
    });
  }

  if (getContestStatus(team.contest) === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline has passed.",
    });
  }

  const pendingInvitations = await Invitation.countDocuments({
    team: team._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  if (team.members.length + pendingInvitations >= team.contest.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is full (max ${team.contest.maxTeamSize} members)`,
    });
  }

  const invitedUser = await User.findById(userId).select("_id name email");

  if (!invitedUser) {
    return res.status(404).json({
      success: false,
      message: "Invited user not found",
    });
  }

  const alreadyMember = team.members.some(
    (m) => m.toString() === invitedUser._id.toString()
  );

  if (alreadyMember) {
    return res.status(400).json({
      success: false,
      message: "This user is already a member of the team",
    });
  }

  const alreadyParticipating = await Participation.findOne({
    contest: team.contest._id,
    user: invitedUser._id,
  });

  if (alreadyParticipating) {
    return res.status(400).json({
      success: false,
      message: "This user is already participating in this contest",
    });
  }

  const existingInvite = await Invitation.findOne({
    invitedUser: invitedUser._id,
    team: team._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  if (existingInvite) {
    return res.status(400).json({
      success: false,
      message: "Invitation already sent to this user",
    });
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

  const invitation = await Invitation.create({
    invitedUser: invitedUser._id,
    team: team._id,
    invitedBy: req.user._id,
    token: inviteToken,
    tokenExpiry,
    status: "pending",
  });

  return res.status(200).json({
    success: true,
    message: "Invitation created successfully",
    invitation,
  });
});

// ==========================================
// CONFIRM INVITATION
// ==========================================
export const confirmInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  const invitation = await Invitation.findOne({
    token,
    status: "pending",
  });

  if (!invitation) {
    return res.status(400).json({
      success: false,
      message: "Invalid or already used invitation token",
    });
  }

  if (invitation.tokenExpiry < new Date()) {
    return res.status(400).json({
      success: false,
      message: "Invitation link has expired",
    });
  }

  if (invitation.invitedUser.toString() !== req.user._id.toString()) {
    return res.status(403).json({
      success: false,
      message: "This invitation is not for you",
    });
  }

  const team = await Team.findById(invitation.team).populate(
    "contest",
    "title startDate deadline maxTeamSize"
  );

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team no longer exists",
    });
  }

  if (team.status === "rejected") {
    return res.status(400).json({
      success: false,
      message: "This team has been rejected by admin",
    });
  }

  if (getContestStatus(team.contest) === "completed") {
    return res.status(400).json({
      success: false,
      message: "Contest deadline has passed.",
    });
  }

  if (team.members.length >= team.contest.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `Team is already full (max ${team.contest.maxTeamSize} members)`,
    });
  }

  const alreadyMember = team.members.some(
    (m) => m.toString() === req.user._id.toString()
  );

  if (alreadyMember) {
    return res.status(400).json({
      success: false,
      message: "You are already a member of this team",
    });
  }

  const alreadyParticipating = await Participation.findOne({
    contest: team.contest._id,
    user: req.user._id,
  });

  if (alreadyParticipating) {
    return res.status(400).json({
      success: false,
      message: "You are already participating in this contest",
    });
  }

  team.members.push(req.user._id);
  await team.save();

  await Participation.create({
    user: req.user._id,
    contest: team.contest._id,
    participationType: "team",
    team: team._id,
  });

  invitation.status = "accepted";
  await invitation.save();

  return res.status(200).json({
    success: true,
    message: "Invitation accepted successfully",
    team,
  });
});

// ==========================================
// GET MY INVITATIONS
// ==========================================
export const getMyInvitations = asyncHandler(async (req, res) => {
  const invitations = await Invitation.find({
    invitedUser: req.user._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  })
    .populate({
      path: "team",
      select: "teamName status members contest leader",
      populate: [
        { path: "members", select: "name email" },
        { path: "contest", select: "title startDate deadline" },
        { path: "leader", select: "name email" },
      ],
    })
    .populate("invitedBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "My pending invitations",
    count: invitations.length,
    invitations,
  });
});

// ==========================================
// GET MY TEAMS
// ==========================================
export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title startDate deadline status");

  return res.status(200).json({
    success: true,
    message: "My teams",
    teams,
  });
});

// ==========================================
// GET TEAMS BY CONTEST
// ==========================================
export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({ contest: req.params.contestId })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title startDate deadline");

  return res.status(200).json({
    success: true,
    message: "Teams for this contest",
    teams,
  });
});

// ==========================================
// DELETE TEAM
// ==========================================
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
      message: "Only team leader can delete this team",
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

// ==========================================
// UPDATE TEAM STATUS
// ==========================================
export const updateTeamStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;

  if (!["pending", "approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({
      success: false,
      message: "Team not found",
    });
  }

  const previousStatus = team.status;
  team.status = status;
  await team.save();

  if (status === "approved" && previousStatus !== "approved") {
    const existingParticipations = await Participation.find({
      contest: team.contest,
      user: { $in: team.members },
    }).select("user");

    const existingUserIds = new Set(
      existingParticipations.map((entry) => entry.user.toString())
    );

    const missingMembers = team.members.filter(
      (memberId) => !existingUserIds.has(memberId.toString())
    );

    if (missingMembers.length > 0) {
      await Participation.insertMany(
        missingMembers.map((memberId) => ({
          user: memberId,
          contest: team.contest,
          participationType: "team",
          team: team._id,
        }))
      );
    }
  }

  if (status === "rejected" && previousStatus !== "rejected") {
    await Participation.deleteMany({ team: team._id });

    await Invitation.updateMany(
      { team: team._id, status: "pending" },
      { status: "rejected" }
    );
  }

  return res.status(200).json({
    success: true,
    message: `Team status updated to ${status}`,
    team,
  });
});

// ==========================================
// GET PENDING TEAMS
// ==========================================
export const getPendingTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ status: "pending" })
    .populate("leader", "name email")
    .populate("members", "name email")
    .populate("contest", "title maxTeamSize participationType startDate deadline")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    message: "Pending teams fetched successfully",
    count: teams.length,
    teams,
  });
});


