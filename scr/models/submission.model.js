// import mongoose from "mongoose";

// const submissionSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     },
    
//     team: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Team"
//     },

//     contest: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Contest",
//       required: true
//     },

//     // title: {
//     //   type: String,
//     //   required: true
//     // },

//     // description: String,

//     githubLink: {
//       type: String,
//       required: true,
//       trim: true
//     },

//     liveUrl: {
//       type: String,
//       trim: true
//     },

//     totalScore: {
//       type: Number,
//       default: 0
//     },

//     remarks: String,

//     status: {
//       type: String,
//       enum: ["pending", "evaluated"],
//       default: "pending"
//     }
//   },
//   { timestamps: true }
// );

// submissionSchema.index(
//   { contest: 1, team: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       team: { $type: "objectId" }
//     }
//   }
// );

// submissionSchema.index(
//   { contest: 1, user: 1 },
//   {
//     unique: true,
//     partialFilterExpression: {
//       team: null
//     }
//   }
// );

// export const Submission = mongoose.model("Submission", submissionSchema);

//   console.log("submission model is working");


// import mongoose from "mongoose";

// const submissionSchema = new mongoose.Schema(
//   {
//     user: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },

//     team: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Team",
//       required: true,
//     },

//     contest: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Contest",
//       required: true,
//     },

//     githubLink: {
//       type: String,
//       required: true,
//       trim: true,
//     },

//     liveUrl: {
//       type: String,
//       trim: true,
//       default: "",
//     },

//     totalScore: {
//       type: Number,
//       default: 0,
//     },

//     remarks: {
//       type: String,
//       default: "",
//     },

//     status: {
//       type: String,
//       enum: ["pending", "evaluated"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// submissionSchema.index({ contest: 1, team: 1 }, { unique: true });

// export const Submission = mongoose.model("Submission", submissionSchema);

// console.log("submission model is working");


import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    // কে submit button চাপলো (optional but useful)
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true, 
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    githubLink: {
      type: String,
      required: true,
      trim: true,
    },

    liveUrl: {
      type: String,
      trim: true,
      default: "",
    },

    totalScore: {
      type: Number,
      default: 0,
    },

    remarks: {
      type: String,
      default: "",
    },

    status: {
      type: String,
      enum: ["pending", "evaluated"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// same team same contest → one submission
submissionSchema.index({ contest: 1, team: 1 }, { unique: true });

export const Submission = mongoose.model("Submission", submissionSchema);

console.log("submission model is working");