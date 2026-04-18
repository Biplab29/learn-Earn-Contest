
import asyncHandler from "../middleware/asyncHandler.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import removeCloudinaryFile from "../utils/removeCloudinaryFile.js";
import {
  cleanupContestUploads,
  getProjectBriefingDownloadUrl,
  getProjectBriefingFile,
  getProjectBriefingFiles,
  getUploadedFile,
  isValidDate,
  normalizeRewards,
  serializeContest,
  serializeContests,
} from "../utils/contest.utils.js";

// =====================================================
// CREATE CONTEST
// =====================================================
// export const createContest = asyncHandler(async (req, res) => {
//   const {
//     title,
//     category,
//     description,
//     startDate,
//     deadline,
//     participationType,
//     maxTeamSize,
//     rewards,
//   } = req.body;

//   const allowedCategories = [
//     "Web Dev",
//     "AI/ML",
//     "App Dev",
//     "Design",
//     "Data Science",
//   ];

//   const imageFile = getUploadedFile(req, "image");
//   const projectBriefingFiles = getProjectBriefingFiles(req);
//   const projectBriefingFile = getProjectBriefingFile(req);
//   const normalizedRewards = normalizeRewards(rewards);

//   const normalizedTitle = title?.trim();
//   const normalizedCategory = category?.trim();
//   const normalizedDescription = description?.trim();
//   const type = participationType?.trim();

//   if (projectBriefingFiles.length > 1) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Upload only one project briefing PDF",
//     });
//   }

//   if (
//     !normalizedTitle ||
//     !normalizedCategory ||
//     !normalizedDescription ||
//     !startDate ||
//     !deadline ||
//     !type ||
//     !Array.isArray(normalizedRewards) ||
//     normalizedRewards.length === 0
//   ) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message:
//         "Title, category, description, startDate, deadline, participationType, and rewards are required",
//     });
//   }

//   if (!allowedCategories.includes(normalizedCategory)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Invalid category value",
//     });
//   }

//   if (!req.user || !req.user._id) {
//     await cleanupContestUploads(req);
//     return res.status(401).json({
//       message: "Unauthorized user",
//     });
//   }

//   if (!["solo", "team", "both"].includes(type)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "participationType must be 'solo', 'team', or 'both'",
//     });
//   }

//   if (type === "solo" && maxTeamSize && Number(maxTeamSize) !== 1) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Solo contests must have maxTeamSize of 1",
//     });
//   }

//   if (type !== "solo" && (!maxTeamSize || Number(maxTeamSize) < 2)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Team or both-mode contests require a maxTeamSize of at least 2",
//     });
//   }

//   const parsedStartDate = new Date(startDate);
//   const parsedDeadline = new Date(deadline);

//   if (!isValidDate(parsedStartDate) || !isValidDate(parsedDeadline)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Invalid startDate or deadline format",
//     });
//   }

//   if (parsedStartDate >= parsedDeadline) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Deadline must be greater than startDate",
//     });
//   }

//   const existingContest = await Contest.findOne({
//     title: normalizedTitle,
//   }).select("_id");

//   if (existingContest) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Contest with this title already exists",
//     });
//   }

//   let contest;

//   try {
//     contest = await Contest.create({
//       title: normalizedTitle,
//       category: normalizedCategory,
//       description: normalizedDescription,
//       startDate: parsedStartDate,
//       deadline: parsedDeadline,
//       rewards: normalizedRewards,
//       image: imageFile?.path || "",
//       imagePublicId: imageFile?.filename || "",
//       projectBriefing: projectBriefingFile?.path || "",
//       projectBriefingPublicId: projectBriefingFile?.filename || "",
//       projectBriefingOriginalName: projectBriefingFile?.originalname || "",
//       participationType: type,
//       maxTeamSize: type === "solo" ? 1 : Number(maxTeamSize),
//       createdBy: req.user._id,
//     });
//   } catch (error) {
//     await cleanupContestUploads(req);
//     throw error;
//   }

