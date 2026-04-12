// // // // import asyncHandler from "../middleware/asyncHandler.js";
// // // // import { Team } from "../models/team.model.js";


// // // // export const teamCreate = asyncHandler(async (req, res) => {

// // // //     const { teamName, members, contest } = req.body;

// // // //     if (!teamName || !members || !contest) {
// // // //         return res.status(401).json({ message: "All fields required" });
// // // //     }

// // // //     //let allMembers = members || [];

// // // //     // add leader if not included
// // // //     // if (!allMembers.includes(req.user._id.toString())) {
// // // //     //     allMembers.push(req.user._id);
// // // //     // }

// // // //     const allMembers  = [...new Set([req.user._id, ...(members || [])])];

// // // //     const Team = await Team.create({
// // // //         teamName,
// // // //         leader: req.user._id,
// // // //         members: allMembers,
// // // //         contest
// // // //     });

// // // //     return res.status(201).json({
// // // //         message: "Team created successfully",
// // // //         Team

// // // //     });

// // // // });

// // // // export const addMember = asyncHandler(async (req, res) => {
// // // //   const { userId } = req.body;

// // // //   const team = await Team.findById(req.params.id);

// // // //   if (!team) {
// // // //     return res.status(404).json({ message: "Team not found" });
// // // //   }

// // // //   // 🔐 only leader
// // // //   if (team.leader.toString() !== req.user._id.toString()) {
// // // //     return res.status(403).json({ message: "Only leader can add members" });
// // // //   }

// // // //   // ❌ max 2
// // // //   if (team.members.length >= 2) {
// // // //     return res.status(400).json({ message: "Team full (max 2)" });
// // // //   }

// // // //   // ❌ duplicate
// // // //   if (team.members.includes(userId)) {
// // // //     return res.status(400).json({ message: "User already in team" });
// // // //   }

// // // //   // ✅ check user exists
// // // //   const user = await User.findById(userId);
// // // //   if (!user) {
// // // //     return res.status(404).json({ message: "User not found" });
// // // //   }

// // // //   team.members.push(userId);
// // // //   await team.save();

// // // //   res.json({
// // // //     message: "Member added successfully",
// // // //     team
// // // //   });
// // // // });


// // // // //get my teams
// // // // export const getMyTeams = asyncHandler(async(req,res)=>{
    
// // // //     const team = await Team.find({members: req.user._id })
// // // //     .populate("members", "name email")
// // // //     .populate("contest", "title");

// // // //     if(!team){
// // // //         return res.status(404).json({message: "No teams found"});
// // // //     }

// // // //     return res.status(201).json({
// // // //         message: "My teams",
// // // //         team
// // // //     });
// // // // });

// // // // //get teams by contest
// // // // export const getTeamsByContest = asyncHandler(async(req,res)=>{
// // // //     const {contestId} = req.params;

// // // //     const team = await Team.find({contest: contestId })
// // // //     .populate("members", "name email")
// // // //     .populate("contest", "title");

// // // //     return res.status(201).json({
// // // //         message: "Teams by contest",
// // // //         team
// // // //     })
// // // // });

// // // // //delete team
// // // // export const deleteTeam = asyncHandler(async (req, res) => {

// // // //   const team = await Team.findById(req.params.id);

// // // //   if (!team) {
// // // //     return res.status(404).json({ message: "Team not found" });
// // // //   }

// // // //   if (team.leader.toString() !== req.user._id.toString()) {
// // // //     return res.status(403).json({ message: "Only leader can delete team" });
// // // //   }

// // // //   await team.deleteOne();

// // // //   res.json({ message: "Team deleted" });
// // // // });

// // // // console.log("Team Controller is working");

// // // import asyncHandler from "../middleware/asyncHandler.js";
// // // import { Team } from "../models/team.model.js";
// // // import { User } from "../models/user.model.js";


// // // // CREATE TEAM
// // // export const teamCreate = asyncHandler(async (req, res) => {
// // //   const { teamName, members, contest } = req.body;

// // //   if (!teamName || !contest) {
// // //     return res.status(400).json({
// // //       message: "Team name and contest are required"
// // //     });
// // //   }

// // //   // joining multiple teams in same contest
// // //   const existingTeam = await Team.findOne({
// // //     contest,
// // //     members: req.user._id
// // //   });

// // //   if (existingTeam) {
// // //     return res.status(400).json({
// // //       message: "You already joined a team in this contest"
// // //     });
// // //   }

// // //   // include creator + remove duplicates
// // //   const allMembers = [
// // //     ...new Set([req.user._id.toString(), ...(members || [])])
// // //   ];

// // //   // max team size
// // //   if (allMembers.length > 4) {
// // //     return res.status(400).json({
// // //       message: "Max 4 members allowed"
// // //     });
// // //   }

// // //   const team = await Team.create({
// // //     teamName,
// // //     members: allMembers,
// // //     contest  
// // //   });

// // //   res.status(201).json({
// // //     message: "Team created successfully",
// // //     team
// // //   });
// // // });


// // // // ADD MEMBER
// // // export const addMember = asyncHandler(async (req, res) => {
// // //   const { userId } = req.body;

// // //   const team = await Team.findById(req.params.id);
// // //   if (!team) {
// // //     return res.status(404).json({ message: "Team not found" });
// // //   }

// // //   //  must be existing member
// // //   const isMember = team.members.some(
// // //     m => m.toString() === req.user._id.toString()
// // //   );

