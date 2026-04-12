

// import asyncHandler from "../middleware/asyncHandler.js";
// import { Contest, getContestStatus } from "../models/contest.model.js";
// import { Participation } from "../models/participation.model.js";
// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";
// import { Invitation } from "../models/invitation.model.js";
// import { sendEmail } from "../utils/sendEmail.js";
// import { notifyAdminsAboutPendingTeam } from "../utils/teamApprovalAlerts.js";
// import crypto from "crypto";

// const normalizeInviteEmails = (emails = []) => [
//   ...new Set(
//     (Array.isArray(emails) ? emails : [])
//       .map((email) => email?.toLowerCase().trim())
//       .filter(Boolean)
//   )
// ];

// const sendTeamInvitation = async ({ email, team, contestTitle, invitedBy }) => {
//   const existingInvite = await Invitation.findOne({
//     email,
//     team: team._id,
//     status: "pending",
//     tokenExpiry: { $gt: new Date() }
//   });

//   if (existingInvite) {
//     return { sent: false, reason: "already-invited", email };
//   }

//   const inviteToken = crypto.randomBytes(32).toString("hex");
//   const tokenExpiry = new Date(Date.now() + 48 * 60 * 60 * 1000);

//   const invitation = await Invitation.create({
//     email,
//     team: team._id,
//     invitedBy,
//     token: inviteToken,
//     tokenExpiry,
//   });

//   const frontendUrl = process.env.FRONTEND_URL || "http://localhost:5173";
//   const joinUrl = `${frontendUrl}/invite/confirm/${inviteToken}`;

//   const message = `
//     <h2>You've been invited to join a team!</h2>
//     <p><strong>Team Name:</strong> ${team.teamName}</p>
//     <p><strong>Contest:</strong> ${contestTitle || "N/A"}</p>
//     <p>Click the button below to accept the invitation. You must be logged in with this email to confirm.</p>
//     <br/>
//     <a href="${joinUrl}" style="background:#4f46e5;color:white;padding:10px 20px;text-decoration:none;border-radius:5px;" clicktracking="off">
//       Accept Invitation
//     </a>
//     <br/><br/>
//     <p style="color:gray;font-size:12px;">If you did not expect this email, you can ignore it.</p>
//   `;

//   try {
//     await sendEmail(email, `Invitation to join team "${team.teamName}"`, message);
//     return { sent: true, email };
//   } catch (error) {
//     await invitation.deleteOne();
//     throw error;
//   }
// };

// // ==========================================
// // 1. JOIN AS SOLO
// // ==========================================
// export const joinContestSolo = async (req, res) => {
//   try {
//     const { contestId } = req.params;
//     const userId = req.user._id; 

//     // 1. Check if contest exists and is still open
//     const contest = await Contest.findById(contestId);
//     if (!contest) return res.status(404).json({ message: "Contest not found" });
    
//     if (getContestStatus(contest) === "completed") {
//       return res.status(400).json({ message: "Contest deadline has passed." });
//     }

//     if (contest.participationType === 'team') {
//       return res.status(400).json({ message: "This is a team contest. You must join by creating a team." });
//     }

//     // 2. Check if user is already participating (Solo OR Team)
//     // Thanks to the new schema, we only need to check one collection!
//     const existingParticipation = await Participation.findOne({ 
//       user: userId, 
//       contest: contestId 
//     });
    
//     if (existingParticipation) {
//       return res.status(400).json({ 
//         message: `You are already participating in this contest as a ${existingParticipation.participationType}.` 
//       });
//     }

//     // 3. Create Solo Participation
//     const participation = await Participation.create({
//       user: userId,
//       contest: contestId,
//       participationType: "solo"
//     });

//     return res.status(201).json({ 
//       message: "Joined contest successfully as a solo participant", 
//       participation 
//     });

//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };


// // ==========================================
// // 2. JOIN AS A TEAM
// // ==========================================

