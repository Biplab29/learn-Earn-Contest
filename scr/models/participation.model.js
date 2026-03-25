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
    }
  },
  { timestamps: true }
);


export const Participation = mongoose.model("Participation", participationSchema);

