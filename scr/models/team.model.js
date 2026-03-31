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
  // leader: {
  //   type: mongoose.Schema.Types.ObjectId,
  //   ref: "User"
  // },
  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest"
  }
}, { timestamps: true });

export const Team = mongoose.model("Team", teamSchema);