//   const populatedContest = await Contest.findById(contest._id).populate(
//     "createdBy",
//     "name email"
//   );

//   return res.status(201).json({
//     success: true,
//     message: "Contest created successfully",
//     contest: serializeContest(populatedContest),
//   });
// });


export const createContest = asyncHandler(async (req, res) => {
  const {
    title,
    category,
    description,
    startDate,
    deadline,
    participationType,
    maxTeamSize,
    rewards,
  } = req.body;

  const imageFile = getUploadedFile(req, "image");
  const projectBriefingFiles = getProjectBriefingFiles(req);
  const projectBriefingFile = getProjectBriefingFile(req);
  const normalizedRewards = normalizeRewards(rewards);

  const normalizedTitle = title?.trim();
  const normalizedCategory = category?.trim();
  const normalizedDescription = description?.trim();
  const type = participationType?.trim();

  if (projectBriefingFiles.length > 1) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Upload only one project briefing PDF",
    });
  }

  if (
    !normalizedTitle ||
    !normalizedCategory ||
    !normalizedDescription ||
    !startDate ||
    !deadline ||
    !type ||
    !Array.isArray(normalizedRewards) ||
    normalizedRewards.length === 0
  ) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message:
        "Title, category, description, startDate, deadline, participationType, and rewards are required",
    });
  }

  if (!req.user || !req.user._id) {
    await cleanupContestUploads(req);
    return res.status(401).json({
      message: "Unauthorized user",
    });
  }

  if (!["solo", "team", "both"].includes(type)) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "participationType must be 'solo', 'team', or 'both'",
    });
  }

  if (type === "solo" && maxTeamSize && Number(maxTeamSize) !== 1) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Solo contests must have maxTeamSize of 1",
    });
  }

  if (type !== "solo" && (!maxTeamSize || Number(maxTeamSize) < 2)) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Team or both-mode contests require a maxTeamSize of at least 2",
    });
  }

  const parsedStartDate = new Date(startDate);
  const parsedDeadline = new Date(deadline);

  if (!isValidDate(parsedStartDate) || !isValidDate(parsedDeadline)) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Invalid startDate or deadline format",
    });
  }

  if (parsedStartDate >= parsedDeadline) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Deadline must be greater than startDate",
    });
  }

  const existingContest = await Contest.findOne({
    title: normalizedTitle,
  }).select("_id");

  if (existingContest) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Contest with this title already exists",
    });
  }

  let contest;

  try {
    contest = await Contest.create({
      title: normalizedTitle,
      category: normalizedCategory,
      description: normalizedDescription,
      startDate: parsedStartDate,
      deadline: parsedDeadline,
      rewards: normalizedRewards,
      image: imageFile?.path || "",
      imagePublicId: imageFile?.filename || "",
      projectBriefing: projectBriefingFile?.path || "",
      projectBriefingPublicId: projectBriefingFile?.filename || "",
      projectBriefingOriginalName: projectBriefingFile?.originalname || "",
      participationType: type,
      maxTeamSize: type === "solo" ? 1 : Number(maxTeamSize),
      createdBy: req.user._id,
    });
  } catch (error) {
    await cleanupContestUploads(req);
    throw error;
  }

  const populatedContest = await Contest.findById(contest._id).populate(
    "createdBy",
    "name email"
  );

  return res.status(201).json({
    success: true,
    message: "Contest created successfully",
    contest: serializeContest(populatedContest),
  });
});

// =====================================================
// GET ALL CONTESTS
// =====================================================
export const getAllContests = asyncHandler(async (req, res) => {
  await Contest.syncStatuses();

  const filter = {};

  if (req.query.category?.trim()) {
    filter.category = req.query.category.trim();
  }

  const contests = await Contest.find(filter)
    .populate("createdBy", "name email")
    .sort({ createdAt: -1 });

  return res.status(200).json({
    success: true,
    contests: serializeContests(contests),
  });
});

// =====================================================
// GET SINGLE CONTEST
// =====================================================
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
    contest: serializeContest(contest),
  });
});

