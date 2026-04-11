
import express from "express";
import {
  teamCreate,
  addMember,
  getMyTeams,
  getTeamsByContest,
  deleteTeam,
  updateTeamStatus,
  getPendingTeams,
  inviteMember,
  confirmInvitation,
  getMyInvitations
} from "../controllers/team.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

const teamRouter = express.Router();

// =================== STATIC ROUTES FIRST (must be before /:id) ===================

// create team
teamRouter.post("/", verifyJWT, teamCreate);

// ✅ STATIC: get my teams
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// ✅ STATIC: get my pending invitations
teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// ✅ ADMIN: get pending teams for approval
teamRouter.get("/pending", verifyJWT, authorizeRoles("admin"), getPendingTeams);

// confirm invitation via token (user must be logged in)
teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// PUBLIC STATIC: teams by contest
teamRouter.get("/contest/:contestId", getTeamsByContest);

// =================== DYNAMIC /:id ROUTES (after all static routes) ===================

// invite member via email
teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// add member (direct add by ID)
teamRouter.patch("/:id/members", verifyJWT, addMember);

// delete team
teamRouter.delete("/:id", verifyJWT, deleteTeam);

// =================== ADMIN ===================

// update team status (approve/reject)
teamRouter.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateTeamStatus);

export default teamRouter;

console.log("Team Router is working");
