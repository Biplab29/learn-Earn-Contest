// import express from "express";
// import {
//   joinContestSolo,
//   //joinContestTeam,
//   getMyParticipations,
//   getContestParticipants,
//   getStudentContestHistory
// } from "../controllers/participation.controller.js";

// import { verifyJWT } from "../middleware/checkAuthUser.js";

// const participationRouter = express.Router();

// // ================= PROTECTED =================

// // my participations
// participationRouter.get("/my-participations", verifyJWT, getMyParticipations);

// // join contest as solo
// participationRouter.post("/contest/:contestId/join/solo", verifyJWT, joinContestSolo);

// // create a team and join contest
// //participationRouter.post("/contest/:contestId/join/team", verifyJWT, joinContestTeam);

// // GET a student's complete contest and submission history
// participationRouter.get("/my-history", verifyJWT, getStudentContestHistory);

// // ================= PUBLIC =================

// // get all participants for a specific contest
// participationRouter.get("/contest/:contestId/participants", getContestParticipants);


// export default participationRouter;



import express from "express";
import {
  getMyParticipations,
  getContestParticipants,
  getStudentContestHistory,
} from "../controllers/participation.controller.js";

import { verifyJWT } from "../middleware/checkAuthUser.js";

const participationRouter = express.Router();


// // GET MY PARTICIPATIONS
//logged-in user jesob team/contest a ache segulor participation data
// Get participation data of the logged-in user
// =====================================================
participationRouter.get("/my-participations", verifyJWT, getMyParticipations);


// GET MY HISTORY
//  Get full contest history of the logged-in user
// =====================================================
participationRouter.get("/my-history", verifyJWT, getStudentContestHistory);


// =====================================================
// GET CONTEST PARTICIPANTS
// nirdishto contest er  participant teams and members
// Get all participants of a specific contest
// =====================================================
participationRouter.get("/contest/:contestId/participants", getContestParticipants);


export default participationRouter;


console.log("participation router is working");