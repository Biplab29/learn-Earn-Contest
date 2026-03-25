import { Team } from "../models/team.model.js";

export const createTeam = async (req, res) => {
  const team = await Team.create({
    ...req.body,
    leader: req.user._id
  });
  res.json(team);
};

export const countTeams = async (req, res) => {
  const count = await Team.countDocuments({ contest: req.params.id });
  res.json({ totalTeams: count });
};