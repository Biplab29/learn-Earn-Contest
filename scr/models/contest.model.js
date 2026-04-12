// import mongoose from "mongoose";

// const contestSchema = new mongoose.Schema(

//   {
//     title: {
//       type: String,
//       required: true
//     },

//     description: String,

//     image: {
//       type: String
//     },

//     startDate: {
//       type: Date,
//       required: true 
//     },

//     deadline: {
//       type: Date,
//       required: true
//     },

//     rewards: [{
//       type: String
//     }],

//     createdBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },

//     status: {
//       type: String,
//       enum: ["upcoming", "active", "completed"],
//       default: "upcoming"  
//     }
//   },
//   { timestamps: true }
// );

// export const Contest = mongoose.model("Contest", contestSchema);

// console.log("contest model is working");

import mongoose from "mongoose";

export const getContestStatus = ({ startDate, deadline, isClosed = false }) => {
  const now = new Date();

  if (isClosed) return "completed";
  if (new Date(startDate) <= now && new Date(deadline) > now) return "active";
  if (new Date(deadline) <= now) return "completed";
  return "upcoming";
};

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },
    image: {
      type: String
    },

    startDate: {
      type: Date,
      required: true
    },

    deadline: {
      type: Date,
      required: true
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    status: {
      type: String,
      enum: ["upcoming", "active", "completed"],
      default: "upcoming"
    },

    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Submission",
      default: null,
    },
    
    isClosed: {
      type: Boolean,
      default: false
    },

    participationType: {
      type: String,
      enum: ['solo', 'team'],
      default: 'solo',
      required: true
    },

    maxTeamSize: {
      type: Number,
      min: 1,
      default: 1
    },

    rewards: [{
      type: String,
      required: true
    }],


  },

  { timestamps: true }
);

contestSchema.pre("validate", function () {
  if (this.participationType === "solo") {
    this.maxTeamSize = 1;
  }

  this.status = getContestStatus(this);
});

contestSchema.path("maxTeamSize").validate(function (value) {
  if (this.participationType === "team" || this.participationType === "both") {
    return value >= 2;
  }

  return value === 1;
}, "Team or both-mode contests must allow at least 2 members, and solo contests must have a maxTeamSize of 1.");

contestSchema.methods.syncStatus = function () {
  this.status = getContestStatus(this);
  return this.status;
};

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
          update: {
            $set: { status: nextStatus }
          }
        }
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
