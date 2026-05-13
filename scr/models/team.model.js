


import mongoose from "mongoose"; 


// ==========================
// Create Team Schema
// ==========================
const teamSchema = new mongoose.Schema(
  {
  
    teamName: {
      type: String,        
      required: true,          
      trim: true,             
    },

    // Team leader (team creator / main user)
    leader: {
      type: mongoose.Schema.Types.ObjectId, 
      ref: "User",                          
      required: true,                       
    },

  
    members: [
      {
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User",                          
        required: true,
      },
    ],

    contest: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Contest",        // reference Contest model
      required: true,
    },

    teamType: {
      type: String,
      enum: ["solo", "team"], 
      required: true,
    },
  },
  { timestamps: true } 
);



// Run hobe before validation
// Remove duplicate members + ensure leader is inside members
teamSchema.pre("validate", function () {
  const uniqueMembers = [];   
  const seen = new Set();    


  for (const member of this.members || []) {
    const memberId = member?.toString();

  
    if (!memberId || seen.has(memberId)) {
      continue;
    }

    seen.add(memberId);
    uniqueMembers.push(member);
  }

  if (this.leader) {
    const leaderId = this.leader.toString();

    const hasLeader = uniqueMembers.some(
      (member) => member.toString() === leaderId
    );

    if (!hasLeader) {
      uniqueMembers.push(this.leader);
    }
  }

  
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

