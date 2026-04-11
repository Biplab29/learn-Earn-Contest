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
      required: true,
      trim: true
    },

    description: {
      type: String,
      trim: true
    },
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
      min: 1,
      default: 1
    },

    rewards: [{
    type: String, 
    required: true
}],

  },
  
  { timestamps: true }
);

contestSchema.pre("validate", function () {
  if (this.participationType === "solo") {
    this.maxTeamSize = 1;
  }
});

contestSchema.path("maxTeamSize").validate(function (value) {
  if (this.participationType === "team") {
    return value >= 2;
  }

  return value === 1;
}, "Team contests must allow at least 2 members, and solo contests must have a maxTeamSize of 1.");

export const Contest = mongoose.model("Contest", contestSchema);

console.log("contest model is working");
