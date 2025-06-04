import { Router } from "express";
import User from "../models/user.model.js";
import { getUserSavedPosts, savePost } from "../controllers/user.controller.js";

const router = Router();

router.get("/saved", getUserSavedPosts);
router.patch("/save", savePost);
router.get("/", async (req, res) => {
    try{
        // Fetch all users from the database
          const users = await User.find();
        res.status(200).json(users);
        console.log(users)

    }catch(err){
        console.log("This is error: ",err)
        res.status(500).json({message: "Internal server error"})
    }

}); 

export default router