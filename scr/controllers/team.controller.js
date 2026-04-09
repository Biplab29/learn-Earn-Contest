// // import asyncHandler from "../middleware/asyncHandler.js";
// // import { Team } from "../models/team.model.js";


// // export const teamCreate = asyncHandler(async (req, res) => {

// //     const { teamName, members, contest } = req.body;

// //     if (!teamName || !members || !contest) {
// //         return res.status(401).json({ message: "All fields required" });
// //     }

// //     //let allMembers = members || [];

// //     // add leader if not included
// //     // if (!allMembers.includes(req.user._id.toString())) {
// //     //     allMembers.push(req.user._id);
// //     // }

// //     const allMembers  = [...new Set([req.user._id, ...(members || [])])];

// //     const Team = await Team.create({
// //         teamName,
// //         leader: req.user._id,
// //         members: allMembers,
// //         contest
// //     });

// //     return res.status(201).json({
// //         message: "Team created successfully",
// //         Team

// //     });

// // });

// // export const addMember = asyncHandler(async (req, res) => {
// //   const { userId } = req.body;

// //   const team = await Team.findById(req.params.id);

// //   if (!team) {
// //     return res.status(404).json({ message: "Team not found" });
// //   }

// //   // 🔐 only leader
// //   if (team.leader.toString() !== req.user._id.toString()) {
// //     return res.status(403).json({ message: "Only leader can add members" });
// //   }

// //   // ❌ max 2
// //   if (team.members.length >= 2) {
// //     return res.status(400).json({ message: "Team full (max 2)" });
// //   }

// //   // ❌ duplicate
// //   if (team.members.includes(userId)) {
// //     return res.status(400).json({ message: "User already in team" });
// //   }

// //   // ✅ check user exists
// //   const user = await User.findById(userId);
// //   if (!user) {
// //     return res.status(404).json({ message: "User not found" });
// //   }

// //   team.members.push(userId);
// //   await team.save();

// //   res.json({
// //     message: "Member added successfully",
// //     team
// //   });
// // });


// // //get my teams
// // export const getMyTeams = asyncHandler(async(req,res)=>{
    
// //     const team = await Team.find({members: req.user._id })
// //     .populate("members", "name email")
// //     .populate("contest", "title");

// //     if(!team){
// //         return res.status(404).json({message: "No teams found"});
// //     }

// //     return res.status(201).json({
// //         message: "My teams",
// //         team
// //     });
// // });

// // //get teams by contest
// // export const getTeamsByContest = asyncHandler(async(req,res)=>{
// //     const {contestId} = req.params;

// //     const team = await Team.find({contest: contestId })
// //     .populate("members", "name email")
// //     .populate("contest", "title");

// //     return res.status(201).json({
// //         message: "Teams by contest",
// //         team
// //     })
// // });

// // //delete team
// // export const deleteTeam = asyncHandler(async (req, res) => {

// //   const team = await Team.findById(req.params.id);

// //   if (!team) {
// //     return res.status(404).json({ message: "Team not found" });
// //   }

// //   if (team.leader.toString() !== req.user._id.toString()) {
// //     return res.status(403).json({ message: "Only leader can delete team" });
// //   }

// //   await team.deleteOne();

// //   res.json({ message: "Team deleted" });
// // });

// // console.log("Team Controller is working");

// import asyncHandler from "../middleware/asyncHandler.js";
// import { Team } from "../models/team.model.js";
// import { User } from "../models/user.model.js";


// // CREATE TEAM
// export const teamCreate = asyncHandler(async (req, res) => {
//   const { teamName, members, contest } = req.body;

//   if (!teamName || !contest) {
//     return res.status(400).json({
//       message: "Team name and contest are required"
//     });
//   }

//   // joining multiple teams in same contest
//   const existingTeam = await Team.findOne({
//     contest,
//     members: req.user._id
//   });

//   if (existingTeam) {
//     return res.status(400).json({
//       message: "You already joined a team in this contest"
//     });
//   }

//   // include creator + remove duplicates
//   const allMembers = [
//     ...new Set([req.user._id.toString(), ...(members || [])])
//   ];

//   // max team size
//   if (allMembers.length > 4) {
//     return res.status(400).json({
//       message: "Max 4 members allowed"
//     });
//   }

//   const team = await Team.create({
//     teamName,
//     members: allMembers,
//     contest  
//   });

//   res.status(201).json({
//     message: "Team created successfully",
//     team
//   });
// });


// // ADD MEMBER
// export const addMember = asyncHandler(async (req, res) => {
//   const { userId } = req.body;

//   const team = await Team.findById(req.params.id);
//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   //  must be existing member
//   const isMember = team.members.some(
//     m => m.toString() === req.user._id.toString()
//   );