// =====================================================
// DOWNLOAD PROJECT BRIEFING
// =====================================================
export const downloadProjectBriefing = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id).select(
    "projectBriefing projectBriefingPublicId"
  );

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const downloadUrl = getProjectBriefingDownloadUrl(contest);

  if (!downloadUrl) {
    return res.status(404).json({
      success: false,
      message: "Project briefing PDF not found for this contest",
    });
  }

  return res.redirect(downloadUrl);
});

// =====================================================
// UPDATE CONTEST
// =====================================================
// export const updateContest = asyncHandler(async (req, res) => {
//   const contest = await Contest.findById(req.params.id);
//   const imageFile = getUploadedFile(req, "image");
//   const projectBriefingFiles = getProjectBriefingFiles(req);
//   const projectBriefingFile = getProjectBriefingFile(req);

//   const shouldRemoveProjectBriefing =
//     req.body.removeProjectBriefing === true ||
//     req.body.removeProjectBriefing === "true";

//   const allowedCategories = [
//     "Web Dev",
//     "AI/ML",
//     "App Dev",
//     "Design",
//     "Data Science",
//   ];

//   if (projectBriefingFiles.length > 1) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Upload only one project briefing PDF",
//     });
//   }

//   if (!contest) {
//     await cleanupContestUploads(req);
//     return res.status(404).json({
//       success: false,
//       message: "Contest not found",
//     });
//   }

//   const updatedTitle = (req.body.title ?? contest.title)?.trim();
//   const updatedCategory = (req.body.category ?? contest.category)?.trim();
//   const updatedDescription = (req.body.description ?? contest.description)?.trim();
//   const updatedRewards = normalizeRewards(req.body.rewards ?? contest.rewards);
//   const updatedParticipationType =
//     (req.body.participationType ?? contest.participationType)?.trim();

//   const updatedMaxTeamSize =
//     updatedParticipationType !== "solo"
//       ? Number(req.body.maxTeamSize ?? contest.maxTeamSize)
//       : 1;

//   const updatedStartDate = req.body.startDate
//     ? new Date(req.body.startDate)
//     : new Date(contest.startDate);

//   const updatedDeadline = req.body.deadline
//     ? new Date(req.body.deadline)
//     : new Date(contest.deadline);

//   if (
//     !updatedTitle ||
//     !updatedCategory ||
//     !updatedDescription ||
//     !Array.isArray(updatedRewards) ||
//     updatedRewards.length === 0
//   ) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message:
//         "Title, category, description, startDate, deadline, and rewards are required",
//     });
//   }

//   if (!allowedCategories.includes(updatedCategory)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Invalid category value",
//     });
//   }

//   if (!isValidDate(updatedStartDate) || !isValidDate(updatedDeadline)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Invalid startDate or deadline format",
//     });
//   }

//   if (updatedStartDate >= updatedDeadline) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Deadline must be greater than startDate",
//     });
//   }

//   if (!["solo", "team", "both"].includes(updatedParticipationType)) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "participationType must be 'solo', 'team', or 'both'",
//     });
//   }

//   if (
//     updatedParticipationType === "solo" &&
//     req.body.maxTeamSize &&
//     Number(req.body.maxTeamSize) !== 1
//   ) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Solo contests must have maxTeamSize of 1",
//     });
//   }

//   if (
//     updatedParticipationType !== "solo" &&
//     (!Number.isInteger(updatedMaxTeamSize) || updatedMaxTeamSize < 2)
//   ) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Team or both-mode contests require a maxTeamSize of at least 2",
//     });
//   }

//   const duplicateContest = await Contest.findOne({
//     title: updatedTitle,
//     _id: { $ne: contest._id },
//   }).select("_id");

//   if (duplicateContest) {
//     await cleanupContestUploads(req);
//     return res.status(400).json({
//       message: "Contest with this title already exists",
//     });
//   }