// // export const joinContestTeam = async (req, res) => {
// //   try {
// //     const { contestId } = req.params;
// //     // CHANGE 1: Expect an array of emails instead of memberIds
// //     const { teamName, memberEmails = [] } = req.body; 
// //     const userId = req.user._id;

    
// //     // 1. Search the database for all provided emails
// //     const foundUsers = await User.find({ email: { $in: memberEmails } });
    
// //     // 2. Extract the emails that were actually found in the DB
// //     const foundEmails = foundUsers.map(user => user.email);
    
// //     // 3. Find which emails are missing (provided by user, but not in DB)
// //     const missingEmails = memberEmails.filter(email => !foundEmails.includes(email));

// //     // 4. If any emails are missing, block the team creation
// //     if (missingEmails.length > 0) {
// //       return res.status(400).json({ 
// //         message: `Cannot create team. The following users must register an account first: ${missingEmails.join(", ")}` 
// //       });
// //     }

// //     // 5. If all emails exist, extract their ObjectIds
// //     const memberIds = foundUsers.map(user => user._id.toString());

// //     // ==========================================

// //     // Combine the creator's ID with the invited members and remove duplicates
// //     const allMembers = [...new Set([...memberIds, userId.toString()])];

// //     // Optional but recommended: Check team size (e.g., max 4 members)
// //     if (allMembers.length > 4) {
// //       return res.status(400).json({ message: "A team can have a maximum of 4 members." });
// //     }

// //     // 1. Check if contest exists and is open
// //     const contest = await Contest.findById(contestId);
// //     if (!contest) return res.status(404).json({ message: "Contest not found" });
    
// //     if (new Date(contest.deadline) < new Date()) {
// //       return res.status(400).json({ message: "Contest deadline has passed." });
// //     }

// //     // 2. Check if the team name is already taken for THIS contest
// //     const existingTeamName = await Team.findOne({ contest: contestId, teamName });
// //     if (existingTeamName) {
// //       return res.status(400).json({ message: "This team name is already taken for this contest." });
// //     }

// //     // 3. Check if ANY of the members are already participating (Solo or Team)
// //     const existingParticipants = await Participation.find({
// //       contest: contestId,
// //       user: { $in: allMembers }
// //     }).populate("user", "name"); 

// //     if (existingParticipants.length > 0) {
// //       const duplicateNames = existingParticipants.map(p => p.user.name).join(", ");
// //       return res.status(400).json({ 
// //         message: `Cannot create team. The following users are already participating in this contest: ${duplicateNames}` 
// //       });
// //     }

// //     // 4. Create the Team document
// //     const newTeam = await Team.create({
// //       teamName,
// //       members: allMembers,
// //       contest: contestId
// //     });

// //     // 5. Create a Participation document for EACH member
// //     const participationDocs = allMembers.map((memberId) => ({
// //       user: memberId,
// //       contest: contestId,
// //       participationType: "team",
// //       team: newTeam._id
// //     }));

// //     await Participation.insertMany(participationDocs);

// //     return res.status(201).json({ 
// //       message: "Team created and registered successfully", 
// //       team: newTeam 
// //     });

// //   } catch (error) {
// //     return res.status(500).json({ error: error.message });
// //   }
// // };

// export const joinContestTeam = async (req, res) => {
//   try {
//     const { contestId } = req.params;
//     const {
//       teamName,
//       members = [],
//       inviteEmails = [],
//       memberEmails = []
//     } = req.body;
//     const userId = req.user._id;
//     const normalizedTeamName = teamName?.trim();
//     const requestedInviteEmails =
//       Array.isArray(inviteEmails) && inviteEmails.length > 0
//         ? inviteEmails
//         : Array.isArray(memberEmails) && memberEmails.length > 0
//           ? memberEmails
//           : members;
//     const normalizedMembers = normalizeInviteEmails(requestedInviteEmails).filter(
//       (email) => email !== req.user.email?.toLowerCase()
//     );