//   if (!isMember) {
//     return res.status(403).json({
//       message: "Only team members can add users"
//     });
//   }

//   //  max size
//   if (team.members.length >= 4) {
//     return res.status(400).json({ message: "Team is full" });
//   }

//   //  check duplicate entry 
//   if (team.members.includes(userId)) {
//     return res.status(400).json({
//       message: "User already in team"
//     });
//   }

//   //  user already in another team
//   const alreadyInTeam = await Team.findOne({
//     contest: team.contest,
//     members: userId
//   });

//   if (alreadyInTeam) {
//     return res.status(400).json({
//       message: "User already in another team"
//     });
//   }

//   //  check user exists
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   team.members.push(userId);
//   await team.save();

//   res.status(200).json({
//     message: "Member added successfully",
//     team
//   });
// });


// //  GET MY TEAMS
// export const getMyTeams = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ members: req.user._id })
//     .populate("members", "name email")
//     .populate("contest", "title");

//   res.status(200).json({
//     message: "My teams",
//     teams
//   });
// });


// //  GET TEAMS BY CONTEST
// export const getTeamsByContest = asyncHandler(async (req, res) => {
//   const teams = await Team.find({ contest: req.params.contestId })
//     .populate("members", "name email");

//   res.status(200).json({
//     message: "Teams for this contest",
//     teams
//   });
// });


// //  DELETE TEAM (only creator)
// export const deleteTeam = asyncHandler(async (req, res) => {
//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   //  only creator (first member)
//   if (team.members[0].toString() !== req.user._id.toString()) {
//     return res.status(403).json({
//       message: "Only team creator can delete team"
//     });
//   }

//   await team.deleteOne();

//   res.status(200).json({
//     message: "Team deleted successfully"
//   });
// });

// console.log("Team Controller is working");


import asyncHandler from "../middleware/asyncHandler.js";
import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";
import { Participation } from "../models/participation.model.js"; // <-- NEW IMPORT
import { Invitation } from "../models/invitation.model.js";
import { sendEmail } from "../utils/sendEmail.js";
import crypto from "crypto";


// ==========================================
// CREATE TEAM
// ==========================================
export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, members, contest } = req.body;

  if (!teamName || !contest) {
    return res.status(400).json({ message: "Team name and contest are required" });
  }

  // Include creator + remove duplicates
  const allMembers = [
    ...new Set([req.user._id.toString(), ...(members || [])])
  ];

  if (allMembers.length > 4) {
    return res.status(400).json({ message: "Max 4 members allowed" });
  }

  // CHANGE 1: Check if team name already exists for THIS contest
  const existingTeamName = await Team.findOne({ contest, teamName });
  if (existingTeamName) {
    return res.status(400).json({ message: "Team name is already taken for this contest" });
  }

  // CHANGE 2: Check Participation collection instead of just Team collection
  const existingParticipants = await Participation.find({
    contest,
    user: { $in: allMembers }
  });

  if (existingParticipants.length > 0) {
    return res.status(400).json({
      message: "One or more users are already participating in this contest (solo or team)."
    });
  }

  // Create Team
  const team = await Team.create({
    teamName,
    members: allMembers,
    contest  
  });

  // CHANGE 3: Create Participation records for all team members
  const participationDocs = allMembers.map((memberId) => ({
    user: memberId,
    contest,
    participationType: "team",
    team: team._id
  }));
  await Participation.insertMany(participationDocs);

  res.status(201).json({ message: "Team created successfully", team });
});


// ==========================================
// ADD MEMBER
// ==========================================
export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const isMember = team.members.some(
    m => m.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({ message: "Only team members can add users" });
  }

  if (team.members.length >= 4) {
    return res.status(400).json({ message: "Team is full" });
  }

  // Check user exists
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  // CHANGE 4: Check if the user is already participating in ANY way
  const alreadyParticipating = await Participation.findOne({
    contest: team.contest,
    user: userId
  });

  if (alreadyParticipating) {
    return res.status(400).json({ message: "User is already participating in this contest." });
  }

  // Update Team
  team.members.push(userId);
  await team.save();

  // CHANGE 5: Create Participation record for the new member
  await Participation.create({
    user: userId,
    contest: team.contest,
    participationType: "team",
    team: team._id
  });

  res.status(200).json({ message: "Member added successfully", team });
});


// ==========================================
// GET MY TEAMS
// ==========================================
export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate("members", "name email")
    .populate("contest", "title");

  res.status(200).json({ message: "My teams", teams });
});


// ==========================================
// GET TEAMS BY CONTEST
// ==========================================
export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({ contest: req.params.contestId })
    .populate("members", "name email");

  res.status(200).json({ message: "Teams for this contest", teams });
});


