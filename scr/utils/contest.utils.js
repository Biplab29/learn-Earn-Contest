import removeCloudinaryFile from "./removeCloudinaryFile.js";

// =====================================================
// GET ONE UPLOADED FILE BY FIELD NAME
// বাংলা: req.file বা req.files থেকে নির্দিষ্ট field-এর file বের করবে
// English: get one uploaded file by field name
// =====================================================
export const getUploadedFile = (req, fieldName) => {
  if (req.file && req.file.fieldname === fieldName) {
    return req.file;
  }

  if (req.files && Array.isArray(req.files[fieldName])) {
    return req.files[fieldName][0] || null;
  }

  return null;
};

// =====================================================
// GET ALL PROJECT BRIEFING FILES
// বাংলা: project briefing related সব file collect করবে
// English: get all uploaded project briefing files
// =====================================================
export const getProjectBriefingFiles = (req) => {
  const files = [];

  if (req.files?.projectBriefing?.length) {
    files.push(...req.files.projectBriefing);
  }

  if (req.files?.projectBriefingPdf?.length) {
    files.push(...req.files.projectBriefingPdf);
  }

  return files;
};

// =====================================================
// GET FIRST PROJECT BRIEFING FILE
// বাংলা: প্রথম project briefing file return করবে
// English: get first project briefing file
// =====================================================
export const getProjectBriefingFile = (req) => {
  const files = getProjectBriefingFiles(req);
  return files[0] || null;
};

// CHECK VALID DATE
//  date valid kina check korbe
// validate JavaScript Date object
// =====================================================
export const isValidDate = (value) => {
  return value instanceof Date && !Number.isNaN(value.getTime());
};

// NORMALIZE REWARDS
// rewards string/array ke clean array-তে convert করবে
// normalize rewards input into a clean array
// =====================================================
export const normalizeRewards = (rewards) => {
  if (Array.isArray(rewards)) {
    return rewards
      .map((item) => String(item).trim())
      .filter(Boolean);
  }

  if (typeof rewards === "string") {
    return rewards
      .split(",")
      .map((item) => item.trim())
      .filter(Boolean);
  }

  return [];
};

// SERIALIZE ONE CONTEST
// contest response clean forma a return korbe
// serialize single contest response
// =====================================================
export const serializeContest = (contest) => {
  if (!contest) return null;

  return {
    _id: contest._id,
    title: contest.title,
    category: contest.category,
    description: contest.description,
    image: contest.image || "",
    imagePublicId: contest.imagePublicId || "",
    projectBriefing: contest.projectBriefing || "",
    projectBriefingPublicId: contest.projectBriefingPublicId || "",
    projectBriefingOriginalName: contest.projectBriefingOriginalName || "",
    startDate: contest.startDate,
    deadline: contest.deadline,
    status: contest.status,
    isClosed: contest.isClosed,
    participationType: contest.participationType,
    maxTeamSize: contest.maxTeamSize,
    rewards: contest.rewards || [],
    winner: contest.winner || null,
    createdBy: contest.createdBy || null,
    createdAt: contest.createdAt,
    updatedAt: contest.updatedAt,
  };
};

// SERIALIZE MULTIPLE CONTESTS
//  onk contest serialize korbe
//serialize contest list
// =====================================================
export const serializeContests = (contests = []) => {
  return contests.map((contest) => serializeContest(contest));
};


// GET PROJECT BRIEFING DOWNLOAD URL
// project briefing download link return korbe
//  get project briefing download URL
// =====================================================
export const getProjectBriefingDownloadUrl = (contest) => {
  if (!contest) return "";
  return contest.projectBriefing || "";
};

// CLEANUP CONTEST UPLOADS
//validation fail hole uploaded image/pdf cloudinary theka delete korbe
// cleanup uploaded contest files from cloudinary
// =====================================================
export const cleanupContestUploads = async (req) => {
  const imageFile = getUploadedFile(req, "image");
  const projectBriefingFiles = getProjectBriefingFiles(req);

  const cleanupTasks = [];

  if (imageFile?.filename) {
    cleanupTasks.push(removeCloudinaryFile(imageFile.filename));
  }

  for (const file of projectBriefingFiles) {
    if (file?.filename) {
      cleanupTasks.push(
        removeCloudinaryFile(file.filename, { resourceType: "raw" })
      );
    }
  }

  await Promise.all(cleanupTasks);
};