//   const previousImagePublicId = contest.imagePublicId;
//   const previousProjectBriefingPublicId = contest.projectBriefingPublicId;

//   contest.title = updatedTitle;
//   contest.category = updatedCategory;
//   contest.description = updatedDescription;
//   contest.rewards = updatedRewards;
//   contest.participationType = updatedParticipationType;
//   contest.maxTeamSize = updatedMaxTeamSize;
//   contest.startDate = updatedStartDate;
//   contest.deadline = updatedDeadline;
//   contest.status = getContestStatus(contest);

//   if (imageFile) {
//     contest.image = imageFile.path;
//     contest.imagePublicId = imageFile.filename || "";
//   }

//   if (projectBriefingFile) {
//     contest.projectBriefing = projectBriefingFile.path;
//     contest.projectBriefingPublicId = projectBriefingFile.filename || "";
//     contest.projectBriefingOriginalName = projectBriefingFile.originalname || "";
//   } else if (shouldRemoveProjectBriefing) {
//     contest.projectBriefing = "";
//     contest.projectBriefingPublicId = "";
//     contest.projectBriefingOriginalName = "";
//   }

//   try {
//     await contest.save();
//   } catch (error) {
//     await cleanupContestUploads(req);
//     throw error;
//   }

//   await Promise.all([
//     imageFile &&
//     previousImagePublicId &&
//     previousImagePublicId !== contest.imagePublicId
//       ? removeCloudinaryFile(previousImagePublicId)
//       : Promise.resolve(),

//     (projectBriefingFile || shouldRemoveProjectBriefing) &&
//     previousProjectBriefingPublicId &&
//     previousProjectBriefingPublicId !== contest.projectBriefingPublicId
//       ? removeCloudinaryFile(previousProjectBriefingPublicId, {
//           resourceType: "raw",
//         })
//       : Promise.resolve(),
//   ]);

//   const populatedContest = await Contest.findById(contest._id).populate(
//     "createdBy",
//     "name email"
//   );

//   return res.status(200).json({
//     success: true,
//     message: "Contest updated successfully",
//     contest: serializeContest(populatedContest),
//   });
// });

