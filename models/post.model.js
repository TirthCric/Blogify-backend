
import { Schema, model } from 'mongoose';

const postSchema = new Schema({
    img: {
        type: String,
    },
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true, 
        unique: true,
    },
    desc: {
        type: String,
    },
    category: {
        type: String,
        default:"general",
    },
    content: {
        type: String,
        required: true,
    },
    isFeatured: {
        type: Boolean,
        default: false,
    },
    visit: {
        type: Number,
        default: 0,
    },
    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
}, { timestamps: true });  

const Post = model('Post', postSchema);
export default Post;
