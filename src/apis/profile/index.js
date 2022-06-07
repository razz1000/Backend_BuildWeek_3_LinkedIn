import express from "express";
import createError from "http-errors";
import ProfileModel from "./model.js";

const profileRouter = express.Router();

profileRouter.get("/", async (req, res, next) => {
  try {
    const profiles = await ProfileModel.find();
    res.send(profiles);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.get("/:id", async (req, res, next) => {
  try {
    const profile = await ProfileModel.findById(req.params.id);
    if (!profile)
      return next(
        createError(404, `Profile with id ${req.params.id} not found!`)
      );
    res.send(profile);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.post("/", async (req, res, next) => {
  try {
    const newProfile = await new ProfileModel(req.body);
    const { _id } = await newProfile.save();
    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedProfile = await ProfileModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedProfile)
      return next(
        createError(404, `Profile with id ${req.params.id} not found!`)
      );
    res.send(updatedProfile);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedProfile = await ProfileModel.findByIdAndDelete(req.params.id);
    if (!deletedProfile)
      return next(
        createError(404, `Profile with id ${req.params.id} not found!`)
      );
    res.send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default profileRouter;
