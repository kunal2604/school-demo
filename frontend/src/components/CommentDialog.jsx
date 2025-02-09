import  { useEffect, useState } from 'react'
import { Dialog, DialogContent, DialogTrigger } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Link } from 'react-router-dom'
import { MoreHorizontal } from 'lucide-react'
import { Button } from './ui/button'
import { useDispatch, useSelector } from 'react-redux'
import Comment from './Comment'
import axios from 'axios'
import { toast } from 'sonner'
import { setPosts } from '@/redux/postSlice'
import { getInitialsFromUserName } from '@/lib/utils'
import constants from '../constants'

const CommentDialog = ({ open, setOpen }) => {
    const [commentText, setCommentText] = useState("");
    const { selectedPost, posts } = useSelector(store => store.post);
    const [comments, setComments] = useState([]);
    const dispatch = useDispatch();

    useEffect(() => {
        if (selectedPost) {
            setComments(selectedPost.comments);
        }
    }, [selectedPost]);

    const changeEventHandler = (e) => {
        const inputText = e.target.value;
        if (inputText.trim()) {
            setCommentText(inputText);
        } else {
            setCommentText("");
        }
    }

    const addCommentHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const addCommentUrl = `api/v1/post/${selectedPost?._id}/addComment`;
            const addCommentResponse = await axios.post(baseUrl + addCommentUrl, { text: commentText }, {
                headers: {
                    'Content-Type': 'application/json'
                },
                withCredentials: true
            });

            if (addCommentResponse.data.success) {
                const updatedCommentData = [...comments, addCommentResponse.data.newComment];
                setComments(updatedCommentData);

                const updatedPostData = posts.map(p =>
                    p._id === selectedPost?._id ? { ...p, comments: updatedCommentData } : p
                );
                dispatch(setPosts(updatedPostData));
                toast.success(addCommentResponse.data.message);
                setCommentText('');
            }
        } catch (error) {
            console.log(error);
        }
    }

    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)} className="max-w-5xl p-0 flex flex-col">
                <div className='flex flex-1'>
                    <div className='w-1/2'>
                        <img
                            src={selectedPost?.image}
                            alt="post_img"
                            className='w-full h-full object-cover rounded-l-lg'
                        />
                    </div>
                    <div className='w-1/2 flex flex-col justify-between'>
                        <div className='flex items-center justify-between p-4'>
                            <div className='flex gap-3 items-center'>
                                <Link>
                                    <Avatar>
                                        <AvatarImage src={selectedPost?.author?.profilePicture} />
                                        <AvatarFallback>{getInitialsFromUserName(selectedPost?.author)}</AvatarFallback>
                                    </Avatar>
                                </Link>
                                <div>
                                    <Link className='font-semibold text-xs'>{selectedPost?.author?.username}</Link>
                                    {/* <span className='text-gray-600 text-sm'>Bio here...</span> */}
                                </div>
                            </div>

                            <Dialog>
                                <DialogTrigger asChild>
                                    <MoreHorizontal className='cursor-pointer' />
                                </DialogTrigger>
                                <DialogContent className="flex flex-col items-center text-sm text-center">
                                    <div className='cursor-pointer w-full text-[#ED4956] font-bold'>
                                        Unfollow
                                    </div>
                                    <div className='cursor-pointer w-full'>
                                        Add to favorites
                                    </div>
                                </DialogContent>
                            </Dialog>
                        </div>
                        <hr />
                        <div className='flex-1 overflow-y-auto max-h-96 p-4'>
                            {
                                comments.map((comment) => <Comment key={comment?._id} comment={comment} />)
                            }
                        </div>
                        <div className='p-4'>
                            <div className='flex items-center gap-2'>
                                <input type="text" value={commentText} onChange={changeEventHandler} placeholder='Add a comment...' className='w-full outline-none border text-sm border-gray-300 p-2 rounded' />
                                <Button disabled={!commentText.trim()} onClick={addCommentHandler} variant="outline">Send</Button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}

export default CommentDialog