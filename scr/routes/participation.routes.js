
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