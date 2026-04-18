
import mongoose from "mongoose";

// GET CONTEST STATUS
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

    //contest category
    
    category: {
      type: String,
      required: true,
      trim: true,
    },

  
    description: {
      type: String,
      trim: true,
    },

    image: {
      type: String,
    },

    imagePublicId: {
      type: String,
      default: "",
    },

    projectBriefing: {
      type: String,
      default: "",
    },

    projectBriefingPublicId: {
      type: String,
      default: "",
    },

    projectBriefingOriginalName: {
      type: String,
      default: "",
    },

    startDate: {
      type: Date,
      required: true,
    },

    deadline: {
      type: Date,
      required: true,
    },


    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },


    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming",
    },

  
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },

    isClosed: {
      type: Boolean,
      default: false,
    },

    participationType: {
      type: String,
      enum: ["solo", "team", "both"],
      required: true,
    },

    maxTeamSize: {
      type: Number,
      min: 1,
      default: 1,
    },

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
  if (this.participationType === "solo") {
    this.maxTeamSize = 1;
  }

  this.status = getContestStatus(this);
});



//TEAM SIZE VALIDATION

contestSchema.path("maxTeamSize").validate(
  function (value) {
    if (this.participationType === "team" || this.participationType === "both") {
      return value >= 2;
    }

    return value === 1;
  },
  "Team contests must allow at least 2 members, and solo contests must have a maxTeamSize of 1."
);



// INSTANCE METHOD: SYNC STATUS

contestSchema.methods.syncStatus = function () {
  this.status = getContestStatus(this);
  return this.status;
};



// SYNC MULTIPLE CONTEST STATUSES

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