//     if (!normalizedTeamName) {
//       return res.status(400).json({ message: "Team name is required." });
//     }

//     // 1. Check if contest exists and is open
//     const contest = await Contest.findById(contestId);
//     if (!contest) return res.status(404).json({ message: "Contest not found" });
    
//     if (getContestStatus(contest) === "completed") {
//       return res.status(400).json({ message: "Contest deadline has passed." });
//     }

//     if (contest.participationType === 'solo') {
//       return res.status(400).json({ message: "This is a solo contest. You cannot join as a team." });
//     }

//     // Check team size against contest specification
//     if (normalizedMembers.length + 1 > contest.maxTeamSize) {
//       return res.status(400).json({ message: `A team can have a maximum of ${contest.maxTeamSize} members for this contest.` });
//     }

//     // 2. Check if the team name is already taken for THIS contest
//     const existingTeamName = await Team.findOne({
//       contest: contestId,
//       teamName: normalizedTeamName
//     });
//     if (existingTeamName) {
//       return res.status(400).json({ message: "This team name is already taken for this contest." });
//     }

//     const existingLeaderParticipation = await Participation.findOne({
//       contest: contestId,
//       user: userId
//     });

//     if (existingLeaderParticipation) {
//       return res.status(400).json({
//         message: "You are already participating in this contest."
//       });
//     }

//     const usersByEmail = await User.find({
//       email: { $in: normalizedMembers }
//     }).select("_id email");

//     const participatingUsers = await Participation.find({
//       contest: contestId,
//       user: { $in: usersByEmail.map((user) => user._id) }
//     }).populate("user", "email");

//     const blockedEmails = participatingUsers
//       .map((entry) => entry.user?.email?.toLowerCase())
//       .filter(Boolean);

//     if (blockedEmails.length > 0) {
//       return res.status(400).json({
//         message: `These users are already participating in this contest: ${blockedEmails.join(", ")}`
//       });
//     }

//     // 4. Create the Team document
//     const newTeam = await Team.create({
//       teamName: normalizedTeamName,
//       leader: userId,
//       members: [userId],
//       contest: contestId
//     });

//     await Participation.create({
//       user: userId,
//       contest: contestId,
//       participationType: "team",
//       team: newTeam._id
//     });

//     const inviteResults = [];

//     for (const email of normalizedMembers) {
//       try {
//         inviteResults.push(
//           await sendTeamInvitation({
//             email,
//             team: newTeam,
//             contestTitle: contest.title,
//             invitedBy: userId
//           })
//         );
//       } catch (error) {
//         inviteResults.push({
//           sent: false,
//           email,
//           reason: error.message
//         });
//       }
//     }

//     let adminNotification = { sent: false, recipients: [] };

//     try {
//       adminNotification = await notifyAdminsAboutPendingTeam({
//         team: newTeam,
//         contest,
//         leader: req.user,
//         inviteEmails: normalizedMembers
//       });
//     } catch (error) {
//       adminNotification = {
//         sent: false,
//         recipients: [],
//         error: error.message
//       };
//     }

//     return res.status(201).json({ 
//       message: "Team created successfully and is pending admin approval",
//       team: newTeam,
//       invitations: inviteResults,
//       adminNotification
//     });

//   } catch (error) {
//     return res.status(500).json({ error: error.message });
//   }
// };

// // ==========================================
// // 4. GET ALL PARTICIPANTS FOR A CONTEST
// // ==========================================
// export const getContestParticipants = asyncHandler(async (req, res) => {
//   const { contestId } = req.params;

//   // Useful for admins or leaderboards to see everyone in a specific contest
//   const participants = await Participation.find({ contest: contestId })
//     .populate("user", "name email")
//     .populate("team", "teamName");

//   res.status(200).json({
//     message: "Contest participants retrieved",
//     count: participants.length,
//     participants
//   });
// });



