import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Bookmark, MessageCircle, MoreHorizontal, Send } from 'lucide-react'
import { useState } from 'react'
import { Button } from './ui/button'
import { FaHeart, FaRegHeart } from 'react-icons/fa'
import CommentDialog from './CommentDialog'
import { Dialog, DialogTrigger, DialogContent } from './ui/dialog'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { toast } from 'sonner'
import axios from 'axios'
import { Badge } from './ui/badge'
import { getInitialsFromUserName } from '@/lib/utils'
import { Link } from 'react-router-dom'
import { setAuthUser, setUserProfile } from '@/redux/authSlice'
import constants from '../constants'

const Post = ({ post }) => {
    const [commentText, setCommentText] = useState('');
    const [open, setOpen] = useState(false);
    const { user, userProfile } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const [isLikedPost, setIsLikedPost] = useState(post.likes.includes(user?._id) || false);
    const [isBookmarkedPost, setIsBookmarkedPost] = useState(user?.bookmarks.includes(post._id) || false);
    const [postTotalLikes, setPostTotalLikes] = useState(post.likes.length);
    const [comments, setComments] = useState(post.comments);
    const dispatch = useDispatch();

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setCommentText(inputText);
        } else {
            setCommentText('');
        }
    }

    const deletePostHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const deletePostUrl = `api/v1/post/deletePost/${post?._id}`;
            const deletePostResponse = await axios.get(baseUrl + deletePostUrl, { withCredentials: true });
            if (deletePostResponse.data.success) {
                const filteredPosts = posts.filter(p => p?._id != post?._id);
                dispatch(setPosts(filteredPosts));
                const userPostsAfterDelete = user.posts.filter(p => p?._id != post?._id);
                dispatch(setAuthUser({ ...user, posts: userPostsAfterDelete }));
                if (userProfile._id == user._id) {
                    dispatch(setUserProfile({ ...user, posts: userPostsAfterDelete }));
                }
                // dispatch(set)
                toast.success(deletePostResponse.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error);
        }
    }

    const likePostHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const likePostUrl = `api/v1/post/likePost/${post?._id}`;
            const likePostResponse = await axios.get(baseUrl + likePostUrl, { withCredentials: true });
            if (likePostResponse) {
                const updatedLikes = isLikedPost ? postTotalLikes - 1 : postTotalLikes + 1;
                setPostTotalLikes(updatedLikes);

                // update current post
                const updatedPosts = posts.map(p =>
                    p._id == post._id ? {
                        ...p,
                        likes: isLikedPost ? p.likes.filter(id => id != user._id) : [...p.likes, user._id]
                    } : p
                );
                dispatch(setPosts(updatedPosts));
                setIsLikedPost(!isLikedPost);
                toast.success(likePostResponse.data.message);
            }
        } catch (error) {
            console.log(error);
            toast.error(error);
        }
    }

    const bookmarkPostHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const bookmarkPostUrl = `api/v1/post/${post?._id}/bookmarkPost`;
            const bookmarkPostResponse = await axios.get(baseUrl + bookmarkPostUrl, { withCredentials: true });
            if (bookmarkPostResponse.data.success) {
                toast.success(bookmarkPostResponse.data.message);
                if (!isBookmarkedPost) {
                    const updatedUser = { ...user, bookmarks: [...user?.bookmarks, post?._id] }
                    dispatch(setAuthUser(updatedUser));
                }
                else {
                    const updatedBookmarks = user?.bookmarks.filter((b) => b != post?._id);
                    const updatedUser = { ...user, bookmarks: updatedBookmarks };
                    dispatch(setAuthUser(updatedUser));
                }
                setIsBookmarkedPost(!isBookmarkedPost);
            }
        } catch (error) {
            console.log(error);
            toast.error(error);
        }
    }

    const addCommentHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const addCommentUrl = `api/v1/post/${post?._id}/addComment`;
            const addCommentResponse = await axios.post(baseUrl + addCommentUrl, { text: commentText }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (addCommentResponse.data.success) {
                const updatedCommentsData = [...comments, addCommentResponse.data.newComment];
                setComments(updatedCommentsData);

                const updatedPostData = posts.map(p =>
                    p._id === post._id ? { ...p, comments: updatedCommentsData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(addCommentResponse.data.message);
                setCommentText('');
            }

        } catch (error) {
            console.log(error);
            toast.error(error);
        }
    }

    return (
        <div className='my-8 w-full max-w-sm mx-auto'>
            <div className='flex items-center justify-between'>
                <div className='flex items-center gap-2'>

                    <Link to={`/profile/${post?.author._id}`}>
                        <Avatar >
                            <AvatarImage src={post?.author?.profilePicture} alt='avatar_image' />
                            <AvatarFallback>{getInitialsFromUserName(post?.author)} </AvatarFallback>
                        </Avatar>
                    </Link>

                    <div className='flex items-center gap-3'>
                        <h1 className='font-semibold'>{post?.author?.username}</h1>
                        {user?._id === post?.author?._id && <Badge variant='secondary'>Author</Badge>}
                    </div>
                </div>
                <Dialog>
                    <DialogTrigger asChild>
                        <MoreHorizontal className='cursor-pointer' />
                    </DialogTrigger>
                    <DialogContent className='flex flex-col items-center text-sm text-center'>
                        {
                            post?.author?._id != user?._id && <Button variant='ghost' className='cursor-pointer w-fit text-[#ED4956] font-bold'>Unfollow</Button>
                        }
                        <Button variant='ghost' className='cursor-pointer w-fit'>Add to favourites</Button>
                        {
                            user && user?.username == post?.author?.username &&
                            <Button onClick={deletePostHandler} variant='ghost' className='cursor-pointer w-fit text-[#ED4956]'>Delete</Button>
                        }
                    </DialogContent>
                </Dialog>
            </div>
            <img className='rounded-sm my-2 w-full aspect-square object-cover'
                src={post?.image}
                alt='post_image'
            />
            <div className=''>
                <div className='flex items-center justify-between my-2'>
                    <div className='flex items-center gap-3'>
                        {
                            isLikedPost ? <FaHeart size={'24'} onClick={likePostHandler} className='cursor-pointer text-red-600' /> : <FaRegHeart onClick={likePostHandler} className='cursor-pointer hover:text-gray-600' size={'22px'} />
                        }
                        <MessageCircle onClick={() => {
                            dispatch(setSelectedPost(post));
                            setOpen(true);
                        }} className='cursor-pointer hover:text-gray-600' />
                        <Send className='cursor-pointer hover:text-gray-600' />
                    </div>
                    {
                        isBookmarkedPost ?
                            <Bookmark color="#2fd80e" strokeWidth={3} onClick={bookmarkPostHandler} className='cursor-pointer hover:text-gray-600' />
                            : <Bookmark onClick={bookmarkPostHandler} className='cursor-pointer hover:text-gray-600' />
                    }
                </div>
                <span className='font-medium block mb-2'>{postTotalLikes} {postTotalLikes != 1 ? 'likes' : 'like'}</span>
                <p>
                    <span className='font-medium mr-2'>{post?.author?.username}</span>
                    {post?.caption}
                </p>
                {
                    comments.length > 0 && <span onClick={() => {
                        dispatch(setSelectedPost(post));
                        setOpen(true);
                    }} className='cursor-pointer text-sm text-gray-400'>View all {comments.length} comments</span>
                }
                <CommentDialog open={open} setOpen={setOpen} />
                <div className='flex items-center justify-between'>
                    <input
                        type='text'
                        placeholder='Add a comment...'
                        value={commentText}
                        onChange={changeEventHandler}
                        className='outline-none text-sm w-full'
                    />
                    {
                        commentText && <span onClick={addCommentHandler} className='text-[#3BADF8] cursor-pointer'>Post</span>
                    }
                </div>
            </div>
        </div>
    )
}

export default Post