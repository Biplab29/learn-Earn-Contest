
import asyncHandler from "../middleware/asyncHandler.js";
import cloudinary from "../config/cloudinary.js";
import { Contest, getContestStatus } from "../models/contest.model.js";
import removeCloudinaryFile from "../utils/removeCloudinaryFile.js";

const PROJECT_BRIEFING_UPLOAD_FIELDS = [
  "projectBriefing",
  "projectBriefingPdf",
];

const isValidDate = (date) => {
  return date instanceof Date && !isNaN(date.getTime());
};

const getUploadedFiles = (req, fieldName) => {
  const fieldFiles = req.files?.[fieldName];

  if (!Array.isArray(fieldFiles) || fieldFiles.length === 0) {
    return [];
  }

  return fieldFiles;
};

const getUploadedFile = (req, fieldName) => {
  const fieldNames = Array.isArray(fieldName) ? fieldName : [fieldName];

  for (const currentFieldName of fieldNames) {
    const [fieldFile] = getUploadedFiles(req, currentFieldName);

    if (fieldFile) {
      return fieldFile;
    }
  }

  return null;
};

const getProjectBriefingFiles = (req) =>
  PROJECT_BRIEFING_UPLOAD_FIELDS.flatMap((fieldName) =>
    getUploadedFiles(req, fieldName)
  );

const getProjectBriefingFile = (req) =>
  getUploadedFile(req, PROJECT_BRIEFING_UPLOAD_FIELDS);

const normalizeRewards = (rewards) => {
  if (Array.isArray(rewards)) {
    return rewards
      .map((reward) => `${reward}`.trim())
      .filter(Boolean);
  }

  if (typeof rewards === "string") {
    const trimmedRewards = rewards.trim();

    if (!trimmedRewards) {
      return [];
    }

    if (trimmedRewards.startsWith("[")) {
      try {
        const parsedRewards = JSON.parse(trimmedRewards);

        if (Array.isArray(parsedRewards)) {
          return parsedRewards
            .map((reward) => `${reward}`.trim())
            .filter(Boolean);
        }
      } catch (error) {
        console.warn("Unable to parse rewards JSON:", error.message);
      }
    }

    return [trimmedRewards];
  }

  return [];
};

const cleanupContestUploads = async (req) => {
  const filesToCleanup = [
    ...getUploadedFiles(req, "image").map((file) => ({
      file,
      options: undefined,
    })),
    ...getProjectBriefingFiles(req).map((file) => ({
      file,
      options: {
        resourceType: "raw",
      },
    })),
  ];

  await Promise.all(
    filesToCleanup.map(({ file, options }) =>
      removeCloudinaryFile(file, options)
    )
  );
};

const getProjectBriefingDownloadUrl = (contest) => {
  if (!contest?.projectBriefingPublicId) {
    return contest?.projectBriefing || "";
  }

  return cloudinary.url(contest.projectBriefingPublicId, {
    resource_type: "raw",
    type: "upload",
    flags: "attachment",
    secure: true,
  });
};

const serializeContest = (contest) => {
  if (!contest) {
    return contest;
  }

  const serializedContest = contest.toObject ? contest.toObject() : contest;

  return {
    ...serializedContest,
    projectBriefingDownloadUrl: getProjectBriefingDownloadUrl(serializedContest),
  };
};

const serializeContests = (contests) => contests.map(serializeContest);

export const createContest = asyncHandler(async (req, res) => {
  const {
    title,
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

  if (projectBriefingFiles.length > 1) {
    await cleanupContestUploads(req);

    return res.status(400).json({
      message: "Upload only one project briefing PDF",
    });
  }

  if (!title || !description || !startDate || !deadline || normalizedRewards.length === 0) {
    await cleanupContestUploads(req);

    return res.status(400).json({
      message: "Title, description, startDate, deadline, and rewards are required",
    });
  }

  if (!req.user || !req.user._id) {
    await cleanupContestUploads(req);

    return res.status(401).json({
      message: "Unauthorized user",
    });
  }

  const type = participationType || "solo";

  if (!["solo", "team", "both"].includes(type)) {
    await cleanupContestUploads(req);

    return res.status(400).json({
      message: "participationType must be 'solo', 'team', or 'both'",
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

  let contest;

  try {
    contest = await Contest.create({
      title: title.trim(),
      description: description.trim(),
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
    contests: serializeContests(contests),
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
    contest: serializeContest(contest),
  });
});

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

// ===============================
// UPDATE CONTEST
// ===============================
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

  const updatedTitle = req.body.title ?? contest.title;
  const updatedDescription = req.body.description ?? contest.description;
  const updatedRewards = normalizeRewards(req.body.rewards ?? contest.rewards);
  const updatedParticipationType =
    req.body.participationType ?? contest.participationType;
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

  if (!updatedTitle?.trim() || !updatedDescription?.trim() || updatedRewards.length === 0) {
    await cleanupContestUploads(req);

    return res.status(400).json({
      message: "Title, description, startDate, deadline, and rewards are required",
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
    updatedParticipationType !== "solo" &&
    (!Number.isInteger(updatedMaxTeamSize) || updatedMaxTeamSize < 2)
  ) {
    await cleanupContestUploads(req);

    return res.status(400).json({
      message: "Team or both-mode contests require a maxTeamSize of at least 2",
    });
  }

  const previousImagePublicId = contest.imagePublicId;
  const previousProjectBriefingPublicId = contest.projectBriefingPublicId;

  contest.title = updatedTitle.trim();
  contest.description = updatedDescription.trim();
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
  await Promise.all([
    removeCloudinaryFile(contest.imagePublicId),
    removeCloudinaryFile(contest.projectBriefingPublicId, {
      resourceType: "raw",
    }),
  ]);

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
    contests: serializeContests(contests),
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
    contests: serializeContests(contests),
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
    contests: serializeContests(contests),
  });
});

console.log("contest controller is working");
