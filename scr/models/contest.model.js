import mongoose from "mongoose";

const contestSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true
    },

    description: String,

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

    rewards: {
      type: String
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
    }
  },
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);

console.log("contest model is working");