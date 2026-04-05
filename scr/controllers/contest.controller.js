
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

// helper for valid date
const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

// ===============================
// CREATE CONTEST
// ===============================

// export const createContest = asyncHandler(async (req, res) => {
//   const { title, description, startDate, deadline, rewards } = req.body;
//   const image = req.file?.path || "";

//   if (!title || !description || !startDate || !deadline) {
//     return res.status(400).json({
//       message: "Title, description, startDate and deadline are required",
//     });
//   }

//   if (!req.user || !req.user._id) {
//     return res.status(401).json({
//       message: "Unauthorized user",
//     });
//   }

//   const parsedStartDate = new Date(startDate);
//   const parsedDeadline = new Date(deadline);

//   if (!isValidDate(parsedStartDate) || !isValidDate(parsedDeadline)) {
//     return res.status(400).json({
//       message: "Invalid startDate or deadline format",
//     });
//   }

//   if (parsedStartDate >= parsedDeadline) {
//     return res.status(400).json({
//       message: "Deadline must be greater than startDate",
//     });
//   }

//   const contest = await Contest.create({
//     title: title.trim(),
//     description: description.trim(),
//     startDate: parsedStartDate,
//     deadline: parsedDeadline,
//     rewards,
//     image,
//     status: getStatus(parsedStartDate, parsedDeadline),
//     createdBy: req.user._id,
//   });

//   const populatedContest = await Contest.findById(contest._id).populate(
//     "createdBy",
//     "name email"
//   );

//   return res.status(201).json({
//     success: true,
//     message: "Contest created successfully",
//     contest: populatedContest,
//   });
// });

export const createContest = asyncHandler(async (req, res) => {
  const { title, description, startDate, deadline, rewards } = req.body;
  const image = req.file?.path || "";

  console.log("BODY =>", req.body);
  console.log("USER =>", req.user);
  console.log("FILE =>", req.file);

  if (!title || !description || !startDate || !deadline) {
    return res.status(400).json({
      message: "Title, description, startDate and deadline are required",
    });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      message: "Unauthorized user",
    });
  }

  const parsedStartDate = new Date(startDate);
  const parsedDeadline = new Date(deadline);

  if (!isValidDate(parsedStartDate) || !isValidDate(parsedDeadline)) {
    return res.status(400).json({
      message: "Invalid startDate or deadline format",
    });
  }

  if (parsedStartDate >= parsedDeadline) {
    return res.status(400).json({
      message: "Deadline must be greater than startDate",
    });
  }

  const contest = await Contest.create({
    title: title.trim(),
    description: description.trim(),
    startDate: parsedStartDate,
    deadline: parsedDeadline,
    rewards,
    image,
    status: getStatus(parsedStartDate, parsedDeadline),
    createdBy: req.user._id,
  });

  return res.status(201).json({
    success: true,
    message: "Contest created successfully",
    contest,
  });
});

// ===============================
// GET ALL CONTESTS
// ===============================
export const getAllContests = asyncHandler(async (req, res) => {
  const contests = await Contest.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  const updatedContests = contests.map((contest) => ({
    ...contest.toObject(),
    status: getStatus(new Date(contest.startDate), new Date(contest.deadline)),
  }));

  return res.status(200).json({
    success: true,
    contests: updatedContests,
  });
});

// ===============================
// GET SINGLE CONTEST
// ===============================
export const getContestById = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id).populate(
    "createdBy",
    "name email"
  );

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  return res.status(200).json({
    success: true,
    contest: {
      ...contest.toObject(),
      status: getStatus(new Date(contest.startDate), new Date(contest.deadline)),
    },
  });
});

// ===============================
// UPDATE CONTEST
// ===============================
export const updateContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const image = req.file?.path;

  const updatedTitle = req.body.title ?? contest.title;
  const updatedDescription = req.body.description ?? contest.description;
  const updatedRewards = req.body.rewards ?? contest.rewards;
  const updatedStartDate = req.body.startDate
    ? new Date(req.body.startDate)
    : new Date(contest.startDate);
  const updatedDeadline = req.body.deadline
    ? new Date(req.body.deadline)
    : new Date(contest.deadline);

  if (!isValidDate(updatedStartDate) || !isValidDate(updatedDeadline)) {
    return res.status(400).json({
      message: "Invalid startDate or deadline format",
    });
  }

  if (updatedStartDate >= updatedDeadline) {
    return res.status(400).json({
      message: "Deadline must be greater than startDate",
    });
  }

  contest.title = updatedTitle;
  contest.description = updatedDescription;
  contest.rewards = updatedRewards;
  contest.startDate = updatedStartDate;
  contest.deadline = updatedDeadline;
  contest.status = getStatus(updatedStartDate, updatedDeadline);

  if (image) {
    contest.image = image;
  }

  await contest.save();

  const populatedContest = await Contest.findById(contest._id).populate(
    "createdBy",
    "name email"
  );

  return res.status(200).json({
    success: true,
    message: "Contest updated successfully",
    contest: populatedContest,
  });
});

// ===============================
// DELETE CONTEST
// ===============================
export const deleteContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  await contest.deleteOne();

  return res.status(200).json({
    success: true,
    message: "Contest deleted successfully",
  });
});

// ===============================
// GET ACTIVE CONTESTS
// ===============================
export const getActiveContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    startDate: { $lte: now },
    deadline: { $gt: now },
  })
    .populate("createdBy", "name email")
    .sort({ deadline: 1 });

  return res.status(200).json({
    success: true,
    message: "Active contests fetched successfully",
    contests,
  });
});

// ===============================
// GET UPCOMING CONTESTS
// ===============================
export const getUpcomingContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    startDate: { $gt: now },
  })
    .populate("createdBy", "name email")
    .sort({ startDate: 1 });

  return res.status(200).json({
    success: true,
    message: "Upcoming contests fetched successfully",
    contests,
  });
});

// ===============================
// GET COMPLETED CONTESTS
// ===============================
export const getCompletedContests = asyncHandler(async (req, res) => {
  const now = new Date();

  const contests = await Contest.find({
    deadline: { $lte: now },
  })
    .populate("createdBy", "name email")
    .sort({ deadline: -1 });

  return res.status(200).json({
    success: true,
    message: "Completed contests fetched successfully",
    contests,
  });
});

console.log("contest controller is working");