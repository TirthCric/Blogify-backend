
import Post from "../models/post.model.js";
import User from "../models/user.model.js";
import ImageKit from "imagekit";

export const getPosts = async (req, res) => {

    const page = parseInt(req.query.page) || 1
    const limit = parseInt(req.query.limit) || 5

    const query = {}

    const cat = req.query.cat;
    const author = req.query.author;
    const searchQuery = req.query.search;
    const sortQuery = req.query.sort;
    const featured = req.query.featured;

    if (cat) {
        query.category = cat
    }

    if (searchQuery) {
        query.title = { $regex: searchQuery, $options: "i" };
    }

    if (author) {
        const user = await User.findOne({ username: author }).select("_id");

        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }

        query.user = user._id;
    }

    let sortObj = { createdAt: -1 };

    if (sortQuery) {
        switch (sortQuery) {
            case "newest":
                sortObj = { createdAt: -1 }
                break;

            case "oldest":
                sortObj = { createdAt: 1 }
                break;

            case "popular":
                sortObj = { visit: -1 }
                break;

            case "trending":
                sortObj = { visit: -1 };
                query.createdAt = {
                    $gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
                }
                break;

            default:
                break;
        }
    }

    if(featured) {
        query.isFeatured = true; 
    }

    const posts = await Post.find()
        .populate("user", "username")
        .sort(sortObj)
        .limit(limit).
        skip((page - 1) * limit);

    const totalPosts = await Post.countDocuments();
    const hasMore = page * limit < totalPosts;


    res.status(200).json({ posts, hasMore });
}

export const getPost = async (req, res) => {

    const post = await Post.findOne({ slug: req.params.slug })
        .populate("user", "username img");

    if (!post) return res.status(404).json({ message: "Post not found" });
    res.status(200).json(post);
}

export const createPost = async (req, res) => {

    const clerkUserId = req.auth.userId;
    // console.log(req.auth)

    console.log("this is clerkId",clerkUserId)
    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const user = await User.findOne({ clerkUserId });

    if (!user) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    let slug = req.body.title.toLowerCase().replace(/ /g, "-").toLowerCase();

    let existingPost = await Post.findOne({ slug });
    let count = 2;

    while (existingPost) {
        slug = `${slug}-${count}`;
        existingPost = await Post.findOne({ slug });
        count++;
    }

    const post = new Post({ user: user._id, slug, ...req.body });
    await post.save();
    res.status(201).json(post);
}

export const deletePost = async (req, res) => {

    const clerkUserId = req.auth.userId;
    // console.log(req.auth)
    // console.log(req.params.id)

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";

    if (role === "admin") {
        await Post.findByIdAndDelete(req.params.id);
        return res.status(200).json({ message: "Post deleted" });
    }

    const user = await User.findOne({ clerkUserId });

    const deletedPost = await Post.findByIdAndDelete({
        _id: req.params.id,
        user: user._id
    });

    if (!deletedPost) return res.status(403).json({ message: "You can deleted only your post" });

    res.status(200).json({ message: "Post deleted" });
}

const imagekit = new ImageKit({
    urlEndpoint: process.env.IK_URL_ENDPOINT,
    publicKey: process.env.IK_PUBLIC_KEY,
    privateKey: process.env.IK_PRIVATE_KEY,
});

export const uploadAuth = async (req, res) => {
    let result = imagekit.getAuthenticationParameters();
    res.send(result);
}


export const featurePost = async (req, res) => {
    const clerkUserId = req.auth.userId;
    const postId = req.body.postId;

    if (!clerkUserId) {
        return res.status(401).json({ message: "Unauthorized" });
    }

    const role = req.auth.sessionClaims?.metadata?.role || "user";

    if (role !== "admin") {
        return res.status(403).json({ message: "You can't feature this post" });
    }

    const post = await Post.findById(postId);

    if (!post) {
        return res.status(404).json({ message: "Post not found" });
    }

    const isFeatured = post.isFeatured;
    const updatedPost = await Post.findByIdAndUpdate(postId, {
        isFeatured: !isFeatured,
    },
        { new: true }
    );

    res.status(200).json(updatedPost);
}

