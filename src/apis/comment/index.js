import express from "express";
import createError from "http-errors";
import CommentModel from "./model.js";

const commentRouter = express.Router();

//GET /api/posts/{id}/comment
commentRouter.get("/:commentId", async (req, res, next) => {
  try {
    const comment = await CommentModel.find({ post: req.params.commentId });
    if (!comment)
      return next(
        createError(404, `Comment with id ${req.params.commentId} not found!`)
      );
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

//POST /api/posts/{id}/comment
commentRouter.post("/:commentId", async (req, res, next) => {
  try {
    const comment = await CommentModel.create(req.body);
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

export default commentRouter;
