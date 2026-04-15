// import mongoose from "mongoose";

// const participationSchema = new mongoose.Schema(
//   {
//     contest: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Contest",
//       required: true
//     },

//     participationType: {
//       type: String,
//       enum: ["solo", "team"],
//       required: true
//     },

//     team: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Team",
//       default: null 
//     },

//     status: {
//       type: String,
//       default: undefined,
//       validate: {
//         validator: (value) => value == null || value === "submitted",
//         message: "Participation status can only be 'submitted' when present."
//       }
//     }
//   },

//   { timestamps: true }
// );

// participationSchema.pre("validate", function () {
//   if (this.participationType === "solo") {
//     this.team = null;
//   }
// });

// participationSchema.path("team").validate(function (value) {
//   if (this.participationType === "team") {
//     return !!value;
//   }

//   return value === null;
// }, "Team participations must include a team, and solo participations must not include one.");

// // Optional: Add a compound index to strictly prevent a user from joining the same contest twice
// participationSchema.index({ user: 1, contest: 1 }, { unique: true });
// participationSchema.index({ contest: 1, team: 1 });

// export const Participation = mongoose.model("Participation", participationSchema);

// console.log("participation model is working");


import mongoose from "mongoose";

const participationSchema = new mongoose.Schema(
  {
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",
      required: true,
    },

    participationType: {
      type: String,
      enum: ["solo", "team"],
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

// ekta team ekta contest a ekbar eii join korte parbe

participationSchema.index({ contest: 1, team: 1 }, { unique: true });

export const Participation = mongoose.model("Participation", participationSchema);

console.log("participation model is working");