// // //   if (!isMember) {
// // //     return res.status(403).json({
// // //       message: "Only team members can add users"
// // //     });
// // //   }

// // //   //  max size
// // //   if (team.members.length >= 4) {
// // //     return res.status(400).json({ message: "Team is full" });
// // //   }

// // //   //  check duplicate entry 
// // //   if (team.members.includes(userId)) {
// // //     return res.status(400).json({
// // //       message: "User already in team"
// // //     });
// // //   }

// // //   //  user already in another team
// // //   const alreadyInTeam = await Team.findOne({
// // //     contest: team.contest,
// // //     members: userId
// // //   });

// // //   if (alreadyInTeam) {
// // //     return res.status(400).json({
// // //       message: "User already in another team"
// // //     });
// // //   }

// // //   //  check user exists
// // //   const user = await User.findById(userId);
// // //   if (!user) {
// // //     return res.status(404).json({ message: "User not found" });
// // //   }

// // //   team.members.push(userId);
// // //   await team.save();

// // //   res.status(200).json({
// // //     message: "Member added successfully",
// // //     team
// // //   });
// // // });


// // // //  GET MY TEAMS
// // // export const getMyTeams = asyncHandler(async (req, res) => {
// // //   const teams = await Team.find({ members: req.user._id })
// // //     .populate("members", "name email")
// // //     .populate("contest", "title");

// // //   res.status(200).json({
// // //     message: "My teams",
// // //     teams
// // //   });
// // // });


// // // //  GET TEAMS BY CONTEST
// // // export const getTeamsByContest = asyncHandler(async (req, res) => {
// // //   const teams = await Team.find({ contest: req.params.contestId })
// // //     .populate("members", "name email");

// // //   res.status(200).json({
// // //     message: "Teams for this contest",
// // //     teams
// // //   });
// // // });


// // // //  DELETE TEAM (only creator)
// // // export const deleteTeam = asyncHandler(async (req, res) => {
// // //   const team = await Team.findById(req.params.id);

// // //   if (!team) {
// // //     return res.status(404).json({ message: "Team not found" });
// // //   }

// // //   //  only creator (first member)
// // //   if (team.members[0].toString() !== req.user._id.toString()) {
// // //     return res.status(403).json({
// // //       message: "Only team creator can delete team"
// // //     });
// // //   }

// // //   await team.deleteOne();

// // //   res.status(200).json({
// // //     message: "Team deleted successfully"
// // //   });
// // // });

// // // console.log("Team Controller is working");


// // import asyncHandler from "../middleware/asyncHandler.js";
// // import { Team } from "../models/team.model.js";
// // import { User } from "../models/user.model.js";
// // import { Contest, getContestStatus } from "../models/contest.model.js";
// // import { Participation } from "../models/participation.model.js"; // <-- NEW IMPORT
// // import { Invitation } from "../models/invitation.model.js";
// // import { sendEmail } from "../utils/sendEmail.js";
// // import { notifyAdminsAboutPendingTeam } from "../utils/teamApprovalAlerts.js";
// // import crypto from "crypto";

// // const normalizeInviteEmails = (emails = []) => [
// //   ...new Set(
// //     (Array.isArray(emails) ? emails : [])
// //       .map((email) => email?.toLowerCase().trim())
// //       .filter(Boolean)
// //   )
// // ];

// // const sendTeamInvitation = async ({ email, team, contestTitle, invitedBy }) => {
// //   const existingInvite = await Invitation.findOne({
// //     email,
// //     team: team._id,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() }
// //   });

// //   if (existingInvite) {
// //     return { sent: false, reason: "already-invited", email };
// //   }

// //   const inviteToken = crypto.randomBytes(32).toString("hex");
// //   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

// //   const invitation = await Invitation.create({
// //     email,
// //     team: team._id,
// //     invitedBy,
// //     token: inviteToken,
// //     tokenExpiry,
// //   });

// //   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
// //   const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

// //   const message = `
// //     <h2>You've been invited to join a team!</h2>
// //     <p><strong>Team Name:</strong> ${team.teamName}</p>
// //     <p><strong>Contest:</strong> ${contestTitle || "N/A"}</p>
// //     <p>Click the button below to accept the invitation. You must be logged in with this email to confirm.</p>
// //     <br/>
// //     <a href="${joinUrl}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;" clicktracking="off">
// //       Accept Invitation
// //     </a>
// //     <br/><br/>
// //     <p style="color:gray;font-size:12px;">If you did not expect this email, you can ignore it.</p>
// //   `;

// //   try {
// //     await sendEmail(email, `Invitation to join team "${team.teamName}"`, message);
// //     return { sent: true, email };
// //   } catch (error) {
// //     await invitation.deleteOne();
// //     throw error;
// //   }
// // };

// // // ==========================================
// // // CREATE TEAM
// // // ==========================================
// // export const teamCreate = asyncHandler(async (req, res) => {
// //   const { teamName, members, inviteEmails, contest } = req.body;

// //   if (!teamName || !contest) {
// //     return res.status(400).json({ message: "Team name and contest are required" });
// //   }

// //   const contestDoc = await Contest.findById(contest);
// //   if (!contestDoc) {
// //     return res.status(404).json({ message: "Contest not found" });
// //   }

// //   if (contestDoc.participationType === "solo") {
// //     return res.status(400).json({ message: "Teams cannot be created for solo-only contests" });
// //   }