// ==========================================
// DELETE TEAM
// ==========================================
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) return res.status(404).json({ message: "Team not found" });

  // Note: Using members[0] is okay, but explicitly defining a `leader` in your schema is safer!
  if (team.members[0].toString() !== req.user._id.toString()) {
    return res.status(403).json({ message: "Only team creator can delete team" });
  }

  // CHANGE 6: Clean up the Participation collection before deleting the team
  await Participation.deleteMany({ team: team._id });
  
  // Now delete the team
  await team.deleteOne();

  res.status(200).json({ message: "Team deleted successfully" });
});

// ==========================================
// UPDATE TEAM STATUS (ADMIN ONLY)
// ==========================================
export const updateTeamStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const validStatuses = ["pending", "approved", "rejected"];
  if (!validStatuses.includes(status)) {
    return res.status(400).json({ message: "Invalid status" });
  }

  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  team.status = status;
  await team.save();

  res.status(200).json({ message: `Team status updated to ${status}`, team });
});

// ==========================================
// INVITE MEMBER VIA EMAIL
// ==========================================
export const inviteMember = asyncHandler(async (req, res) => {
  const { email } = req.body;
  
  if (!email) {
    return res.status(400).json({ message: "Email is required" });
  }

  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  const isMember = team.members.some(
    m => m.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({ message: "Only team members can invite users" });
  }

  if (team.members.length >= 4) {
    return res.status(400).json({ message: "Team is full" });
  }

  // Generate an invitation token
  const inviteToken = crypto.randomBytes(20).toString("hex");
  
  // Create an invitation record
  const invitation = await Invitation.create({
    email,
    team: team._id,
    token: inviteToken,
  });

  // Construct joining link (Using backend endpoint)
  const joinUrl = `${req.protocol}://${req.get("host")}/api/v1/teams/invite/confirm/${inviteToken}`;

  const message = `
    <h2>You have been invited to join a team!</h2>
    <p>Team Name: ${team.teamName}</p>
    <p>Please click on the link below to accept the invitation and join the contest:</p>
    <a href="${joinUrl}" clicktracking="off">${joinUrl}</a>
    <p>Important: If you get an error when clicking the link, it might be a POST endpoint. If so, your frontend developer will provide the correct link later.</p>
  `;

  try {
    await sendEmail(email, "Team Invitation", message);
    res.status(200).json({ message: "Invitation sent successfully to " + email });
  } catch (error) {
    // If email sending fails, delete the invitation
    await invitation.deleteOne();
    return res.status(500).json({ message: "Email could not be sent", error: error.message });
  }
});

// ==========================================
// CONFIRM EMAIL INVITATION
// ==========================================
export const confirmInvitation = asyncHandler(async (req, res) => {
  const { token } = req.params;

  // We find the invitation
  const invitation = await Invitation.findOne({ token, status: "pending" });
  
  if (!invitation) {
    return res.status(400).json({ message: "Invalid or expired invitation token" });
  }

  // The user claiming the invite must be logged in and their email must match
  if (req.user.email !== invitation.email) {
    return res.status(403).json({ message: "This invitation is not for your email address" });
  }

  const team = await Team.findById(invitation.team);
  if (!team) {
    return res.status(404).json({ message: "Team no longer exists" });
  }

  if (team.members.length >= 4) {
    return res.status(400).json({ message: "Team is already full" });
  }

  // Check if user is already participating
  const alreadyParticipating = await Participation.findOne({
    contest: team.contest,
    user: req.user._id
  });

  if (alreadyParticipating) {
    return res.status(400).json({ message: "You are already participating in this contest." });
  }

  const userId = req.user._id;

  if (team.members.includes(userId)) {
    return res.status(400).json({ message: "You are already in the team" });
  }

  // Add user to team
  team.members.push(userId);
  await team.save();

  // Create Participation record
  await Participation.create({
    user: userId,
    contest: team.contest,
    participationType: "team",
    team: team._id
  });

  // Mark invitation as accepted
  invitation.status = "accepted";
  await invitation.save();

  res.status(200).json({ message: "Invitation accepted. You are now a member of the team.", team });
});

// ==========================================
// GET MY PENDING INVITATIONS
// ==========================================
export const getMyInvitations = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (!user || !user.email) {
    return res.status(404).json({ message: "User not found or email missing." });
  }

  const invitations = await Invitation.find({ email: user.email, status: "pending" })
    .populate({
      path: "team",
      select: "teamName contest status",
      populate: {
        path: "contest",
        select: "title"
      }
    });

  res.status(200).json({ message: "My pending invitations", invitations });
});

console.log("Team Controller is working");