import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({

  teamName: {
    type: String,
    required: true,
    trim: true
  },

  leader: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true
  },
  
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    }
  ],

  contest: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Contest",
    required: true
  },

  status: {
    type: String,
    enum: ["pending", "approved", "rejected"],
    default: "pending"
  }

}, { timestamps: true });

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

teamSchema.path("members").validate(
  (members) => Array.isArray(members) && members.length > 0,
  "At least one team member is required"
);

teamSchema.path("leader").validate(function (leader) {
  return (this.members || []).some(
    (member) => member.toString() === leader?.toString()
  );
}, "Team leader must also be present in members.");

teamSchema.index({ contest: 1, teamName: 1 }, { unique: true });

export const Team = mongoose.model("Team", teamSchema);
