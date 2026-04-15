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


// =====================================================
// GET MY PARTICIPATIONS
// বাংলা: logged-in user যেসব team/contest-এ আছে সেগুলোর participation data
// English: Get participation data of the logged-in user
// =====================================================
participationRouter.get("/my-participations", verifyJWT, getMyParticipations);


// =====================================================
// GET MY HISTORY
// বাংলা: logged-in student-এর সব contest history
// English: Get full contest history of the logged-in user
// =====================================================
participationRouter.get("/my-history", verifyJWT, getStudentContestHistory);


// =====================================================
// GET CONTEST PARTICIPANTS
// বাংলা: নির্দিষ্ট contest-এর সব participant teams and members
// English: Get all participants of a specific contest
// =====================================================
participationRouter.get("/contest/:contestId/participants", getContestParticipants);


export default participationRouter;


console.log("participation router is working");