// //   if (getContestStatus(contestDoc) === "completed") {
// //     return res.status(400).json({ message: "Contest deadline has passed." });
// //   }

// //   const normalizedTeamName = teamName.trim();
// //   const requestedInviteEmails = normalizeInviteEmails(
// //     inviteEmails ?? members
// //   ).filter((email) => email !== req.user.email?.toLowerCase());

// //   if (1 + requestedInviteEmails.length > contestDoc.maxTeamSize) {
// //     return res.status(400).json({
// //       message: `A team can have a maximum of ${contestDoc.maxTeamSize} members for this contest.`
// //     });
// //   }

// //   // CHANGE 1: Check if team name already exists for THIS contest
// //   const existingTeamName = await Team.findOne({ contest, teamName: normalizedTeamName });
// //   if (existingTeamName) {
// //     return res.status(400).json({ message: "Team name is already taken for this contest" });
// //   }

// //   // CHANGE 2: Check Participation collection instead of just Team collection
// //   const existingLeaderParticipation = await Participation.findOne({
// //     contest,
// //     user: req.user._id
// //   });

// //   if (existingLeaderParticipation) {
// //     return res.status(400).json({
// //       message: "You are already participating in this contest (solo or team)."
// //     });
// //   }

// //   // Create Team
// //   const team = await Team.create({
// //     teamName: normalizedTeamName,
// //     leader: req.user._id,
// //     members: [req.user._id],
// //     contest  
// //   });

// //   await Participation.create({
// //     user: req.user._id,
// //     contest,
// //     participationType: "team",
// //     team: team._id
// //   });

// //   const usersByEmail = await User.find({
// //     email: { $in: requestedInviteEmails }
// //   }).select("_id email");

// //   const participatingUsers = await Participation.find({
// //     contest,
// //     user: { $in: usersByEmail.map((user) => user._id) }
// //   }).populate("user", "email");

// //   const blockedEmails = new Set(
// //     participatingUsers
// //       .map((entry) => entry.user?.email?.toLowerCase())
// //       .filter(Boolean)
// //   );

// //   if (blockedEmails.size > 0) {
// //     await Participation.deleteOne({ team: team._id, user: req.user._id });
// //     await team.deleteOne();

// //     return res.status(400).json({
// //       message: `These users are already participating in this contest: ${Array.from(blockedEmails).join(", ")}`
// //     });
// //   }

// //   const inviteResults = [];

// //   for (const email of requestedInviteEmails) {
// //     try {
// //       inviteResults.push(
// //         await sendTeamInvitation({
// //           email,
// //           team,
// //           contestTitle: contestDoc.title,
// //           invitedBy: req.user._id
// //         })
// //       );
// //     } catch (error) {
// //       inviteResults.push({
// //         sent: false,
// //         email,
// //         reason: error.message
// //       });
// //     }
// //   }

// //   let adminNotification = { sent: false, recipients: [] };

// //   try {
// //     adminNotification = await notifyAdminsAboutPendingTeam({
// //       team,
// //       contest: contestDoc,
// //       leader: req.user,
// //       inviteEmails: requestedInviteEmails
// //     });
// //   } catch (error) {
// //     adminNotification = {
// //       sent: false,
// //       recipients: [],
// //       error: error.message
// //     };
// //   }

// //   res.status(201).json({
// //     message: "Team created successfully and is pending admin approval",
// //     team,
// //     invitations: inviteResults,
// //     adminNotification
// //   });
// // });


// // // ==========================================
// // // ADD MEMBER
// // // ==========================================
// // export const addMember = asyncHandler(async (req, res) => {
// //   const { userId } = req.body;

// //   const team = await Team.findById(req.params.id).populate("contest", "startDate deadline maxTeamSize isClosed");
// //   if (!team) return res.status(404).json({ message: "Team not found" });
// //   if (!team.contest) return res.status(404).json({ message: "Contest not found for this team" });
// //   if (team.status === "rejected") {
// //     return res.status(400).json({ message: "This team has been rejected by admin." });
// //   }

// //   const isMember = team.members.some(
// //     m => m.toString() === req.user._id.toString()
// //   );

// //   if (!isMember) {
// //     return res.status(403).json({ message: "Only team members can add users" });
// //   }

// //   if (getContestStatus(team.contest) === "completed") {
// //     return res.status(400).json({ message: "Contest deadline has passed." });
// //   }

// //   if (team.members.length >= team.contest.maxTeamSize) {
// //     return res.status(400).json({
// //       message: `Team is full (max ${team.contest.maxTeamSize} members)`
// //     });
// //   }

// //   // Check user exists
// //   const user = await User.findById(userId);
// //   if (!user) return res.status(404).json({ message: "User not found" });

// //   // CHANGE 4: Check if the user is already participating in ANY way
// //   const alreadyParticipating = await Participation.findOne({
// //     contest: team.contest._id,
// //     user: userId
// //   });

// //   if (alreadyParticipating) {
// //     return res.status(400).json({ message: "User is already participating in this contest." });
// //   }

// //   // Update Team
// //   team.members.push(userId);
// //   await team.save();

// //   // CHANGE 5: Create Participation record for the new member
// //   await Participation.create({
// //     user: userId,
// //     contest: team.contest._id,
// //     participationType: "team",
// //     team: team._id
// //   });

// //   res.status(200).json({ message: "Member added successfully", team });
// // });


