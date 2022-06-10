import express from "express";
import createError from "http-errors";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import PostModel from "./model.js";

const postRouter = express.Router();

const cloudinaryUploader = multer({
  storage: new CloudinaryStorage({
    cloudinary,
    params: {
      folder: "buildweek/linkdln",
    },
  }),
  fileFilter: (req, file, multerNext) => {
    if (file.mimetype !== "image/jpeg" && file.mimetype !== "image/png") {
      multerNext(createError(400, "Only jpeg and png are allowed!"));
    } else {
      multerNext(null, true);
    }
  },
  limits: { fileSize: 1 * 1024 * 1024 }, // file size
}).single("image");

postRouter.post("/", async (req, res, next) => {
  try {
    const post = await PostModel.create(req.body);
    res.send(post);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/", async (req, res, next) => {
  try {
    const posts = await PostModel.find().populate({
      path: "user",
      select: "name surname email bio title area image username",
    });
    res.send(posts);
  } catch (error) {
    next(error);
  }
});
postRouter.get("/:postId", async (req, res, next) => {
  try {
    const post = await PostModel.findById(req.params.postId).populate({
      path: "user",
      select: "name surname email bio title area image username",
    });
    if (post) {
      res.send(post);
    } else {
      next(createError(404, `Post with the id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

postRouter.put("/:postId", async (req, res, next) => {
  try {
    const modifyPost = await PostModel.findByIdAndUpdate(
      req.params.postId,
      req.body,
      { new: true, runValidators: true }
    );
    if (modifyPost) {
      res.send(modifyPost);
    } else {
      next(createError(404, `Post with the Id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});
postRouter.delete("/:postId", async (req, res, next) => {
  try {
    const deletedPost = await PostModel.findByIdAndDelete(req.params.postId);
    if (deletedPost) {
      res.status(204).send();
    } else {
      next(createError(404, `Post with the id ${req.params.postId} not found`));
    }
  } catch (error) {
    next(error);
  }
});

postRouter.post(
  "/:postId/image",
  cloudinaryUploader,
  async (req, res, next) => {
    try {
      const postImage = await PostModel.findByIdAndUpdate(
        req.params.postId,
        {
          image: req.file.path,
        },
        { new: true, runValidators: true }
      );
      res.send(postImage);
    } catch (error) {
      next(error);
    }
  }
);

export default postRouter;
