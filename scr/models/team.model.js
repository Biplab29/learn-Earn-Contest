import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

  teamName: {
    type: String,
    required: true,
    trim: true
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],

  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

teamSchema.path("members").validate(
  (members) => Array.isArray(members) && members.length > 0,
  "At least one team member is required"
);

teamSchema.index({ contest: 1, teamName: 1 }, { unique: true });

export const Team = mongoose.model("Team", teamSchema);