// // // ==========================================
// // // GET MY TEAMS
// // // ==========================================
// // export const getMyTeams = asyncHandler(async (req, res) => {
// //   const teams = await Team.find({ members: req.user._id })
// //     .populate("members", "name email")
// //     .populate("contest", "title");

// //   res.status(200).json({ message: "My teams", teams });
// // });


// // // ==========================================
// // // GET TEAMS BY CONTEST
// // // ==========================================
// // export const getTeamsByContest = asyncHandler(async (req, res) => {
// //   const teams = await Team.find({ contest: req.params.contestId })
// //     .populate("members", "name email");

// //   res.status(200).json({ message: "Teams for this contest", teams });
// // });


// // // ==========================================
// // // DELETE TEAM
// // // ==========================================
// // export const deleteTeam = asyncHandler(async (req, res) => {
// //   const team = await Team.findById(req.params.id);

// //   if (!team) return res.status(404).json({ message: "Team not found" });

// //   const teamOwner = team.leader || team.members[0];
// //   if (!teamOwner || teamOwner.toString() !== req.user._id.toString()) {
// //     return res.status(403).json({ message: "Only team creator can delete team" });
// //   }

// //   // CHANGE 6: Clean up the Participation collection before deleting the team
// //   await Participation.deleteMany({ team: team._id });
// //   await Invitation.deleteMany({ team: team._id });
  
// //   // Now delete the team
// //   await team.deleteOne();

// //   res.status(200).json({ message: "Team deleted successfully" });
// // });


// // // UPDATE TEAM STATUS (ADMIN ONLY)

// // export const updateTeamStatus = asyncHandler(async (req, res) => {
// //   const { status } = req.body;
// //   const validStatuses = ["pending", "approved", "rejected"];
// //   if (!validStatuses.includes(status)) {
// //     return res.status(400).json({ message: "Invalid status" });
// //   }

// //   const team = await Team.findById(req.params.id);
// //   if (!team) return res.status(404).json({ message: "Team not found" });

// //   const previousStatus = team.status;
// //   team.status = status;
// //   await team.save();

// //   if (status === "approved" && previousStatus !== "approved") {
// //     const existingParticipations = await Participation.find({
// //       contest: team.contest,
// //       user: { $in: team.members }
// //     }).select("user");

// //     const existingUserIds = new Set(
// //       existingParticipations.map((entry) => entry.user.toString())
// //     );

// //     const missingMembers = team.members.filter(
// //       (memberId) => !existingUserIds.has(memberId.toString())
// //     );

// //     if (missingMembers.length > 0) {
// //       await Participation.insertMany(
// //         missingMembers.map((memberId) => ({
// //           user: memberId,
// //           contest: team.contest,
// //           participationType: "team",
// //           team: team._id
// //         }))
// //       );
// //     }
// //   }

// //   if (status === "rejected" && previousStatus !== "rejected") {
// //     await Participation.deleteMany({ team: team._id });
// //     await Invitation.updateMany(
// //       { team: team._id, status: "pending" },
// //       { status: "rejected" }
// //     );
// //   }

// //   res.status(200).json({ message: `Team status updated to ${status}`, team });
// // });

// // export const getPendingTeams = asyncHandler(async (req, res) => {
// //   const teams = await Team.find({ status: "pending" })
// //     .populate("leader", "name email")
// //     .populate("members", "name email")
// //     .populate("contest", "title participationType maxTeamSize startDate deadline")
// //     .sort({ createdAt: -1 });

// //   res.status(200).json({
// //     message: "Pending teams fetched successfully",
// //     count: teams.length,
// //     teams
// //   });
// // });


// // // INVITE MEMBER VIA EMAIL

// // export const inviteMember = asyncHandler(async (req, res) => {
// //   const { email } = req.body;
// //   const normalizedEmail = email?.toLowerCase().trim();

// //   if (!normalizedEmail) {
// //     return res.status(400).json({ message: "Email is required" });
// //   }

// //   const team = await Team.findById(req.params.id).populate("contest", "title startDate deadline maxTeamSize isClosed");
// //   if (!team) return res.status(404).json({ message: "Team not found" });
// //   if (!team.contest) return res.status(404).json({ message: "Contest not found for this team" });
// //   if (team.status === "rejected") {
// //     return res.status(400).json({ message: "This team has been rejected by admin." });
// //   }

// //   // Only team members can invite
// //   const isMember = team.members.some(
// //     m => m.toString() === req.user._id.toString()
// //   );
// //   if (!isMember) {
// //     return res.status(403).json({ message: "Only team members can invite users" });
// //   }

// //   if (getContestStatus(team.contest) === "completed") {
// //     return res.status(400).json({ message: "Contest deadline has passed." });
// //   }

// //   const pendingInvitations = await Invitation.countDocuments({
// //     team: team._id,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() }
// //   });

// //   // Team is full check (pending invitations + current members)
// //   if (team.members.length + pendingInvitations >= team.contest.maxTeamSize) {
// //     return res.status(400).json({
// //       message: `Team is full (max ${team.contest.maxTeamSize} members)`
// //     });
// //   }

// //   //  Check if the invited email already belongs to a team member
// //   const invitedUser = await User.findOne({ email: normalizedEmail });
// //   if (invitedUser) {
// //     const alreadyMember = team.members.some(
// //       m => m.toString() === invitedUser._id.toString()
// //     );
// //     if (alreadyMember) {
// //       return res.status(400).json({ message: "This user is already a member of the team" });
// //     }

