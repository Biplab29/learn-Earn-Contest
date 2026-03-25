// import { Contest } from "../models/contest.model.js";

// export const createContest = async (req, res) => {
//   const data = await Contest.create({
//     ...req.body,
//     createdBy: req.user._id
//   });
//   res.json(data);
// };

// export const getContests = async (req, res) => {
//   const data = await Contest.find();
//   res.json(data);
// };

import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";


//CREATE CONTEST (Admin)
export const createContest = async (req, res) => {
  const { title, description, deadline, rewards } = req.body;

  const image = req.file?.path;

  const contest = await Contest.create({
    title,
    description,
    //projectBrief,
    deadline,
    rewards,
    image,
    createdBy: req.user._id
  });

  res.status(201).json({message:"contest created", contest});
};


// GET ALL CONTESTS
export const getAllContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  res.status(201).json({message:"All Contests", contests});
});


//GET SINGLE CONTEST
export const getContestById = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id)
    .populate("createdBy", "name email");

  if (!contest) {
    res.status(404).json({message:"Contest not found"});
  }

  res.status(201).json({messsage:"contest", contest});
});


//UPDATE CONTEST (Admin)
export const updateContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({ message: "Contest not found" });
  }

  // uploaded image
  const image = req.file?.path;

  //update object
  const updateData = {
    ...req.body,
    ...(image && { image }) // only add image if uploaded
  };

  const updated = await Contest.findByIdAndUpdate(
    req.params.id,
    updateData,
    { new: true }
  );

  res.status(200).json({
    message: "Contest updated",
    updated
  });
});


// DELETE CONTEST (Admin)
export const deleteContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    res.status(404).json({message:"Contest not found"})
  }

  await contest.deleteOne();

  res.status(201).json({messsage:"Contest deleted"})
});


// GET ACTIVE CONTESTS (Student)
export const getActiveContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({ status: "active" })
    .sort({ deadline: 1 });

  res.status(201).json({message:"Active Contests", contests});
});


//GET UPCOMING CONTESTS
export const getUpcomingContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({ status: "upcoming" });

  res.status(201).json({message:"Upcoming contest", contests});
});


//GET COMPLETED CONTESTS
export const getCompletedContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find({ status: "completed" });

  res.status(201).json({message:"Completed COntests", contests});
});


// AUTO UPDATE STATUS
export const updateContestStatus = asyncHandler(async (req, res) => {
  const now = new Date();

  await Contest.updateMany(
    { deadline: { $lt: now }, status: "active" },
    { status: "completed" }
  );

  res.status(201).json({message:"Contest status updated"})
});


console.log("contest controller is working");