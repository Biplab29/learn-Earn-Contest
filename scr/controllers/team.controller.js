// import asyncHandler from "../middleware/asyncHandler.js";
// import { Team } from "../models/team.model.js";


// export const teamCreate = asyncHandler(async (req, res) => {

//     const { teamName, members, contest } = req.body;

//     if (!teamName || !members || !contest) {
//         return res.status(401).json({ message: "All fields required" });
//     }

//     //let allMembers = members || [];

//     // add leader if not included
//     // if (!allMembers.includes(req.user._id.toString())) {
//     //     allMembers.push(req.user._id);
//     // }

//     const allMembers  = [...new Set([req.user._id, ...(members || [])])];

//     const Team = await Team.create({
//         teamName,
//         leader: req.user._id,
//         members: allMembers,
//         contest
//     });

//     return res.status(201).json({
//         message: "Team created successfully",
//         Team

//     });

// });

// export const addMember = asyncHandler(async (req, res) => {
//   const { userId } = req.body;

//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   // 🔐 only leader
//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({ message: "Only leader can add members" });
//   }

//   // ❌ max 2
//   if (team.members.length >= 2) {
//     return res.status(400).json({ message: "Team full (max 2)" });
//   }

//   // ❌ duplicate
//   if (team.members.includes(userId)) {
//     return res.status(400).json({ message: "User already in team" });
//   }

//   // ✅ check user exists
//   const user = await User.findById(userId);
//   if (!user) {
//     return res.status(404).json({ message: "User not found" });
//   }

//   team.members.push(userId);
//   await team.save();

//   res.json({
//     message: "Member added successfully",
//     team
//   });
// });


// //get my teams
// export const getMyTeams = asyncHandler(async(req,res)=>{
    
//     const team = await Team.find({members: req.user._id })
//     .populate("members", "name email")
//     .populate("contest", "title");

//     if(!team){
//         return res.status(404).json({message: "No teams found"});
//     }

//     return res.status(201).json({
//         message: "My teams",
//         team
//     });
// });

// //get teams by contest
// export const getTeamsByContest = asyncHandler(async(req,res)=>{
//     const {contestId} = req.params;

//     const team = await Team.find({contest: contestId })
//     .populate("members", "name email")
//     .populate("contest", "title");

//     return res.status(201).json({
//         message: "Teams by contest",
//         team
//     })
// });

// //delete team
// export const deleteTeam = asyncHandler(async (req, res) => {

//   const team = await Team.findById(req.params.id);

//   if (!team) {
//     return res.status(404).json({ message: "Team not found" });
//   }

//   if (team.leader.toString() !== req.user._id.toString()) {
//     return res.status(403).json({ message: "Only leader can delete team" });
//   }

//   await team.deleteOne();

//   res.json({ message: "Team deleted" });
// });

// console.log("Team Controller is working");

import asyncHandler from "../middleware/asyncHandler.js";
import { Team } from "../models/team.model.js";
import { User } from "../models/user.model.js";

export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, members, contest } = req.body;

  if (!teamName || !contest) {
    return res.status(400).json({ message: "Team name and contest are required" });
  }

  // Combine the creator's ID with any provided members, removing duplicates
  const allMembers = [...new Set([req.user._id.toString(), ...(members || [])])];

  const team = await Team.create({
    teamName,
    members: allMembers,
    contest
    // Removed the "leader" field entirely
  });

  return res.status(201).json({ message: "Team created successfully", team });
});

export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;
  const team = await Team.findById(req.params.id);

  if (!team) return res.status(404).json({ message: "Team not found" });

  // 🔐 Check if the person making the request is already in the team
  const isMember = team.members.some(memberId => memberId.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({ message: "Only existing team members can add new people" });
  }

  // Max team size (adjust as needed)
  if (team.members.length >= 4) { 
    return res.status(400).json({ message: "Team is full" });
  }

  // Check for duplicates
  if (team.members.some(memberId => memberId.toString() === userId.toString())) {
    return res.status(400).json({ message: "User is already in the team" });
  }

  // Verify the new user actually exists in the database
  const user = await User.findById(userId);
  if (!user) return res.status(404).json({ message: "User not found" });

  team.members.push(userId);
  await team.save();

  res.status(200).json({ message: "Member added successfully", team });
});

export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate("members", "name email")
    .populate("contest", "title");
  res.status(200).json({ message: "My teams", teams });
});

export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({ contest: req.params.contestId })
    .populate("members", "name email");
  res.status(200).json({ message: "Teams for this contest", teams });
});

export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);
  if (!team) return res.status(404).json({ message: "Team not found" });

  // 🔐 Check if the person deleting the team is actually in the team
  const isMember = team.members.some(memberId => memberId.toString() === req.user._id.toString());
  if (!isMember) {
    return res.status(403).json({ message: "You must be a team member to delete this team" });
  }

  await team.deleteOne();
  res.status(200).json({ message: "Team deleted" });
}); 