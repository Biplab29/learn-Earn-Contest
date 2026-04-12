
// // import express from "express";
// // import {
// //   teamCreate,
// //   // addMember,
// //   getMyTeams,
// //   getTeamsByContest,
// //   deleteTeam,
// //   updateTeamStatus,
// //   getPendingTeams,
// //   inviteMember,
// //   confirmInvitation,
// //   getMyInvitations
// // } from "../controllers/team.controller.js";

// // import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

// // const teamRouter = express.Router();

// // // =================== STATIC ROUTES FIRST (must be before /:id) ===================

// // // create team
// // teamRouter.post("/", verifyJWT, teamCreate);

// // //  get my teams
// // teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// // // et my pending invitations
// // teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// // //  get pending teams for approval
// // teamRouter.get("/pending", verifyJWT, authorizeRoles("admin"), getPendingTeams);

// // // confirm invitation via token (user must be logged in)
// // teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// // // PUBLIC STATIC: teams by contest
// // teamRouter.get("/contest/:contestId", getTeamsByContest);

// // // =================== DYNAMIC /:id ROUTES (after all static routes) ===================

// // // invite member via email
// // teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// // // add member (direct add by ID)
// // //teamRouter.patch("/:id/members", verifyJWT, addMember);

// // // delete team
// // teamRouter.delete("/:id", verifyJWT, deleteTeam);

// // // =================== ADMIN ===================

// // // update team status (approve/reject)
// // teamRouter.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateTeamStatus);

// // export default teamRouter;

// // console.log("Team Router is working");


// import express from "express";
// import {
//   teamCreate,
//   getMyTeams,
//   getTeamsByContest,
//   deleteTeam,
//   updateTeamStatus,
//   getPendingTeams,
//   inviteMember,
//   confirmInvitation,
//   getMyInvitations
// } from "../controllers/team.controller.js";

// import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

// const teamRouter = express.Router();

// // create team
// teamRouter.post("/", verifyJWT, teamCreate);

// // get my teams
// teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// // get my invitations
// teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// // admin pending teams
// teamRouter.get("/pending", verifyJWT, authorizeRoles("admin"), getPendingTeams);

// // confirm invitation
// teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// // teams by contest
// teamRouter.get("/contest/:contestId", getTeamsByContest);

// // invite member
// teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// // delete team
// teamRouter.delete("/:id", verifyJWT, deleteTeam);

// // admin approve/reject
// teamRouter.patch("/:id/status", verifyJWT, authorizeRoles("admin"), updateTeamStatus);

// export default teamRouter;

// console.log("Team Router is working");



import express from "express";
import {
  teamCreate,
  getMyTeams,
  getTeamsByContest,
  deleteTeam,
  updateTeamStatus,
  getPendingTeams,
  inviteMember,
  confirmInvitation,
  getMyInvitations,
} from "../controllers/team.controller.js";

import { verifyJWT, authorizeRoles } from "../middleware/checkAuthUser.js";

const teamRouter = express.Router();

// create team
teamRouter.post("/", verifyJWT, teamCreate);

// get my teams
teamRouter.get("/my-teams", verifyJWT, getMyTeams);

// get my invitations
teamRouter.get("/my-invitations", verifyJWT, getMyInvitations);

// get pending teams for admin
teamRouter.get(
  "/pending",
  verifyJWT,
  authorizeRoles("admin"),
  getPendingTeams
);

// confirm invitation by token
teamRouter.post("/invite/confirm/:token", verifyJWT, confirmInvitation);

// get teams by contest
teamRouter.get("/contest/:contestId", getTeamsByContest);

// invite member by userId
teamRouter.post("/:id/invite", verifyJWT, inviteMember);

// delete team
teamRouter.delete("/:id", verifyJWT, deleteTeam);

// admin approve/reject team
teamRouter.patch(
  "/:id/status",
  verifyJWT,
  authorizeRoles("admin"),
  updateTeamStatus
);

export default teamRouter;