// //     // Check if they are already participating in this contest
// //     const alreadyParticipating = await Participation.findOne({
// //       contest: team.contest._id,
// //       user: invitedUser._id
// //     });
// //     if (alreadyParticipating) {
// //       return res.status(400).json({ message: "This user is already participating in this contest" });
// //     }
// //   }

// //   // Check if a pending invitation for this email already exists for this team (and not expired)
// //   const existingInvite = await Invitation.findOne({
// //     email: normalizedEmail,
// //     team: team._id,
// //     status: "pending",
// //     tokenExpiry: { $gt: new Date() }  // only block if the existing invite is still valid
// //   });
// //   if (existingInvite) {
// //     return res.status(400).json({ message: "An invitation has already been sent to this email" });
// //   }

// //   // Generate a secure invitation token
// //   const inviteToken = crypto.randomBytes(32).toString("hex");

// //   // Set 48-hour expiry
// //   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

// //   // Create the invitation record
// //   const invitation = await Invitation.create({
// //     email: normalizedEmail,
// //     team: team._id,
// //     invitedBy: req.user._id,
// //     token: inviteToken,
// //     tokenExpiry,
// //   });

// //   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
// //   const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

// //   const message = `
// //     <h2>🎉 You've been invited to join a team!</h2>
// //     <p><strong>Team Name:</strong> ${team.teamName}</p>
// //     <p><strong>Contest:</strong> ${team.contest?.title || "N/A"}</p>
// //     <p>Click the button below to accept the invitation. You must be logged in with this email to confirm.</p>
// //     <br/>
// //     <a href="${joinUrl}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;" clicktracking="off">
// //       Accept Invitation
// //     </a>
// //     <br/><br/>
// //     <p style="color:gray;font-size:12px;">If you did not expect this email, you can ignore it.</p>
// //   `;

// //   try {
// //     await sendEmail(normalizedEmail, `Invitation to join team "${team.teamName}"`, message);
// //     res.status(200).json({ message: `Invitation sent successfully to ${normalizedEmail}` });
// //   } catch (error) {
  
// //     await invitation.deleteOne();
// //     return res.status(500).json({ message: "Email could not be sent", error: error.message });
// //   }
// // });

// // // CONFIRM EMAIL INVITATION

// // export const confirmInvitation = asyncHandler(async (req, res) => {
// //   const { token } = req.params;

// //   // Find the pending invitation by token
// //   const invitation = await Invitation.findOne({ token, status: "pending" });
// //   if (!invitation) {
// //     return res.status(400).json({ message: "Invalid or already used invitation token" });
// //   }

// //   // Check if token has expired (48-hour window)
// //   if (invitation.tokenExpiry && invitation.tokenExpiry < new Date()) {
// //     return res.status(400).json({ message: "This invitation link has expired. Please ask the team to send a new invite." });
// //   }

// //   // The logged-in user's email must match the invited email
// //   if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
// //     return res.status(403).json({ message: "This invitation was not sent to your email address" });
// //   }

// //   const team = await Team.findById(invitation.team).populate("contest", "startDate deadline maxTeamSize isClosed");
// //   if (!team) {
// //     return res.status(404).json({ message: "Team no longer exists" });
// //   }
// //   if (!team.contest) {
// //     return res.status(404).json({ message: "Contest not found for this team" });
// //   }
// //   if (team.status === "rejected") {
// //     return res.status(400).json({ message: "This team has been rejected by admin." });
// //   }

// //   if (getContestStatus(team.contest) === "completed") {
// //     return res.status(400).json({ message: "Contest deadline has passed." });
// //   }

// //   if (team.members.length >= team.contest.maxTeamSize) {
// //     return res.status(400).json({
// //       message: `Team is already full (max ${team.contest.maxTeamSize} members)`
// //     });
// //   }

// //   const alreadyInTeam = team.members.some(
// //     m => m.toString() === req.user._id.toString()
// //   );

// //   if (alreadyInTeam) {
// //     return res.status(400).json({ message: "You are already a member of this team" });
// //   }

// //   // Check if user is already participating in this contest in any way
// //   const alreadyParticipating = await Participation.findOne({
// //     contest: team.contest._id,
// //     user: req.user._id
// //   });
// //   if (alreadyParticipating) {
// //     return res.status(400).json({ message: "You are already participating in this contest" });
// //   }

// //   const userId = req.user._id;

// //   // Add user to the team
// //   team.members.push(userId);
// //   await team.save();

// //   // Create a Participation record
// //   await Participation.create({
// //     user: userId,
// //     contest: team.contest._id,
// //     participationType: "team",
// //     team: team._id
// //   });

// //   // Mark the invitation as accepted
// //   invitation.status = "accepted";
// //   await invitation.save();

// //   res.status(200).json({
// //     message: "Invitation accepted! You are now a member of the team.",
// //     team
// //   });
// // });

// // // GET MY PENDING INVITATIONS

// // export const getMyInvitations = asyncHandler(async (req, res) => {

// //   // req.user.email is already available from JWT — no extra DB call needed
// //   const userEmail = req.user.email?.toLowerCase();
// //   if (!userEmail) {
// //     return res.status(400).json({ message: "Email not found in token. Please login again." });
// //   }

