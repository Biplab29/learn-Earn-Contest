import express from "express";
import {
  teamCreate,
  addMember,
  getMyTeams,
  getTeamsByContest,
  deleteTeam
} from "../controllers/team.controller.js";

import { verifyJWT } from "../middleware/checkAuthUser.js";

const teamRouter = express.Router();

// --- Protected Routes (Requires Auth) ---

// POST /api/teams -> Creates a team
teamRouter.post("/", verifyJWT, teamCreate);

// GET /api/teams/my-teams -> Gets all teams for the logged-in user
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// PATCH /api/teams/:id/members -> Adds a member to a specific team
teamRouter.patch("/:id/members", verifyJWT, addMember);

// DELETE /api/teams/:id -> Deletes a specific team
teamRouter.delete("/:id", verifyJWT, deleteTeam);


// --- Public Routes ---

// GET /api/teams/contest/:contestId -> Gets all teams for a specific contest
teamRouter.get("/contest/:contestId", getTeamsByContest);

export default teamRouter;