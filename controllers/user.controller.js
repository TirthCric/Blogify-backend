
import User from "../models/user.model.js";

export const getUserSavedPosts = async (req, res) => {
    
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({clerkUserId});


    res.status(200).json(user.savedPosts);
}

export const savePost = async (req, res) => {

    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({clerkUserId});

    const isSaved = user.savedPosts.some((postId) => postId === postId);

    if(!isSaved) {
        await User.findOneAndUpdate(
            { clerkUserId },
            { $push: { savedPosts: postId } },
        );
    } else {
        await User.findOneAndUpdate(
            { clerkUserId },
            { $pull: { savedPosts: postId } },
        );
    }

    res.status(200).json(isSaved ? "Post unsaved" : "Post saved");
}