export const updateContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);
  const imageFile = getUploadedFile(req, "image");
  const projectBriefingFiles = getProjectBriefingFiles(req);
  const projectBriefingFile = getProjectBriefingFile(req);

  const shouldRemoveProjectBriefing =
    req.body.removeProjectBriefing === true ||
    req.body.removeProjectBriefing === "true";

  if (projectBriefingFiles.length > 1) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Upload only one project briefing PDF",
    });
  }

  if (!contest) {
    await cleanupContestUploads(req);
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  const updatedTitle = (req.body.title ?? contest.title)?.trim();
  const updatedCategory = (req.body.category ?? contest.category)?.trim();
  const updatedDescription = (req.body.description ?? contest.description)?.trim();
  const updatedRewards = normalizeRewards(req.body.rewards ?? contest.rewards);
  const updatedParticipationType =
    (req.body.participationType ?? contest.participationType)?.trim();

  const updatedMaxTeamSize =
    updatedParticipationType !== "solo"
      ? Number(req.body.maxTeamSize ?? contest.maxTeamSize)
      : 1;

  const updatedStartDate = req.body.startDate
    ? new Date(req.body.startDate)
    : new Date(contest.startDate);

  const updatedDeadline = req.body.deadline
    ? new Date(req.body.deadline)
    : new Date(contest.deadline);

  if (
    !updatedTitle ||
    !updatedCategory ||
    !updatedDescription ||
    !Array.isArray(updatedRewards) ||
    updatedRewards.length === 0
  ) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message:
        "Title, category, description, startDate, deadline, and rewards are required",
    });
  }

  if (!isValidDate(updatedStartDate) || !isValidDate(updatedDeadline)) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Invalid startDate or deadline format",
    });
  }

  if (updatedStartDate >= updatedDeadline) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Deadline must be greater than startDate",
    });
  }

  if (!["solo", "team", "both"].includes(updatedParticipationType)) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "participationType must be 'solo', 'team', or 'both'",
    });
  }

  if (
    updatedParticipationType === "solo" &&
    req.body.maxTeamSize &&
    Number(req.body.maxTeamSize) !== 1
  ) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Solo contests must have maxTeamSize of 1",
    });
  }

  if (
    updatedParticipationType !== "solo" &&
    (!Number.isInteger(updatedMaxTeamSize) || updatedMaxTeamSize < 2)
  ) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Team or both-mode contests require a maxTeamSize of at least 2",
    });
  }

  const duplicateContest = await Contest.findOne({
    title: updatedTitle,
    _id: { $ne: contest._id },
  }).select("_id");

  if (duplicateContest) {
    await cleanupContestUploads(req);
    return res.status(400).json({
      message: "Contest with this title already exists",
    });
  }

  const previousImagePublicId = contest.imagePublicId;
  const previousProjectBriefingPublicId = contest.projectBriefingPublicId;

  contest.title = updatedTitle;
  contest.category = updatedCategory;
  contest.description = updatedDescription;
  contest.rewards = updatedRewards;
  contest.participationType = updatedParticipationType;
  contest.maxTeamSize = updatedMaxTeamSize;
  contest.startDate = updatedStartDate;
  contest.deadline = updatedDeadline;
  contest.status = getContestStatus(contest);

  if (imageFile) {
    contest.image = imageFile.path;
    contest.imagePublicId = imageFile.filename || "";
  }

  if (projectBriefingFile) {
    contest.projectBriefing = projectBriefingFile.path;
    contest.projectBriefingPublicId = projectBriefingFile.filename || "";
    contest.projectBriefingOriginalName = projectBriefingFile.originalname || "";
  } else if (shouldRemoveProjectBriefing) {
    contest.projectBriefing = "";
    contest.projectBriefingPublicId = "";
    contest.projectBriefingOriginalName = "";
  }

  try {
    await contest.save();
  } catch (error) {
    await cleanupContestUploads(req);
    throw error;
  }

  await Promise.all([
    imageFile &&
    previousImagePublicId &&
    previousImagePublicId !== contest.imagePublicId
      ? removeCloudinaryFile(previousImagePublicId)
      : Promise.resolve(),

    (projectBriefingFile || shouldRemoveProjectBriefing) &&
    previousProjectBriefingPublicId &&
    previousProjectBriefingPublicId !== contest.projectBriefingPublicId
      ? removeCloudinaryFile(previousProjectBriefingPublicId, {
          resourceType: "raw",
        })
      : Promise.resolve(),
  ]);

  const populatedContest = await Contest.findById(contest._id).populate(
    "createdBy",
    "name email"
  );

  return res.status(200).json({
    success: true,
    message: "Contest updated successfully",
    contest: serializeContest(populatedContest),
  });
});

// =====================================================
// DELETE CONTEST
// =====================================================
export const deleteContest = asyncHandler(async (req, res) => {
  const contest = await Contest.findById(req.params.id);

  if (!contest) {
    return res.status(404).json({
      success: false,
      message: "Contest not found",
    });
  }

  await contest.deleteOne();

  await Promise.all([
    contest.imagePublicId
      ? removeCloudinaryFile(contest.imagePublicId)
      : Promise.resolve(),

    contest.projectBriefingPublicId
      ? removeCloudinaryFile(contest.projectBriefingPublicId, {
          resourceType: "raw",
        })
      : Promise.resolve(),
  ]);

  return res.status(200).json({
    success: true,
    message: "Contest deleted successfully",
  });
});

// =====================================================
// GET ACTIVE CONTESTS
// =====================================================
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
    contests: serializeContests(contests),
  });
});

// =====================================================
// GET UPCOMING CONTESTS
// =====================================================
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
    contests: serializeContests(contests),
  });
});

// =====================================================
// GET COMPLETED CONTESTS
// =====================================================
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
    contests: serializeContests(contests),
  });
});


console.log("contest controller is working");