// //   const invitations = await Invitation.find({ email: userEmail, status: "pending" })
// //     .populate({
// //       path: "team",
// //       select: "teamName status members",
// //       populate: [
// //         { path: "contest", select: "title startDate deadline" },
// //         { path: "members", select: "name email" }
// //       ]
// //     })
// //     .sort({ createdAt: -1 }); 

// //   res.status(200).json({
// //     message: "My pending invitations",
// //     count: invitations.length,
// //     invitations
// //   });
// // });

// // console.log("Team Controller is working");


// import asyncHandler from "../middleware/asyncHandler.js";
// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";
// import { Invitation } from "../models/invitation.model.js";
// import { sendEmail } from "../utils/sendEmail.js";
// import crypto from "crypto";

// const normalizeInviteEmails = (emails = []) => [
//   ...new Set(
//     (Array.isArray(emails) ? emails : [])
//       .map((email) => email?.toLowerCase().trim())
//       .filter(Boolean)
//   )
// ];

// // ==========================================
// // CREATE TEAM
// // ==========================================
// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, contest, inviteEmails = [] } = req.body;

//   if (!teamName || !contest) {
//     return res.status(400).json({
//       message: "Team name and contest are required"
//     });
//   }

//   const contestDoc = await Contest.findById(contest);
//   if (!contestDoc) {
//     return res.status(404).json({ message: "Contest not found" });
//   }

//   if (contestDoc.participationType === "solo") {
//     return res.status(400).json({
//       message: "Teams cannot be created for solo-only contests"
//     });
//   }

//   if (getContestStatus(contestDoc) === "completed") {
//     return res.status(400).json({
//       message: "Contest deadline has passed."
//     });
//   }

//   const normalizedTeamName = teamName.trim();

//   const existingTeamName = await Team.findOne({
//     contest,
//     teamName: normalizedTeamName
//   });

//   if (existingTeamName) {
//     return res.status(400).json({
//       message: "Team name is already taken for this contest"
//     });
//   }

//   const existingParticipation = await Participation.findOne({
//     contest,
//     user: req.user._id
//   });

//   if (existingParticipation) {
//     return res.status(400).json({
//       message: "You are already participating in this contest"
//     });
//   }

//   const normalizedEmails = normalizeInviteEmails(inviteEmails).filter(
//     (email) => email !== req.user.email?.toLowerCase()
//   );

//   if (normalizedEmails.length + 1 > contestDoc.maxTeamSize) {
//     return res.status(400).json({
//       message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`
//     });
//   }

//   const usersByEmail = await User.find({
//     email: { $in: normalizedEmails }
//   }).select("_id email");

//   const participatingUsers = await Participation.find({
//     contest,
//     user: { $in: usersByEmail.map((u) => u._id) }
//   }).populate("user", "email");

//   const blockedEmails = participatingUsers
//     .map((entry) => entry.user?.email?.toLowerCase())
//     .filter(Boolean);

//   if (blockedEmails.length > 0) {
//     return res.status(400).json({
//       message: `These users are already participating: ${blockedEmails.join(", ")}`
//     });
//   }

//   const team = await Team.create({
//     teamName: normalizedTeamName,
//     leader: req.user._id,
//     members: [req.user._id],
//     contest,
//     status: "pending"
//   });

//   await Participation.create({
//     user: req.user._id,
//     contest,
//     participationType: "team",
//     team: team._id
//   });

//   const inviteResults = [];

//   for (const email of normalizedEmails) {
//     const existingInvite = await Invitation.findOne({
//       email,
//       team: team._id,
//       status: "pending",
//       tokenExpiry: { $gt: new Date() }
//     });

//     if (existingInvite) {
//       inviteResults.push({
//         email,
//         sent: false,
//         reason: "already invited"
//       });
//       continue;
//     }

//     const inviteToken = crypto.randomBytes(32).toString("hex");
//     const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

//     const invitation = await Invitation.create({
//       email,
//       team: team._id,
//       invitedBy: req.user._id,
//       token: inviteToken,
//       tokenExpiry
//     });

//     const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
//     const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

//     const html = `
//       <h2>You have been invited to join a team</h2>
//       <p><strong>Team:</strong> ${team.teamName}</p>
//       <p><strong>Contest:</strong> ${contestDoc.title}</p>
//       <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">
//         Accept Invitation
//       </a>
//     `;

//     try {
//       await sendEmail(email, `Invitation to join ${team.teamName}`, html);
//       inviteResults.push({
//         email,
//         sent: true
//       });
//     } catch (error) {
//       await invitation.deleteOne();
//       inviteResults.push({
//         email,
//         sent: false,
//         reason: error.message
//       });
//     }
//   }

//   return res.status(201).json({
//     message: "Team created successfully",
//     team,
//     invitations: inviteResults
//   });
// });

// // ==========================================
// // INVITE MEMBER
// // ==========================================
// export const inviteMember = asyncHandler(async (req, res) => {
//   const { email } = req.body;
//   const normalizedEmail = email?.toLowerCase().trim();

//   if (!normalizedEmail) {
//     return res.status(400).json({ message: "Email is required" });
//   }

//   const team = await Team.findById(req.params.id).populate(
//     "contest",
//     "title startDate deadline maxTeamSize participationType"
//   );

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   const isMember = team.members.some(
//     (m) => m.toString() === req.user._id.toString()
//   );

//   if (!isMember) {
//     return res.status(403).json({
//       message: "Only team members can invite users"
//     });
//   }

//   if (getContestStatus(team.contest) === "completed") {
//     return res.status(400).json({
//       message: "Contest deadline has passed."
//     });
//   }

//   const pendingInvitations = await Invitation.countDocuments({
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() }
//   });