// // ==========================================
// // 3. GET MY PARTICIPATIONS (Dashboard)
// // ==========================================
// export const getMyParticipations = asyncHandler(async (req, res) => {
//   // Finds all contests the logged-in user has joined
//   const participations = await Participation.find({ user: req.user._id })
//     .populate("contest", "title startDate deadline status image")
//     .populate({
//       path: "team",
//       select: "teamName members",
//       populate: { path: "members", select: "name email" }
//     })
//     .sort({ createdAt: -1 });

//   res.status(200).json({
//     message: "User participations retrieved",
//     count: participations.length,
//     participations
//   });
// });


// // GET SINGLE STUDENT CONTEST HISTORY & SUBMISSIONS

// export const getStudentContestHistory = asyncHandler(async (req, res) => {

//   const studentId = req.user._id; 

//   const participations = await Participation.find({ user: studentId })
//     .populate("contest") 
//     .populate("team", "teamName members") 
//     .sort({ createdAt: -1 });

//   const totalParticipations = participations.length;
//   const completedSubmissions = participations.filter(p => p.status === "submitted").length;
//   const pendingContests = totalParticipations - completedSubmissions;
//   const history = participations.map((participation) => ({
//     ...participation.toObject(),
//     status: participation.status || "pending"
//   }));

//   res.status(200).json({
//     message: "Student contest history and submissions retrieved",
//     summary: {
//       totalJoined: totalParticipations,
//       totalSubmitted: completedSubmissions,
//       totalPending: pendingContests
//     },
//     // This array contains every single detail the frontend needs
//     history
//   });
// });

// console.log("Contest Controller is working");

import asyncHandler from "../middleware/asyncHandler.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";

export const joinContestSolo = asyncHandler(async (req, res) => {
  const { contestId } = req.params;
  const userId = req.user._id;

  const contest = await Contest.findById(contestId);
  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  if (getContestStatus(contest) === "completed") {
    return res.status(400).json({ message: "Contest deadline has passed." });
  }

  if (contest.participationType === "team") {
    return res.status(400).json({
      message: "This is a team contest. Create a team instead."
    });
  }

  const existingParticipation = await Participation.findOne({
    user: userId,
    contest: contestId
  });

  if (existingParticipation) {
    return res.status(400).json({
      message: `You are already participating in this contest as ${existingParticipation.participationType}`
    });
  }

  const participation = await Participation.create({
    user: userId,
    contest: contestId,
    participationType: "solo"
  });

  return res.status(201).json({
    message: "Joined contest successfully as solo participant",
    participation
  });
});

export const getMyParticipations = asyncHandler(async (req, res) => {
  const participations = await Participation.find({ user: req.user._id })
    .populate("contest", "title startDate deadline status image")
    .populate({
      path: "team",
      select: "teamName members",
      populate: { path: "members", select: "name email" }
    })
    .sort({ createdAt: -1 });

  return res.status(200).json({
    message: "User participations retrieved",
    count: participations.length,
    participations
  });
});

export const getContestParticipants = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  const participants = await Participation.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName");

  return res.status(200).json({
    message: "Contest participants retrieved",
    count: participants.length,
    participants
  });
});

export const getStudentContestHistory = asyncHandler(async (req, res) => {
  const studentId = req.user._id;

  const participations = await Participation.find({ user: studentId })
    .populate("contest")
    .populate("team", "teamName members")
    .sort({ createdAt: -1 });

  const totalParticipations = participations.length;
  const completedSubmissions = participations.filter(
    (p) => p.status === "submitted"
  ).length;

  const pendingContests = totalParticipations - completedSubmissions;

  const history = participations.map((participation) => ({
    ...participation.toObject(),
    status: participation.status || "pending"
  }));

  return res.status(200).json({
    message: "Student contest history and submissions retrieved",
    summary: {
      totalJoined: totalParticipations,
      totalSubmitted: completedSubmissions,
      totalPending: pendingContests
    },
    history
  });
});