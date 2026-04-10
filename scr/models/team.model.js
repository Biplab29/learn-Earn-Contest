import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

  teamName: {
    type: String,
    required: true,
    trim: true
  },
  
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User" 
    }
  ],

  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest"
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

export const Team = mongoose.model("Team", teamSchema);