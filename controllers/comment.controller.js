
import User from "../models/user.model.js";
import Comment from "../models/comment.model.js";

export const getPostComments = async (req, res) => {
    const postId = req.params.postId;
    const comments = await Comment.find({ post: postId })
        .populate("user", "username img")
        .sort({ createdAt: -1 });

    console.log("comments", comments);
    res.status(200).json(comments);
}


export const addComment = async (req, res) => {
    const postId = req.params.postId;
    const { desc } = req.body;
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const newComment = new Comment({ user: user._id, post: postId, desc });
    const savedComment = await newComment.save();

    // console.log("Saved comment", savedComment);
    res.status(201).json({ message: "Comment added successfully" });
}

export const deleteComment = async (req, res) => {
    const commentId = req.params.id;
    const clerkUserId = req.auth.userId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
        await Comment.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Comment deleted" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const deletedComment = await Comment.findOneAndDelete({ _id: commentId, user: user._id });

    if (!deletedComment) {
        return res.status(403).json('You can delete only your comment');
    }

    res.status(200).json('Comment deleted successfully');

}