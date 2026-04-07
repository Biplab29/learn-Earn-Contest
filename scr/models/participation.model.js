import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true
    },

    // NEW: Helps distinguish how they joined
    participationType: {
      type: String,
      enum: ["solo", "team"],
      default: "solo"
    },

    // NEW: If they joined as a team, link the team here
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Team",
      default: null 
    }
  },
  { timestamps: true }
);

// Optional: Add a compound index to strictly prevent a user from joining the same contest twice
participationSchema.index({ user: 1, contest: 1 }, { unique: true });

export const Participation = mongoose.model("Participation", participationSchema);

console.log("participation model is working");