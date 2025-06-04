import { Router } from "express";
import {
  addComment,
  getPostComments,
  deleteComment,
} from "../controllers/comment.controller.js";
import Comment from "../models/comment.model.js";

const router = Router();
router.get("/", async (req, res) => {
  const comments = await Comment.find({});
  res.status(200).json(comments);
});
router.get("/:postId", getPostComments);
router.post("/:postId", addComment);
router.delete("/:id", deleteComment);

export default router;