import mongoose from "mongoose";

const submissionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },
    
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team"
    },

    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true
    },

    // title: {
    //   type: String,
    //   required: true
    // },

    // description: String,

    githubLink: {
      type: String,
      required: true
    },

    liveUrl: String,

    totalScore: {
      type: Number,
      default: 0
    },

    remarks: StringA,

    status: {
      type: String,
      enum: ["pending", "evaluated"],
      default: "pending"
    }
  },
  { timestamps: true }
);


export const Submission = mongoose.model("Submission", submissionSchema);

  console.log("submission model is working");