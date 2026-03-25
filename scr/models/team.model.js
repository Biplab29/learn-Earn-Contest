import mongoose from "mongoose";

const teamSchema = new mongoose.Schema({
  teamName: String,
  members: [
    { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "User" 
    
    }
],
  leader: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: "User" 
},
  contest: {  
    type: mongoose.Schema.Types.ObjectId, 
    ref: "Contest" 
}
});

export const Team = mongoose.model("Team", teamSchema);