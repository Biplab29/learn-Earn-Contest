import express from "express";

import {
    createContest,
    getAllContests,
    getContestById,
    updateContest,
    deleteContest,
    getActiveContests,
    getUpcomingContests,
    getCompletedContests,
    updateContestStatus
} from "../controllers/contest.controller.js";

import { upload } from "../middleware/uploadMiddleware.js";
import { authorizeRoles, verifyJWT } from "../middleware/checkAuthUser.js";

const contestRouter = express.Router();


//================= ADMIN ROUTES =================

//Create contest 
contestRouter.post("/create",verifyJWT,authorizeRoles("admin"),upload.single("image"),createContest
);

//Update contest
contestRouter.put("/:id",verifyJWT,authorizeRoles("admin"),upload.single("image"),updateContest);

// Delete contest
contestRouter.delete("/:id",verifyJWT,authorizeRoles("admin"),deleteContest);

// Auto update status
contestRouter.put("/update-status",verifyJWT,authorizeRoles("admin"),updateContestStatus);


// ================= PUBLIC ROUTES =================

//Get all contests
contestRouter.get("/", getAllContests);

//Get active contests
contestRouter.get("/active", getActiveContests);

// upcoming contests
contestRouter.get("/upcoming", getUpcomingContests);

//completed contests
contestRouter.get("/completed", getCompletedContests);

// single contest
contestRouter.get("/:id", getContestById);


export default contestRouter;


console.log("contest route is working");