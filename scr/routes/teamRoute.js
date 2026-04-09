// import express from "express";
// import {
//   teamCreate,
//   addMember,
//   getMyTeams,
//   getTeamsByContest,
//   deleteTeam
// } from "../controllers/team.controller.js";

// import { verifyJWT } from "../middleware/checkAuthUser.js";

// const teamRouter = express.Router();


// // ================= PROTECTED =================

// // create team
// teamRouter.post("/", verifyJWT, teamCreate);

// // my teams (specific route first)
// teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// // add member
// teamRouter.patch("/:id/members", verifyJWT, addMember);

// // delete team
// teamRouter.delete("/:id", verifyJWT, deleteTeam);


// // ================= PUBLIC =================

// // teams by contest 

// teamRouter.get("/contest/:contestId", getTeamsByContest);


// export default teamRouter;

import express from "express";
import {
  teamCreate,
  addMember,
  getMyTeams,
  getTeamsByContest,
  deleteTeam,
  updateTeamStatus,
  inviteMember,
  confirmInvitation,
  getMyInvitations
} from "../controllers/team.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

const teamRouter = express.Router();

// ================= PROTECTED =================

// create team
teamRouter.post("/", verifyJWT, teamCreate);

// my teams (specific route first to avoid :id conflicts!)
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// add member (direct add)
teamRouter.patch("/:id/members", verifyJWT, addMember);

// delete team
teamRouter.delete("/:id", verifyJWT, deleteTeam);

// ================= INVITATIONS =================

// invite member via email
teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// confirm invitation
teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// get my invitations
teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// ================= ADMIN =================

// update team status (approve/reject)
teamRouter.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateTeamStatus);

// ================= PUBLIC =================

// teams by contest 
teamRouter.get("/contest/:contestId", getTeamsByContest);

export default teamRouter;

console.log("Team Router is working");