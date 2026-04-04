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


// ================= PROTECTED =================

// create team
teamRouter.post("/", verifyJWT, teamCreate);

// my teams (specific route first)
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// add member
teamRouter.patch("/:id/members", verifyJWT, addMember);

// delete team
teamRouter.delete("/:id", verifyJWT, deleteTeam);


// ================= PUBLIC =================

// teams by contest (specific before generic)
teamRouter.get("/contest/:contestId", getTeamsByContest);


export default teamRouter;