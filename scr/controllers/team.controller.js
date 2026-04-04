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


// ✅ CREATE TEAM
export const teamCreate = asyncHandler(async (req, res) => {
  const { teamName, members, contest } = req.body;

  if (!teamName || !contest) {
    return res.status(400).json({
      message: "Team name and contest are required"
    });
  }

  // ❌ prevent user joining multiple teams in same contest
  const existingTeam = await Team.findOne({
    contest,
    members: req.user._id
  });

  if (existingTeam) {
    return res.status(400).json({
      message: "You already joined a team in this contest"
    });
  }

  // ✅ include creator + remove duplicates
  const allMembers = [
    ...new Set([req.user._id.toString(), ...(members || [])])
  ];

  // ❌ max team size
  if (allMembers.length > 4) {
    return res.status(400).json({
      message: "Max 4 members allowed"
    });
  }

  const team = await Team.create({
    teamName,
    members: allMembers,
    contest   // ✅ FIXED (important)
  });

  res.status(201).json({
    message: "Team created successfully",
    team
  });
});


// ✅ ADD MEMBER
export const addMember = asyncHandler(async (req, res) => {
  const { userId } = req.body;

  const team = await Team.findById(req.params.id);
  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }

  // ✅ must be existing member
  const isMember = team.members.some(
    m => m.toString() === req.user._id.toString()
  );

  if (!isMember) {
    return res.status(403).json({
      message: "Only team members can add users"
    });
  }

  // ❌ max size
  if (team.members.length >= 4) {
    return res.status(400).json({ message: "Team is full" });
  }

  // ❌ duplicate
  if (team.members.includes(userId)) {
    return res.status(400).json({
      message: "User already in team"
    });
  }

  // ❌ user already in another team (IMPORTANT)
  const alreadyInTeam = await Team.findOne({
    contest: team.contest,
    members: userId
  });

  if (alreadyInTeam) {
    return res.status(400).json({
      message: "User already in another team"
    });
  }

  // ✅ check user exists
  const user = await User.findById(userId);
  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  team.members.push(userId);
  await team.save();

  res.status(200).json({
    message: "Member added successfully",
    team
  });
});


// ✅ GET MY TEAMS
export const getMyTeams = asyncHandler(async (req, res) => {
  const teams = await Team.find({ members: req.user._id })
    .populate("members", "name email")
    .populate("contest", "title");

  res.status(200).json({
    message: "My teams",
    teams
  });
});


// ✅ GET TEAMS BY CONTEST
export const getTeamsByContest = asyncHandler(async (req, res) => {
  const teams = await Team.find({ contest: req.params.contestId })
    .populate("members", "name email");

  res.status(200).json({
    message: "Teams for this contest",
    teams
  });
});


// ✅ DELETE TEAM (only creator)
export const deleteTeam = asyncHandler(async (req, res) => {
  const team = await Team.findById(req.params.id);

  if (!team) {
    return res.status(404).json({ message: "Team not found" });
  }

  // ✅ only creator (first member)
  if (team.members[0].toString() !== req.user._id.toString()) {
    return res.status(403).json({
      message: "Only team creator can delete team"
    });
  }

  await team.deleteOne();

  res.status(200).json({
    message: "Team deleted successfully"
  });
});

console.log("Team Controller is working");
