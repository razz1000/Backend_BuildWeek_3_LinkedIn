import express from "express";
import createError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ProfileModel from "./model.js";

const profileRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "buildweek/linkdln/profile",
    },
  }),
  fileFilter: (req, file, multerNext) => {
    if (file.mimetype !== "image/jpeg") {
      multerNext(createError(400, "Only jpeg allowed!"));
    } else {
      multerNext(null, true);
    }
  },
  limits: { fileSize: 1 * 1024 * 1024 }, // file size
}).single("image");

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

profileRouter.post("/:id/image", cloudinaryUploader, async (req, res, next) => {
  try {
    const postPicture = await ProfileModel.findByIdAndUpdate(
      req.params.id,
      { image: req.file.path },
      { new: true, runValidators: true }
    );
    res.send(postPicture);
  } catch (error) {
    next(error);
  }
});

export default profileRouter;
