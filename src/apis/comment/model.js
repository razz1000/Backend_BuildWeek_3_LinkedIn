import mongoose from "mongoose";

const { Schema, model } = mongoose;

const commentSchema = new Schema(
  {
    text: { type: String, minlength: 1, maxlength: 1000, required: true },
    post: { type: Schema.Types.ObjectId, ref: "Post" },
    user: { type: Schema.Types.ObjectId, ref: "Profile" },
  },
  { timestamps: true }
);

export default model("Comment", commentSchema);
