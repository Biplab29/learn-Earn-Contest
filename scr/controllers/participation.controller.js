import { Participation } from "../models/participation.model.js";

export const participate = async (req, res) => {
  const data = await Participation.create({
    user: req.user._id,
    contest: req.params.id
  });
  res.json(data);
};


