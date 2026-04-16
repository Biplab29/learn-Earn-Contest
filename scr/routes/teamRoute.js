
import express from "express";
import {
  teamCreate,
  getMyTeams,
  getTeamsByContest,
  deleteTeam,
  inviteMember,
  confirmInvitation,
  getMyInvitations,
  updateTeam,
} from "../controllers/team.controller.js";

import { verifyJWT } from "../middleware/checkAuthUser.js";

const teamRouter = express.Router();

// create team
teamRouter.post("/create", verifyJWT, teamCreate);

// logged in user's teams
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// logged in user's pending invitations
teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// accept invitation by token
teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// get all teams of a contest
teamRouter.get("/contest/:contestId", getTeamsByContest);

// leader invites a member
teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// update team
teamRouter.put("/:id", verifyJWT, updateTeam);

// delete team
teamRouter.delete("/:id", verifyJWT, deleteTeam);

export default teamRouter;

console.log("Team Router is working");