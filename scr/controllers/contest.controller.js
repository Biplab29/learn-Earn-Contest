
// import asyncHandler from "../middleware/asyncHandler.js";
// import { Contest } from "../models/contest.model.js";


// //CREATE CONTEST (Admin)
// // export const createContest = async (req, res) => {
// //   const { title, description, deadline, rewards } = req.body;

// //   const image = req.file?.path;

// //   const contest = await Contest.create({
// //     title,
// //     description,
// //     //projectBrief,
// //     deadline,
// //     rewards,
// //     image,
// //     createdBy: req.user._id
// //   });

// //   res.status(201).json({message:"contest created", contest});
// // };

// export const createContest = async (req, res) => {
//   const { title, description, startDate, deadline, rewards } = req.body;

//   const image = req.file?.path;

//   const now = new Date();

//   let status = "upcoming";

//   if (startDate <= now && deadline > now) {
//     status = "active";
//   } else if (deadline <= now) {
//     status = "completed";
//   }

//   const contest = await Contest.create({
//     title,
//     description,
//     startDate,
//     deadline,
//     rewards,
//     image,
//     status,
//     createdBy: req.user._id
//   });

//   res.status(201).json({ message: "contest created", contest });
// };


// // GET ALL CONTESTS
// export const getAllContests = asyncHandler(async (req, res) => {
//   const contests = await Contest.find()
//     .populate("createdBy", "name email")
//     .sort({ createdAt: -1 });

//   res.status(201).json({message:"All Contests", contests});
// });


// //GET SINGLE CONTEST
// export const getContestById = asyncHandler(async (req, res) => {
//   const contest = await Contest.findById(req.params.id)
//     .populate("createdBy", "name email");

//   if (!contest) {
//     res.status(404).json({message:"Contest not found"});
//   }

//   res.status(201).json({messsage:"contest", contest});

// });

// //UPDATE CONTEST (Admin)
// export const updateContest = asyncHandler(async (req, res) => {
//   const contest = await Contest.findById(req.params.id);

//   if (!contest) {
//     return res.status(404).json({ message: "Contest not found" });
//   }

//   // uploaded image
//   const image = req.file?.path;

//   //update object
//   const updateData = {
//     ...req.body,
//     ...(image && { image }) 
//   };

//   const updated = await Contest.findByIdAndUpdate(
//     req.params.id,
//     updateData,
//     { new: true }
//   );

//   res.status(200).json({
//     message: "Contest updated",
//     updated
//   });
// });


// // DELETE CONTEST (Admin)
// export const deleteContest = asyncHandler(async (req, res) => {
//   const contest = await Contest.findById(req.params.id);

//   if (!contest) {
//     res.status(404).json({message:"Contest not found"})
//   }

//   await contest.deleteOne();

//   res.status(201).json({messsage:"Contest deleted"})
// });

// // GET ACTIVE CONTESTS
// export const getActiveContests = asyncHandler(async (req, res) => {
//   const contests = await Contest.find({ status: "active" })
//     .sort({ deadline: 1 });

//   res.status(201).json({message:"Active Contests", contests});
// });

// //GET UPCOMING CONTESTS
// export const getUpcomingContests = asyncHandler(async (req, res) => {
//   const contests = await Contest.find({ status: "upcoming" });

//   res.status(201). json({message:"Upcoming contest", contests});
// });

// //GET COMPLETED CONTESTS
// export const getCompletedContests = asyncHandler(async (req, res) => {
//   const contests = await Contest.find({ status: "completed" });

//   res.status(201).json({message:"Completed COntests", contests});
// });


// // AUTO UPDATE STATUS
// export const updateContestStatus = asyncHandler(async (req, res) => {
//   const now = new Date();

//   await Contest.updateMany( 
//     { deadline: { $lt: now }, status: "active" },
//     { status: "completed" }
//   );

//   res.status(201).json({message:"Contest status updated"})
// });


// console.log("contest controller is working");
import asyncHandler from "../middleware/asyncHandler.js";
import { Contest } from "../models/contest.model.js";

// helper
const getStatus = (startDate, deadline) => {
  const now = new Date();
  if (startDate <= now && deadline > now) return "active";
  if (deadline <= now) return "completed";
  return "upcoming";
};

// create
export const createContest = asyncHandler(async (req, res) => {
  const { title, description, startDate, deadline, rewards } = req.body;
  const image = req.file?.path;

  const contest = await Contest.create({
    title,
    description,
    startDate,
    deadline,
    rewards,
    image,
    status: getStatus(new Date(startDate), new Date(deadline)),
    createdBy: req.user._id
  });

  res.status(201).json({ message: "Contest created", contest });
});

// get all
export const getAllContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  const updated = contests.map(c => ({
    ...c.toObject(),
    status: getStatus(c.startDate, c.deadline)
  }));

  res.json({ contests: updated });
});

// get single
export const getContestById = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) return res.status(404).json({ message: "Not found" });

  res.json({
    ...contest.toObject(),
    status: getStatus(contest.startDate, contest.deadline)
  });
});

export const updateContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({ message: "Not found" });
  }

  // ✅ handle image upload
  const image = req.file?.path;

  // ✅ fallback values
  const startDate = req.body.startDate || contest.startDate;
  const deadline = req.body.deadline || contest.deadline;

  // ✅ calculate status
  const status = getStatus(new Date(startDate), new Date(deadline));

  // ✅ update object
  const updateData = {
    ...req.body,
    status,
    ...(image && { image }) // only add image if exists
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

// delete
export const deleteContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  if (!contest) return res.status(404).json({ message: "Not found" });

  await contest.deleteOne();
  res.json({ message: "Deleted" });
});


// ===============================
// 🔥 NEW APIs (YOU ASKED)
// ===============================

// ✅ ACTIVE CONTESTS
export const getActiveContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    startDate: { $lte: now },
    deadline: { $gt: now }
  })
    .populate("createdBy", "name email")
    .sort({ deadline: 1 });

  res.json({
    message: "Active Contests",
    contests
  });
});


// ✅ UPCOMING CONTESTS
export const getUpcomingContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    startDate: { $gt: now }
  })
    .populate("createdBy", "name email")
    .sort({ startDate: 1 });

  res.json({
    message: "Upcoming Contests",
    contests
  });
});


// ✅ COMPLETED CONTESTS
export const getCompletedContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    deadline: { $lte: now }
  })
    .populate("createdBy", "name email")
    .sort({ deadline: -1 });

  res.json({
    message: "Completed Contests",
    contests
  });
});

console.log("contest controller is working");
