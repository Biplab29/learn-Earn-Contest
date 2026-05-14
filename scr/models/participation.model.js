
import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "submitted"],
      default: "pending",
    },
  },
  { timestamps: true }
);

// One participation document should represent one team inside one contest.
// The partial filter keeps index sync safe even if old legacy rows do not have a team field.
participationSchema.index(
  { contest: 1, team: 1 },
  {
    unique: true,
    partialFilterExpression: {
      team: { $exists: true },
    },
  }
);

export const Participation = mongoose.model("Participation", participationSchema);

console.log("participation model is working");
