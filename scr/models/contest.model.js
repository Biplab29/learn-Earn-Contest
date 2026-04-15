


// import mongoose from "mongoose";

// export const getContestStatus = ({ startDate, deadline, isClosed = false }) => {
//   const now = new Date();

//   if (isClosed) return "completed";
//   if (new Date(startDate) <= now && new Date(deadline) > now) return "active";
//   if (new Date(deadline) <= now) return "completed";
//   return "upcoming";
// };

// const contestSchema = new mongoose.Schema(
//   {
//     title: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     category: {
//       type: String,
//       required: true,
//       trim: true,
//       enum: ["Web Dev", "AI/ML", "App Dev", "Design", "Data Science"]
//     },

//     description: {
//       type: String,
//       trim: true
//     },

//     image: {
//       type: String
//     },

//     imagePublicId: {
//       type: String,
//       default: ""
//     },

//     projectBriefing: {
//       type: String,
//       default: ""
//     },

//     projectBriefingPublicId: {
//       type: String,
//       default: ""
//     },

//     projectBriefingOriginalName: {
//       type: String,
//       default: ""
//     },

//     startDate: {
//       type: Date,
//       required: true
//     },

//     deadline: {
//       type: Date,
//       required: true
//     },

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     status: {
//       type: String,
//       enum: ["upcoming", "active", "completed"],
//       default: "upcoming"
//     },

//     winner: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Submission",
//       default: null,
//     },

//     isClosed: {
//       type: Boolean,
//       default: false
//     },

//     participationType: {
//       type: String,
//       enum: ["solo", "team", "both"],
//       default: "solo",
//       required: true
//     },

//     maxTeamSize: {
//       type: Number,
//       min: 1,
//       default: 1
//     },

//     rewards: [{
//       type: String,
//       required: true
//     }],
//   },
//   { timestamps: true }
// );

// contestSchema.pre("validate", function () {
//   if (this.participationType === "solo") {
//     this.maxTeamSize = 1;
//   }

//   this.status = getContestStatus(this);
// });

// contestSchema.path("maxTeamSize").validate(function (value) {
//   if (this.participationType === "team" || this.participationType === "both") {
//     return value >= 2;
//   }

//   return value === 1;
// }, "Team contests must allow at least 2 members, and solo contests must have a maxTeamSize of 1.");

// contestSchema.methods.syncStatus = function () {
//   this.status = getContestStatus(this);
//   return this.status;
// };

// contestSchema.statics.syncStatuses = async function (filter = {}) {
//   const contests = await this.find(filter).select("_id startDate deadline isClosed status");

//   const operations = contests
//     .map((contest) => {
//       const nextStatus = getContestStatus(contest);

//       if (contest.status === nextStatus) {
//         return null;
//       }

//       return {
//         updateOne: {
//           filter: { _id: contest._id },
//           update: { $set: { status: nextStatus } }
//         }
//       };
//     })
//     .filter(Boolean);

//   if (operations.length > 0) {
//     await this.bulkWrite(operations);
//   }

//   return operations.length;
// };

// export const Contest = mongoose.model("Contest", contestSchema);

// console.log("contest model is working");



import mongoose from "mongoose";


// =====================================================
// GET CONTEST STATUS
// বাংলা: startDate, deadline, isClosed দেখে contest status বের করে
// English: Returns contest status based on dates and close flag
// =====================================================
export const getContestStatus = ({ startDate, deadline, isClosed = false }) => {
  const now = new Date();

  if (isClosed) return "completed";

  if (new Date(startDate) <= now && new Date(deadline) > now) {
    return "active";
  }

  if (new Date(deadline) <= now) {
    return "completed";
  }

  return "upcoming";
};


// =====================================================
// CONTEST SCHEMA
// বাংলা: Contest model create করা হচ্ছে
// English: Contest schema definition
// =====================================================
const contestSchema = new mongoose.Schema(
  {
    // বাংলা: contest title
    // English: contest title
    title: {
      type: String,
      required: true,
      trim: true,
    },

    // বাংলা: contest category
    // English: contest category
    category: {
      type: String,
      required: true,
      trim: true,
      enum: ["Web Dev", "AI/ML", "App Dev", "Design", "Data Science"],
    },

    // বাংলা: contest description
    // English: contest description
    description: {
      type: String,
      trim: true,
    },

    // বাংলা: contest banner/image url
    // English: contest image
    image: {
      type: String,
    },

    // বাংলা: cloud/public id of image
    // English: image public id
    imagePublicId: {
      type: String,
      default: "",
    },

    // বাংলা: project briefing file/url
    // English: project briefing file
    projectBriefing: {
      type: String,
      default: "",
    },

    // বাংলা: briefing public id
    // English: project briefing public id
    projectBriefingPublicId: {
      type: String,
      default: "",
    },

    // বাংলা: original name of uploaded briefing file
    // English: original file name of project briefing
    projectBriefingOriginalName: {
      type: String,
      default: "",
    },

    // বাংলা: contest start date
    // English: contest start date
    startDate: {
      type: Date,
      required: true,
    },

    // বাংলা: contest deadline
    // English: contest deadline
    deadline: {
      type: Date,
      required: true,
    },

    // বাংলা: কে contest create করেছে
    // English: contest creator
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // বাংলা: current contest status
    // English: contest status
    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },

    // বাংলা: winner submission reference
    // English: winner submission reference
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },

    // বাংলা: manually contest close করলে
    // English: manual contest close flag
    isClosed: {
      type: Boolean,
      default: false,
    },

    // বাংলা: contest solo / team / both কোন type support করবে
    // English: participation type allowed for contest
    participationType: {
      type: String,
      enum: ["solo", "team", "both"],
      required: true,
    },

    // বাংলা: maximum team সদস্য সংখ্যা
    // English: maximum team size
    maxTeamSize: {
      type: Number,
      min: 1,
      default: 1,
    },

    // বাংলা: rewards/prizes list
    // English: reward list
    rewards: [
      {
        type: String,
        required: true,
      },
    ],
  },
  { timestamps: true }
);


