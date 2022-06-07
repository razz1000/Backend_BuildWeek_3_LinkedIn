import express from "express";
import createError from "http-errors";
import ExperiencesModel from "./model.js";
import ProfileModel from "../profile/model.js";

const experiencesRouter = express.Router();

experiencesRouter.get("/", async (req, res, next) => {
  try {
    const experiences = await ExperiencesModel.find(); /* .populate({
      path: "user",
      select:
        "name surname email bio title area image username createdAt updatedAt",
    }); */
    res.send(experiences);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.get("/:id", async (req, res, next) => {
  try {
    const experience = await ExperiencesModel.findById(
      req.params.id
    ); /* .populate({
      path: "user",
      select:
        "name surname email bio title area image username createdAt updatedAt",
    }); */
    if (!experience)
      return next(
        createError(404, `Experience with id ${req.params.id} not found!`)
      );
    res.send(experience);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

// PROB NOT WORKING
experiencesRouter.post("/", async (req, res, next) => {
  try {
    const newExperience = await new ExperiencesModel(req.body);
    const { _id } = await newExperience.save();
    const profile = await ProfileModel.findByIdAndUpdate(
      req.body.profileId,
      { $push: { experience: _id } },
      { new: true, runValidators: true }
    );
    res.status(201).send({ _id });
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.put("/:id", async (req, res, next) => {
  try {
    const updatedExperience = await ExperiencesModel.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!updatedExperience)
      return next(
        createError(404, `Experience with ID ${req.params.id} not found!`)
      );
    res.send(updatedExperience);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

experiencesRouter.delete("/:id", async (req, res, next) => {
  try {
    const deletedExperience = await ExperiencesModel.findByIdAndDelete(
      req.params.id
    );
    if (!deletedExperience)
      return next(
        createError(404, `Review with id ${req.params.id} not found!`)
      );
    res.status(204).send();
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default experiencesRouter;
