import { Submission } from "../models/submission.model.js";

export const submit = async (req, res) => {
  const data = await Submission.create(req.body);
  res.json(data);
};

export const leaderboard = async (req, res) => {
  const data = await Submission.find({ contest: req.params.id })
    .sort({ totalScore: -1 });
  res.json(data);
};

export const evaluate = async (req, res) => {
  const data = await Submission.findByIdAndUpdate(
    req.params.id,
    { totalScore: req.body.score },
    { new: true }
  );
  res.json(data);
};