// =====================================================
// PRE VALIDATE HOOK
// বাংলা: validate হওয়ার আগে কিছু rule apply হবে
// English: apply business rules before validation
// =====================================================
contestSchema.pre("validate", function () {
  // বাংলা: solo contest হলে maxTeamSize always 1 হবে
  // English: force maxTeamSize = 1 for solo contests
  if (this.participationType === "solo") {
    this.maxTeamSize = 1;
  }

  // বাংলা: status auto sync
  // English: auto-sync contest status
  this.status = getContestStatus(this);
});


// =====================================================
// MAX TEAM SIZE VALIDATION
// বাংলা: team/both contest হলে min 2 member allow করতে হবে
// English: validate maxTeamSize based on participation type
// =====================================================
contestSchema.path("maxTeamSize").validate(
  function (value) {
    if (this.participationType === "team" || this.participationType === "both") {
      return value >= 2;
    }

    return value === 1;
  },
  "Team contests must allow at least 2 members, and solo contests must have a maxTeamSize of 1."
);


// =====================================================
// INSTANCE METHOD: SYNC STATUS
// বাংলা: single contest document-এর status sync করবে
// English: sync status for one contest document
// =====================================================
contestSchema.methods.syncStatus = function () {
  this.status = getContestStatus(this);
  return this.status;
};


// =====================================================
// STATIC METHOD: SYNC MULTIPLE CONTEST STATUSES
// বাংলা: database-এর multiple contest status update করবে
// English: sync statuses for multiple contests
// =====================================================
contestSchema.statics.syncStatuses = async function (filter = {}) {
  const contests = await this.find(filter).select("_id startDate deadline isClosed status");

  const operations = contests
    .map((contest) => {
      const nextStatus = getContestStatus(contest);

      if (contest.status === nextStatus) {
        return null;
      }

      return {
        updateOne: {
          filter: { _id: contest._id },
          update: { $set: { status: nextStatus } },
        },
      };
    })
    .filter(Boolean);

  if (operations.length > 0) {
    await this.bulkWrite(operations);
  }

  return operations.length;
};

export const Contest = mongoose.model("Contest", contestSchema);

console.log("contest model is working");