//   if (team.members.length + pendingInvitations >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       message: `Team is full (max ${team.contest.maxTeamSize} members)`
//     });
//   }

//   const invitedUser = await User.findOne({ email: normalizedEmail });

//   if (invitedUser) {
//     const alreadyParticipating = await Participation.findOne({
//       contest: team.contest._id,
//       user: invitedUser._id
//     });

//     if (alreadyParticipating) {
//       return res.status(400).json({
//         message: "This user is already participating in this contest"
//       });
//     }
//   }

//   const existingInvite = await Invitation.findOne({
//     email: normalizedEmail,
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() }
//   });

//   if (existingInvite) {
//     return res.status(400).json({
//       message: "Invitation already sent to this email"
//     });
//   }

//   const inviteToken = crypto.randomBytes(32).toString("hex");
//   const tokenExpiry = new Date(Date.now() + 1 * 60 * 60 * 1000);

//   const invitation = await Invitation.create({
//     email: normalizedEmail,
//     team: team._id,
//     invitedBy: req.user._id,
//     token: inviteToken,
//     tokenExpiry
//   });

//   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
//   const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

//   const html = `
//     <h2>You have been invited to join a team</h2>
//     <p><strong>Team:</strong> ${team.teamName}</p>
//     <p><strong>Contest:</strong> ${team.contest.title}</p>
//     <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;">
//       Accept Invitation
//     </a>
//   `;

//   try {
//     await sendEmail(normalizedEmail, `Invitation to join ${team.teamName}`, html);

//     return res.status(200).json({
//       message: `Invitation sent successfully to ${normalizedEmail}`
//     });
//   } catch (error) {
//     await invitation.deleteOne();

//     return res.status(500).json({
//       message: "Email could not be sent",
//       error: error.message
//     });
//   }
// });

// // ==========================================
// // CONFIRM INVITATION
// // ==========================================
// export const confirmInvitation = asyncHandler(async (req, res) => {
//   const { token } = req.params;

//   const invitation = await Invitation.findOne({
//     token,
//     status: "pending"
//   });

//   if (!invitation) {
//     return res.status(400).json({
//       message: "Invalid or already used invitation token"
//     });
//   }

//   if (invitation.tokenExpiry < new Date()) {
//     return res.status(400).json({
//       message: "Invitation link has expired"
//     });
//   }

//   if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
//     return res.status(403).json({
//       message: "This invitation was not sent to your email"
//     });
//   }

//   const team = await Team.findById(invitation.team).populate(
//     "contest",
//     "title startDate deadline maxTeamSize"
//   );

//   if (!team) {
//     return res.status(404).json({ message: "Team no longer exists" });
//   }

//   if (getContestStatus(team.contest) === "completed") {
//     return res.status(400).json({
//       message: "Contest deadline has passed."
//     });
//   }

//   if (team.members.length >= team.contest.maxTeamSize) {
//     return res.status(400).json({
//       message: `Team is already full (max ${team.contest.maxTeamSize} members)`
//     });
//   }

//   const alreadyParticipating = await Participation.findOne({
//     contest: team.contest._id,
//     user: req.user._id
//   });

//   if (alreadyParticipating) {
//     return res.status(400).json({
//       message: "You are already participating in this contest"
//     });
//   }

//   team.members.push(req.user._id);
//   await team.save();

//   await Participation.create({
//     user: req.user._id,
//     contest: team.contest._id,
//     participationType: "team",
//     team: team._id
//   });

//   invitation.status = "accepted";
//   await invitation.save();

//   return res.status(200).json({
//     message: "Invitation accepted successfully",
//     team
//   });
// });

// // ==========================================
// // GET MY INVITATIONS
// // ==========================================
// export const getMyInvitations = asyncHandler(async (req, res) => {
//   const userEmail = req.user.email?.toLowerCase();

//   if (!userEmail) {
//     return res.status(400).json({
//       message: "Email not found in token. Please login again."
//     });
//   }

//   const invitations = await Invitation.find({
//     email: userEmail,
//     status: "pending"
//   })
//     .populate({
//       path: "team",
//       select: "teamName status members contest",
//       populate: [
//         { path: "members", select: "name email" },
//         { path: "contest", select: "title startDate deadline" }
//       ]
//     })
//     .sort({ createdAt: -1 });

//   return res.status(200).json({
//     message: "My pending invitations",
//     count: invitations.length,
//     invitations
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
//     message: "My teams",
//     teams
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
//     message: "Teams for this contest",
//     teams
//   });
// });

// // ==========================================
// // DELETE TEAM
// // ==========================================
// export const deleteTeam = asyncHandler(async (req, res) => {
//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       message: "Only team leader can delete this team"
//     });
//   }

//   await Participation.deleteMany({ team: team._id });
//   await Invitation.deleteMany({ team: team._id });
//   await team.deleteOne();

//   return res.status(200).json({
//     message: "Team deleted successfully"
//   });
// });

// // ==========================================
// // UPDATE TEAM STATUS
// // ==========================================
// export const updateTeamStatus = asyncHandler(async (req, res) => {
//   const { status } = req.body;

//   if (!["pending", "approved", "rejected"].includes(status)) {
//     return res.status(400).json({ message: "Invalid status" });
//   }

