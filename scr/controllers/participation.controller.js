

import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";
import { Participation } from "../models/participation.model.js";
import { Team } from "../models/team.model.js";

// ==========================================
// 1. JOIN AS SOLO
// ==========================================
export const joinContestSolo = async (req, res) => {
  try {
    const { contestId } = req.params;
    const userId = req.user._id; 

    // 1. Check if contest exists and is still open
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    
    if (new Date(contest.deadline) < new Date()) {
      return res.status(400).json({ message: "Contest deadline has passed." });
    }

    // 2. Check if user is already participating (Solo OR Team)
    // Thanks to the new schema, we only need to check one collection!
    const existingParticipation = await Participation.findOne({ 
      user: userId, 
      contest: contestId 
    });
    
    if (existingParticipation) {
      return res.status(400).json({ 
        message: `You are already participating in this contest as a ${existingParticipation.participationType}.` 
      });
    }

    // 3. Create Solo Participation
    const participation = await Participation.create({
      user: userId,
      contest: contestId,
      participationType: "solo"
    });

    return res.status(201).json({ 
      message: "Joined contest successfully as a solo participant", 
      participation 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// ==========================================
// 2. JOIN AS A TEAM
// ==========================================
export const joinContestTeam = async (req, res) => {
  try {
    const { contestId } = req.params;
    const { teamName, memberIds } = req.body; // Expecting an array of user IDs
    const userId = req.user._id ;

    // Combine the creator's ID with the invited members and remove duplicates
    const allMembers = [...new Set([...memberIds, userId.toString()])];

    // 1. Check if contest exists and is open
    const contest = await Contest.findById(contestId);
    if (!contest) return res.status(404).json({ message: "Contest not found" });
    
    if (new Date(contest.deadline) < new Date()) {
      return res.status(400).json({ message: "Contest deadline has passed." });
    }

    // 2. Check if the team name is already taken for THIS contest
    const existingTeamName = await Team.findOne({ contest: contestId, teamName });
    if (existingTeamName) {
      return res.status(400).json({ message: "This team name is already taken for this contest." });
    }

    // 3. Check if ANY of the members are already participating (Solo or Team)
    // We can query the Participation model to see if any user in the array is already registered
    const existingParticipants = await Participation.find({
      contest: contestId,
      user: { $in: allMembers }
    }).populate("user", "name"); // Populate to get the names for a better error message

    if (existingParticipants.length > 0) {
      // Extract names of users who are already participating
      const duplicateNames = existingParticipants.map(p => p.user.name).join(", ");
      return res.status(400).json({ 
        message: `Cannot create team. The following users are already participating in this contest: ${duplicateNames}` 
      });
    }

    // 4. Create the Team document
    const newTeam = await Team.create({
      teamName,
      members: allMembers,
      contest: contestId
    });

    // 5. Create a Participation document for EACH member
    // We format an array of objects to insert all at once
    const participationDocs = allMembers.map((memberId) => ({
      user: memberId,
      contest: contestId,
      participationType: "team",
      team: newTeam._id
    }));

    await Participation.insertMany(participationDocs);

    return res.status(201).json({ 
      message: "Team created and registered successfully", 
      team: newTeam 
    });

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
};


// ==========================================
// 4. GET ALL PARTICIPANTS FOR A CONTEST
// ==========================================
export const getContestParticipants = asyncHandler(async (req, res) => {
  const { contestId } = req.params;

  // Useful for admins or leaderboards to see everyone in a specific contest
  const participants = await Participation.find({ contest: contestId })
    .populate("user", "name email")
    .populate("team", "teamName");

  res.status(200).json({
    message: "Contest participants retrieved",
    count: participants.length,
    participants
  });
});



// ==========================================
// 3. GET MY PARTICIPATIONS (Dashboard)
// ==========================================
export const getMyParticipations = asyncHandler(async (req, res) => {
  // Finds all contests the logged-in user has joined
  const participations = await Participation.find({ user: req.user._id })
    .populate("contest", "title startDate deadline status image")
    .populate({
      path: "team",
      select: "teamName members",
      populate: { path: "members", select: "name email" }
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    message: "User participations retrieved",
    count: participations.length,
    participations
  });
});


console.log("Contest Controller is working");