import express from "express";
import {
  joinContestSolo,
  joinContestTeam,
  getMyParticipations,
  getContestParticipants
} from "../controllers/participation.controller.js";

import { verifyJWT } from "../middleware/checkAuthUser.js";

const participationRouter = express.Router();

// ================= PROTECTED =================

// my participations
participationRouter.get("/my-participations", verifyJWT, getMyParticipations);

// join contest as solo
participationRouter.post("/contest/:contestId/join/solo", verifyJWT, joinContestSolo);

// create a team and join contest
participationRouter.post("/contest/:contestId/join/team", verifyJWT, joinContestTeam);


// ================= PUBLIC =================

// get all participants for a specific contest
participationRouter.get("/contest/:contestId/participants", getContestParticipants);


export default participationRouter;