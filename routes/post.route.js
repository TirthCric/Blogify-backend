
import { Router } from "express";
import { createPost, deletePost, getPost, getPosts, uploadAuth, featurePost } from "../controllers/post.controller.js";
import { increaseVisits } from "../middlewares/increaseVisits.js";

const router = Router();

router.get("/", getPosts);
router.get('/upload-auth', uploadAuth);
router.get("/:slug", increaseVisits, getPost);
router.post("/", createPost);
router.delete("/:id", deletePost);
router.patch("/feature", featurePost);


export default router;