//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
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
//     message: `Team status updated to ${status}`,
//     team
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
//     message: "Pending teams fetched successfully",
//     count: teams.length,
//     teams
//   });
// });




import asyncHandler from "../middleware/asyncHandler.js";
import crypto from "crypto";
import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import { Invitation } from "../models/invitation.model.js";
import { sendEmail } from "../utils/sendEmail.js";

const normalizeInviteEmails = (emails = []) => [
  ...new Set(
    (Array.isArray(emails) ? emails : [])
      .map((email) => email?.toLowerCase().trim())
      .filter(Boolean)
  ),
];

// ==========================================
// CREATE TEAM
// ==========================================
export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, contest, inviteEmails = [] } = req.body;

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

  const normalizedEmails = normalizeInviteEmails(inviteEmails).filter(
    (email) => email !== req.user.email?.toLowerCase()
  );

  if (normalizedEmails.length + 1 > contestDoc.maxTeamSize) {
    return res.status(400).json({
      success: false,
      message: `A team can have a maximum of ${contestDoc.maxTeamSize} members`,
    });
  }

  const usersByEmail = await User.find({
    email: { $in: normalizedEmails },
  }).select("_id email");

  const participatingUsers = await Participation.find({
    contest,
    user: { $in: usersByEmail.map((u) => u._id) },
  }).populate("user", "email");

  const blockedEmails = participatingUsers
    .map((entry) => entry.user?.email?.toLowerCase())
    .filter(Boolean);

  if (blockedEmails.length > 0) {
    return res.status(400).json({
      success: false,
      message: `These users are already participating: ${blockedEmails.join(", ")}`,
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

  for (const email of normalizedEmails) {
    const existingInvite = await Invitation.findOne({
      email,
      team: team._id,
      status: "pending",
      tokenExpiry: { $gt: new Date() },
    });

    if (existingInvite) {
      inviteResults.push({
        email,
        sent: false,
        reason: "already invited",
      });
      continue;
    }

    const inviteToken = crypto.randomBytes(32).toString("hex");
    const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // 48 hours

    const invitation = await Invitation.create({
      email,
      team: team._id,
      invitedBy: req.user._id,
      token: inviteToken,
      tokenExpiry,
    });

    const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
    const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

    const html = `
      <h2>You have been invited to join a team</h2>
      <p><strong>Team:</strong> ${team.teamName}</p>
      <p><strong>Contest:</strong> ${contestDoc.title}</p>
      <p>Please login with the invited email first, then accept invitation.</p>
      <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
        Accept Invitation
      </a>
    `;

    try {
      await sendEmail(email, `Invitation to join ${team.teamName}`, html);
      inviteResults.push({
        email,
        sent: true,
      });
    } catch (error) {
      await invitation.deleteOne();
      inviteResults.push({
        email,
        sent: false,
        reason: error.message,
      });
    }
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
  const { email } = req.body;
  const normalizedEmail = email?.toLowerCase().trim();

  if (!normalizedEmail) {
    return res.status(400).json({
      success: false,
      message: "Email is required",
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

  const invitedUser = await User.findOne({ email: normalizedEmail });

  if (invitedUser) {
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
  }

  const existingInvite = await Invitation.findOne({
    email: normalizedEmail,
    team: team._id,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  });

  if (existingInvite) {
    return res.status(400).json({
      success: false,
      message: "Invitation already sent to this email",
    });
  }

  const inviteToken = crypto.randomBytes(32).toString("hex");
  const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000); // fixed to 48 hours

  const invitation = await Invitation.create({
    email: normalizedEmail,
    team: team._id,
    invitedBy: req.user._id,
    token: inviteToken,
    tokenExpiry,
  });

  const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
  const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

  const html = `
    <h2>You have been invited to join a team</h2>
    <p><strong>Team:</strong> ${team.teamName}</p>
    <p><strong>Contest:</strong> ${team.contest.title}</p>
    <p>Please login with the invited email first, then accept invitation.</p>
    <a href="${joinUrl}" style="background:#4f46e5;color:#fff;padding:10px 18px;text-decoration:none;border-radius:6px;display:inline-block;margin-top:10px;">
      Accept Invitation
    </a>
  `;

  try {
    await sendEmail(normalizedEmail, `Invitation to join ${team.teamName}`, html);

    return res.status(200).json({
      success: true,
      message: `Invitation sent successfully to ${normalizedEmail}`,
    });
  } catch (error) {
    await invitation.deleteOne();

    return res.status(500).json({
      success: false,
      message: "Email could not be sent",
      error: error.message,
    });
  }
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

  if (req.user.email.toLowerCase() !== invitation.email.toLowerCase()) {
    return res.status(403).json({
      success: false,
      message: "This invitation was not sent to your email",
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
  const userEmail = req.user.email?.toLowerCase();

  if (!userEmail) {
    return res.status(400).json({
      success: false,
      message: "Email not found in token. Please login again.",
    });
  }

  const invitations = await Invitation.find({
    email: userEmail,
    status: "pending",
    tokenExpiry: { $gt: new Date() },
  })
    .populate({
      path: "team",
      select: "teamName status members contest",
      populate: [
        { path: "members", select: "name email" },
        { path: "contest", select: "title startDate deadline" },
      ],
    })
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
    .populate("members", "name email")
    .populate("contest", "title startDate deadline");

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
    .populate("members", "name email");

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

  team.status = status;
  await team.save();

  if (status === "rejected") {
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