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

    participationType: {
      type: String,
      enum: ['solo', 'team'],
      default: 'solo',
      required: true
    },

    maxTeamSize: {
      type: Number,
      default: 1
    },

    rewards: [{
    type: String, 
    required: true
}],

  },
  
  { timestamps: true }
);

export const Contest = mongoose.model("Contest", contestSchema);

console.log("contest model is working");