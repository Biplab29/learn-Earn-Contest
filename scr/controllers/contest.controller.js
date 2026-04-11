
import asyncHandler from "../middleware/asyncHandler.js";
import { Contest, getContestStatus } from "../models/contest.model.js";

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

//   console.log("BODY =>", req.body);
//   console.log("USER =>", req.user);
//   console.log("FILE =>", req.file);

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

//   return res.status(201).json({
//     success: true,
//     message: "Contest created successfully",
//     contest,
//   });
// });

export const createContest = asyncHandler(async (req, res) => {
  // 1. Extract the new fields from req.body, including 'prize'
  const { 
    title, 
    description, 
    startDate, 
    deadline,  
    participationType, 
    maxTeamSize,
   rewards
  } = req.body;
  
  const image = req.file?.path || "";

  console.log("BODY =>", req.body);
  console.log("USER =>", req.user);
  console.log("FILE =>", req.file);

  // 2. Validate standard required fields (Added prize here)
  if (!title || !description || !startDate || !deadline || !rewards) {
    return res.status(400).json({
      message: "Title, description, startDate, deadline, and rewards are required",
    });
  }

  if (!req.user || !req.user._id) {
    return res.status(401).json({
      message: "Unauthorized user",
    });
  }

  // 3. Validate Participation Type logic
  const type = participationType || 'solo'; 

  if (!['solo', 'team'].includes(type)) {
    return res.status(400).json({
      message: "participationType must be either 'solo' or 'team'",
    });
  }

  if (type === 'team') {
    if (!maxTeamSize || Number(maxTeamSize) < 2) {
      return res.status(400).json({
        message: "Team contests require a maxTeamSize of at least 2",
      });
    }
  }

  // 4. Validate Dates
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

  // 5. Create the contest with the new data
  const contest = await Contest.create({
    title: title.trim(),
    description: description.trim(),
    startDate: parsedStartDate,
    deadline: parsedDeadline,
    rewards, 
    image,
    participationType: type,
    maxTeamSize: type === 'team' ? Number(maxTeamSize) : 1,
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
  await Contest.syncStatuses();

  const contests = await Contest.find()
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    contests,
  });
});

// ===============================
// GET SINGLE CONTEST
// ===============================
export const getContestById = asyncHandler(async (req, res) => {
  await Contest.syncStatuses({ _id: req.params.id });

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
    contest,
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
  const updatedParticipationType = req.body.participationType ?? contest.participationType;
  const updatedMaxTeamSize =
    updatedParticipationType === "team"
      ? Number(req.body.maxTeamSize ?? contest.maxTeamSize)
      : 1;
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

  if (!["solo", "team"].includes(updatedParticipationType)) {
    return res.status(400).json({
      message: "participationType must be either 'solo' or 'team'",
    });
  }

  if (
    updatedParticipationType === "team" &&
    (!Number.isInteger(updatedMaxTeamSize) || updatedMaxTeamSize < 2)
  ) {
    return res.status(400).json({
      message: "Team contests require a maxTeamSize of at least 2",
    });
  }

  contest.title = updatedTitle.trim();
  contest.description = updatedDescription?.trim?.() || "";
  contest.rewards = updatedRewards;
  contest.participationType = updatedParticipationType;
  contest.maxTeamSize = updatedMaxTeamSize;
  contest.startDate = updatedStartDate;
  contest.deadline = updatedDeadline;
  contest.status = getContestStatus(contest);

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
  await Contest.syncStatuses();

  const contests = await Contest.find({
    status: "active",
  })
    .populate("createdBy", "name email")
    .sort({ deadline: 1 });

  return res.status(200).json({
    success: true,
    message: "Active contests fetched successfully",
    contests,
  });
});

// GET UPCOMING CONTESTS

export const getUpcomingContests = asyncHandler(async (req, res) => {
  await Contest.syncStatuses();

  const contests = await Contest.find({
    status: "upcoming",
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
  await Contest.syncStatuses();

  const contests = await Contest.find({
    status: "completed",
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
