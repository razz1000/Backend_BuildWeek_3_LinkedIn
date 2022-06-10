import express from "express";
import createError from "http-errors";
import CommentModel from "./model.js";

const commentRouter = express.Router();

//GET /api/posts/{id}/comment
commentRouter.get("/:id", async (req, res, next) => {
  try {
    const comment = await CommentModel.find({ post: req.params.id }).populate({
      path: "post", // populate the post field
      select: "text username image", // only select the title field
    });
    console.log("COMMENT", comment);
    res.send(comment);
  } catch (error) {
    next(error);
  }
});

//POST /api/posts/{id}/comment
commentRouter.post("/:id", async (req, res, next) => {
  try {
    const comment = await CommentModel.create(req.body);
    comment.post = req.params.id;
    const savedComment = await comment.save();
    res.send(savedComment);
  } catch (error) {
    next(error);
  }
});

//Modify posted comment
commentRouter.put("/:commentId", async (req, res, next) => {
  try {
    const comment = await CommentModel.findByIdAndUpdate(
      req.params.commentId,
      req.body,
      { new: true, runValidators: true }
    );
    if (comment) {
      res.send(comment);
    } else {
      next(
        createError(
          404,
          `Comment with the id ${req.params.commentId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

//Delete posted comment
commentRouter.delete("/:commentId", async (req, res, next) => {
  try {
    const comment = await CommentModel.findByIdAndDelete(req.params.commentId);
    if (comment) {
      res.status(204).send();
    } else {
      next(
        createError(
          404,
          `Comment with the id ${req.params.commentId} not found`
        )
      );
    }
  } catch (error) {
    next(error);
  }
});

export default commentRouter;
