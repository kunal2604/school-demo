import sharp from 'sharp'
import cloudinary from '../utils/cloudinary.js'
import { Post } from '../models/post.model.js'
import { User } from '../models/user.model.js'
import { Comment } from '../models/comment.model.js'
import { getReceiverSocketId, io} from '../socket/socket.js'

export const addNewPost = async (req, res) => {
    try {
        const { caption } = req.body;
        const image = req.file;
        const authorId = req.id;

        if (!image) return res.status(400).json({ message: 'Image is required', success: false });

        const author = await User.findById(authorId);
        if (!author) res.status(400).json({ message: 'User not found!', success: false });

        // Image upload
        const optimizedImageBuffer = await sharp(image.buffer)
            .resize({ width: 800, height: 800, fit: 'inside' })
            .toFormat('jpeg', { quality: 80 })
            .toBuffer();

        const fileUri = `data:image/jpeg;base64,${optimizedImageBuffer.toString('base64')}`;
        const cloudinaryResponse = await cloudinary.uploader.upload(fileUri);
        const post = await Post.create({
            caption,
            image: cloudinaryResponse.secure_url,
            author: authorId
        });

        author.posts.push(post._id);
        await author.save();

        await post.populate({ path: 'author', select: '-password' });

        return res.status(201).json({
            message: 'New post added successfully!',
            post,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getAllPosts = async (req, res) => {
    try {
        const posts = await Post.find().sort({ createdAt: -1 })
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            posts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getPostById = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId)
            .populate({ path: 'author', select: 'username profilePicture' })
            .populate({
                path: 'comments',
                sort: { createdAt: -1 },
                populate: {
                    path: 'author',
                    select: 'username profilePicture'
                }
            });
        return res.status(200).json({
            post,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCurrentUserPosts = async (req, res) => {
    try {
        const authorId = req.id;
        const userPosts = await Post.find({ author: authorId }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });
        return res.status(200).json({
            userPosts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getOtherUserPosts = async (req, res) => {
    try {
        const currentUserId = req.id;
        const otherUserPosts = await Post.find({ author: { $ne: currentUserId } }).sort({ createdAt: -1 }).populate({
            path: 'author',
            select: 'username profilePicture'
        }).populate({
            path: 'comments',
            sort: { createdAt: -1 },
            populate: {
                path: 'author',
                select: 'username profilePicture'
            }
        });

        return res.status(200).json({
            otherUserPosts,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const likePost = async (req, res) => {

    try {
        const currentUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found!!', success: false });

        // like logic
        const isLikedAlready = post.likes.includes(currentUserId);
        if (!isLikedAlready) {
            await post.updateOne({ $addToSet: { likes: currentUserId } });
            await post.save();
        } else {
            await post.updateOne({ $pull: { likes: currentUserId } });
            await post.save();
        }
        // implement socket io for real time notification
        const currentUser = await User.findById(currentUserId).select('username profilePicture');
        if (post.author.toString() != currentUserId) {
            // emit notification event to post author
            const notification = {
                type: !isLikedAlready ? 'like' : 'dislike',
                userId: currentUserId,
                userDetails: currentUser,
                postId,
                message: !isLikedAlready ? 'Your post was liked' : 'Your post was disliked'
            }
            const postAuthorSocketId = getReceiverSocketId(post.author.toString());
            io.to(postAuthorSocketId).emit('getNotification', notification);
        }
        return res.status(200).json({ message: !isLikedAlready ? 'Post liked successfully!' : 'Post disliked successfully!', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const addComment = async (req, res) => {
    try {
        const currentUserId = req.id;
        const postId = req.params.id;
        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found!', success: false });

        const { text } = req.body;

        if (!text) return res.status(400).json({ message: 'Comment text is required', success: false, tt: req.body });

        const newComment = await Comment.create({
            text,
            author: currentUserId,
            post: postId
        });
        await newComment.populate({
            path: 'author',
            select: 'username profilePicture'
        });

        post.comments.push(newComment._id);
        await post.save();

        return res.status(201).json({
            message: 'Comment added successfully!',
            newComment,
            success: true
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const deleteComment = async (req, res) => {
    try {
        const currentUserId = req.id;
        const commentId = req.params.id;
        const comment = await Comment.findById(commentId);
        if (!comment) return res.status(404).json({ message: 'Comment not found!', success: false });

        if (comment.author.toString() === currentUserId) {
            let post = await Post.findById(comment.post.toString());
            post.comments.pull(commentId);
            await post.save();
            await Comment.deleteMany({ _id: commentId });
            return res.status(200).json({ message: 'Comment deleted successfully!', success: true });
        } else {
            return res.status(404).json({ message: 'Only author can delete comment!', success: false });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
};

export const getCommentsOfPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ message: 'Post not found!', success: false });

        const comments = await Comment.find({ post: postId }).sort({ createdAt: -1 })
            .populate('author', 'username profilePicture');

        if (!comments) return res.status(404).json({ message: 'No comments found!', success: false });

        return res.status(200).json({ comments, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deletePost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;

        const post = await Post.findById(postId);
        if (!post) return res.status(404).json({ message: 'Post not found!', success: false });

        // check if logged user is the author of the post.
        if (post.author.toString() !== authorId) {
            return res.status(401).json({ message: 'You are not authorized to delete this post!', success: false });
        }

        // remove the post from the author's posts array.
        const author = await User.findById(authorId);
        author.posts.pull(postId);
        author.bookmarks.pull(postId);
        await author.save();

        // delete comments of that post.
        await Comment.deleteMany({ post: postId });

        // delete post
        await Post.findByIdAndDelete(postId);

        return res.status(200).json({ message: 'Post deleted', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deleteAllPosts = async (req, res) => {
    try {
        const posts = await Post.find();
        if (!posts) return res.status(404).json({ message: 'No posts found!', success: false });

        posts.forEach(async post => {
            await Comment.deleteMany({ post: post._id });
        });
        await Post.deleteMany();
        await User.updateMany({}, { posts: [], bookmarks: [] });
        return res.status(200).json({ message: 'All posts are now deleted', success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const deleteAllPostsOfCurrentUser = async (req, res) => {
    try {
        const authorId = req.id;
        const author = await User.findById(authorId);
        const posts = await Post.find({ author: authorId });
        console.log(posts);
        if (!posts || posts.length === 0) return res.status(404).json({ message: `No post by ${author.username} was found!`, success: false });

        // delete all comments of post and then delete the post.
        posts.forEach(async post => {
            await Comment.deleteMany({ post: post._id });
            await Post.deleteOne({ _id: post._id });
        });

        // remove all posts and bookmarks from the author's data.
        author.posts = [];
        author.bookmarks = [];
        await author.save();
        return res.status(200).json({ message: `All the posts by ${author.username} are now deleted`, success: true });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}

export const bookmarkPost = async (req, res) => {
    try {
        const postId = req.params.id;
        const authorId = req.id;
        const post = await Post.findById(postId);

        if (!post) return res.status(404).json({ message: 'Post not found!', success: false });

        const user = await User.findById(authorId);

        if (user.bookmarks.includes(post._id)) {
            await user.updateOne({ $pull: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ message: `Post ${post.caption} removed from bookmarks!`, success: true });
        } else {
            await user.updateOne({ $addToSet: { bookmarks: post._id } });
            await user.save();
            return res.status(200).json({ message: `Post ${post.caption} added to bookmarks!`, success: true });
        }

    } catch (error) {
        console.log(error);
        return res.status(500).json({
            success: false,
            message: error.message
        });
    }
}