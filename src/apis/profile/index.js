import express from "express";
import createError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { pipeline } from "stream";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import ProfileModel from "./model.js";
import ExperienceModel from "../experiences/model.js";
import { getPdfReadableStream } from "../../lib/pdf-tools.js";
import { generateFromEmail, generateUsername } from "unique-username-generator";
import JSON2CSVParser from "json2csv/lib/JSON2CSVParser.js";
import { profile } from "console";

const profileRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "buildweek/linkdln/profile",
    },
  }),
  fileFilter: (req, file, multerNext) => {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      multerNext(createError(400, "Only jpeg and png are allowed!"));
    } else {
      multerNext(null, true);
    }
  },
  /*   limits: { fileSize: 1 * 1024 * 1024 },  */ // file size
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

profileRouter.get("/:username", async (req, res, next) => {
  try {
    const userName = req.params.username;
    console.log("USERNAME:", userName);

    const profile = await ProfileModel.findOne({ username: userName });
    if (!profile)
      return next(
        createError(404, `Profile with id ${req.params.username} not found!`)
      );
    res.send(profile);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.post("/", async (req, res, next) => {
  try {
    const newProfile = await new ProfileModel({
      ...req.body,
      username: generateFromEmail(req.body.email, 3),
    });
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
    console.log(req.file.path);
    const postPicture = await ExperienceModel.findByIdAndUpdate(
      req.params.id,
      { image: req.file.path },
      { new: true, runValidators: true }
    );
    console.log(postPicture);
    res.send(postPicture);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.post(
  "/:id/profileImage",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      console.log(req.file.path);
      const postPicture = await ProfileModel.findByIdAndUpdate(
        req.params.id,
        { image: req.file.path },
        { new: true, runValidators: true }
      );
      console.log(postPicture);
      res.send(postPicture);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

profileRouter.get("/:id/cv", async (req, res, next) => {
  try {
    const profile = await ProfileModel.findById(req.params.id);
    if (profile) {
      res.setHeader("Content-Type", "application/pdf");
      const source = await getPdfReadableStream(profile);
      const destination = res;

      pipeline(source, destination, (err) => {
        if (err) console.log(err);
      });
    } else {
      console.log("this profile does not exist");
    }
  } catch (error) {
    console.log(error);
    next(error);
  }
});

//--------------EXPERIENCES----------------------

//GET Experiences with User inside.
/* profileRouter.get("/:username/experiences", async (req, res, next) => {
  try {
    const userName = req.params.username;
    console.log("THIS IS THE USERNAME:", userName);

    const profile = await ProfileModel.find({ username: userName });

    console.log("THIS IS THE PROFIEL", profile);

    const userID = profile.ObjectId;

    console.log("USERID:", userID);

    if (profile) {
      const experiences = await ExperienceModel.find(
        profile._id === profile.user._id
      );

      console.log(profile);

      const userID = await ExperienceModel.find(userName._id);
      console.log("USERID", userID);
    }

const experience = await ExperienceModel.find({
      "user.username": userName,
    });

    console.log("Experience", experience);

    if (profile) {
      const experience = await ExperienceModel.find({
        username: userName,
      }).populate({
        path: "user",
        select:
          "name surname email bio title area image username createdAt updatedAt",
      });
      console.log("EXPERIENCE:", experience);
    }

    if (!experience)
      return next(
        createError(404, `experience with id ${req.params.userName} not found!`)
      );
    res.send(experience); 
  } catch (error) {
    console.log(error);
    next(error);
  }
}); */

// Not working 100%!!
profileRouter.get("/:username/experiences", async (req, res, next) => {
  try {
    const profile = await ProfileModel.findOne({
      username: req.params.username,
    });
    console.log("PROFILE:", profile);
    console.log("ProfileUID;", profile._id);

    if (!profile)
      return next(
        createError(
          404,
          `Profile with username ${req.params.username} not found!`
        )
      );
    // If user , then we want to find all experiences , for that particulat user.
    // HOW: In profile we have the UserID, which is also in the Experiences.
    // So, we have to first log the UserID from Profile.
    // Then make a find all Experiences that have that specific UserID in the body.

    const experiences = await ExperienceModel.find({
      profile: profile._id,
    }).populate({
      path: "user",
      select:
        "name surname email bio title area image username createdAt updatedAt",
    });
    res.send(experiences);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

profileRouter.post("/:username/experiences", async (req, res, next) => {
  try {
    const username = req.params.username;
    console.log("THIS IS THE USERNAME:", username);

    const newExperience = await new ExperienceModel(req.body);
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

//GET ONE SPECIFIC EXPERIENCE
profileRouter.get(
  "/:username/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const username = req.params.username;
      const experienceId = req.params.experienceId;
      console.log("THIS IS THE USERNAME:", username);

      const experience = await ExperienceModel.findById(
        req.params.experienceId
      );

      if (!experience)
        return next(
          createError(
            404,
            `experience with id ${req.params.experienceId} not found!`
          )
        );
      res.send(experience);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//PUT ONE SPECIFIC EXPERIENCE
profileRouter.put(
  "/:username/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const updatedExperience = await ExperienceModel.findByIdAndUpdate(
        req.params.experienceId,
        req.body,
        { new: true, runValidators: true }
      );

      if (!updatedExperience)
        return next(
          createError(
            404,
            `experience with id ${req.params.experienceId} not found!`
          )
        );
      res.send(updatedExperience);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//DELETE ONE SPECIFIC EXPERIENCE
profileRouter.delete(
  "/:username/experiences/:experienceId",
  async (req, res, next) => {
    try {
      const deletedExperience = await ExperienceModel.findByIdAndDelete(
        req.params.experienceId
      );

      if (!deletedExperience)
        return next(
          createError(
            404,
            `experience with id ${req.params.experienceId} not found!`
          )
        );
      res.send(deletedExperience);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);

//CHANGE THE EXPERIENCES PICTURE
profileRouter.post(
  "/:username/experiences/:experienceId/picture",
  async (req, res, next) => {
    try {
      const updatedExperiencesPicture = await ExperienceModel.findByIdAndUpdate(
        req.params.experienceId,
        req.body,
        { new: true, runValidators: true }
      );
      if (!updatedExperiencesPicture)
        return next(
          createError(
            404,
            `experience with id ${req.params.experienceId} not found!`
          )
        );
      res.send(updatedExperiencesPicture);
    } catch (error) {
      console.log(error);
      next(error);
    }
  }
);
//GET AS CSV
profileRouter.get("/:username/csv", async (req, res, next) => {
  try {
    const userName = req.params.username;
    console.log("username:", userName);

    const profile = await ProfileModel.find({
      username: userName,
    });
    console.log("profile Name :; ", profile[0].name);

    const profileID = profile[0]._id.toString();
    console.log("ProfileID", profileID);

    const experience = await ExperienceModel.find({
      user: profileID,
    });
    console.log("EXPERIECNCE", experience /* .user._id */);

    const jsonData = JSON.parse(JSON.stringify(experience));
    console.log("JSONDATA: ", jsonData);
    const csvFields = [
      "role",
      "company",
      "startDate",
      "endDate",
      "description",
      "area",
      "profile",
      "createdAt",
      "updatedAt",
    ];
    const json2csvParser = new JSON2CSVParser({ csvFields });
    const csvData = json2csvParser.parse(jsonData);
    res.setHeader(
      "Content-disposition",
      "attachment; filename=experiences.csv"
    );
    res.set("Content-Type", "text/csv");
    res.end(csvData);
  } catch (error) {
    console.log(error);
    next(error);
  }
});

export default profileRouter;
