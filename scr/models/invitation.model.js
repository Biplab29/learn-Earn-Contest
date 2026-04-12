// import mongoose from "mongoose";

// const invitationSchema = new mongoose.Schema(
//   {
//     invitedUser: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       default: null,
//     },
//     email: {
//       type: String,
//       trim: true,
//       lowercase: true,
//       default: null,
//     },
//     team: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "Team",
//       required: true,
//     },
//     invitedBy: {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true,
//     },
//     token: {
//       type: String,
//       required: true,
//       unique: true,
//     },
//     tokenExpiry: {
//       type: Date,
//       required: true,
//     },
//     status: {
//       type: String,
//       enum: ["pending", "accepted", "rejected"],
//       default: "pending",
//     },
//   },
//   { timestamps: true }
// );

// invitationSchema.pre("validate", function (next) {
//   if (this.email) {
//     this.email = this.email.trim().toLowerCase();
//   }

//   if (!this.invitedUser && !this.email) {
//     this.invalidate(
//       "invitedUser",
//       "An invitation must include an invited user or an invited email."
//     );
//   }

//   next();
// });

// // Auto delete after expiry time
// invitationSchema.index({ tokenExpiry: 1 }, { expireAfterSeconds: 0 });

// export const Invitation = mongoose.model("Invitation", invitationSchema);

// console.log("Invitation model is working");
