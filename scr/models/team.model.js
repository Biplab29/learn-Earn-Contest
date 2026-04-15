// import mongoose from "mongoose";

// const teamSchema = new mongoose.Schema({

//   teamName: {
//     type: String,
//     required: true,
//     trim: true
//   },
//   user: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   leader: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "User",
//     required: true
//   },

//   members: [
//     {
//       type: mongoose.Schema.Types.ObjectId,
//       ref: "User",
//       required: true
//     }
//   ],

//   contest: {
//     type: mongoose.Schema.Types.ObjectId,
//     ref: "Contest",
//     required: true
//   },

//   status: {
//     type: String,
//     enum: ["pending", "approved", "rejected"],
//     default: "pending"
//   }

// }, { timestamps: true });

// teamSchema.pre("validate", function () {
//   const uniqueMembers = [];
//   const seen = new Set();

//   for (const member of this.members || []) {
//     const memberId = member?.toString();

//     if (!memberId || seen.has(memberId)) {
//       continue;
//     }

//     seen.add(memberId);
//     uniqueMembers.push(member);
//   }

//   if (this.leader) {
//     const leaderId = this.leader.toString();
//     const hasLeader = uniqueMembers.some(
//       (member) => member.toString() === leaderId
//     );

//     if (!hasLeader) {
//       uniqueMembers.push(this.leader);
//     }
//   }

//   this.members = uniqueMembers;
// });

// teamSchema.path("members").validate(
//   (members) => Array.isArray(members) && members.length > 0,
//   "At least one team member is required"
// );

// teamSchema.path("leader").validate(function (leader) {
//   return (this.members || []).some(
//     (member) => member.toString() === leader?.toString()
//   );
// }, "Team leader must also be present in members.");

// teamSchema.index({ contest: 1, teamName: 1 }, { unique: true });

// export const Team = mongoose.model("Team", teamSchema);


import mongoose from "mongoose"; 
// 👉 Import mongoose (MongoDB ORM)


// ==========================
// Create Team Schema
// ==========================
const teamSchema = new mongoose.Schema(
  {
    // 👉 Team name field (team er naam)
    teamName: {
      type: String,            // string type
      required: true,          // must be provided
      trim: true,              // remove extra spaces
    },

    // 👉 Team leader (team creator / main user)
    leader: {
      type: mongoose.Schema.Types.ObjectId, // MongoDB ObjectId
      ref: "User",                          // reference to User model
      required: true,                       // required field
    },

    // 👉 Team members list (team er sob member)
    members: [
      {
        type: mongoose.Schema.Types.ObjectId, // user id
        ref: "User",                          // reference User collection
        required: true,
      },
    ],

    // 👉 Contest reference (kon contest er jonno team)
    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",        // reference Contest model
      required: true,
    },

    // 👉 Team type (solo or team)
    teamType: {
      type: String,
      enum: ["solo", "team"], // only these values allowed
      required: true,
    },
  },
  { timestamps: true } 
  // 👉 automatically adds createdAt & updatedAt
);


// ==========================
// PRE VALIDATION HOOK
// ==========================
// 👉 Run before validation
// 👉 Remove duplicate members + ensure leader is inside members
teamSchema.pre("validate", function () {
  const uniqueMembers = [];   // store unique members
  const seen = new Set();     // track duplicates

  // 👉 Loop through members
  for (const member of this.members || []) {
    const memberId = member?.toString();

    // 👉 Skip if invalid or duplicate
    if (!memberId || seen.has(memberId)) {
      continue;
    }

    seen.add(memberId);
    uniqueMembers.push(member);
  }

  // 👉 Ensure leader exists inside members
  if (this.leader) {
    const leaderId = this.leader.toString();

    const hasLeader = uniqueMembers.some(
      (member) => member.toString() === leaderId
    );

    // 👉 If leader not in members → add
    if (!hasLeader) {
      uniqueMembers.push(this.leader);
    }
  }

  // 👉 Update members with cleaned list
  this.members = uniqueMembers;
});


// ==========================
// MEMBERS VALIDATION
// ==========================
// 👉 Check members array rules
teamSchema.path("members").validate(
  function (members) {
    // 👉 must be array and not empty
    if (!Array.isArray(members) || members.length === 0) {
      return false;
    }

    // 👉 If solo team → exactly 1 member required
    if (this.teamType === "solo") {
      return members.length === 1;
    }

    // 👉 For normal team → 1 or more allowed
    return true;
  },
  "Solo team must have exactly 1 member, and team must have at least 1 member."
);


// ==========================
// LEADER VALIDATION
// ==========================
// 👉 Ensure leader is part of members
teamSchema.path("leader").validate(
  function (leader) {
    return (this.members || []).some(
      (member) => member.toString() === leader?.toString()
    );
  },
  "Team leader must also be present in members."
);



//  check Same contest e same teamName duplicate hobe na
teamSchema.index({ contest: 1, teamName: 1 }, { unique: true });


export const Team = mongoose.model("Team", teamSchema);



console.log("Team model is working");

