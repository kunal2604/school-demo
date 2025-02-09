import { useRef, useState } from 'react'
import { Dialog, DialogContent, DialogHeader } from './ui/dialog'
import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { Textarea } from './ui/textarea'
import { Button } from './ui/button'
import { getInitialsFromUserName, readFileAsDataURL } from '@/lib/utils'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import axios from 'axios'
import { useDispatch, useSelector } from 'react-redux'
import { setPosts } from '@/redux/postSlice'
import { setAuthUser, setUserProfile } from '@/redux/authSlice'
import constants from '../constants'

const CreatePost = ({ open, setOpen }) => {
    const imageRef = useRef();
    const [file, setFile] = useState('');
    const [caption, setCaption] = useState('');
    const [imagePreview, setImagePreview] = useState('');
    const [loading, setLoading] = useState(false);
    const { user, userProfile } = useSelector(store => store.auth);
    const { posts } = useSelector(store => store.post);
    const dispatch = useDispatch();

    const fileChangeHandler = async (e) => {
        const file = e.target.files?.[0];
        if (file) {
            setFile(file);
            const dataUrl = await readFileAsDataURL(file);
            setImagePreview(dataUrl);
        }
    }
    const createPostHandler = async (e) => {
        setLoading(true);
        const formData = new FormData();
        formData.append('caption', caption);
        if (imagePreview)
            formData.append('image', file);
        try {
            const baseUrl = constants.baseUrl;
            const addNewPostUrl = 'api/v1/post/addNewPost';
            const addNewPostResponse = await axios.post(baseUrl + addNewPostUrl, formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                },
                withCredentials: true
            });
            if (addNewPostResponse.data.success) {
                dispatch(setPosts([addNewPostResponse.data.post, ...posts]));
                dispatch(setAuthUser({...user, posts: [ addNewPostResponse.data.post, ...user.posts]}));
                if (userProfile._id == user._id) {
                    dispatch(setUserProfile({ ...user, posts: [addNewPostResponse.data.post, ...user.posts] }));
                }

                toast.success(addNewPostResponse.data.message);
            }
        } catch (error) {
            console.log(error)
            toast.error(error.response.data.message);
        } finally {
            postAddedCompletion();
        }
    }

    const postAddedCompletion = () => {
        setLoading(false);
        setCaption('');
        setImagePreview('');
        setOpen(false);
    }
    return (
        <Dialog open={open}>
            <DialogContent onInteractOutside={() => setOpen(false)}>
                <DialogHeader className='font-semibold'>Create new post</DialogHeader>
                <div className='flex gap-3 items-center'>
                    <Avatar>
                        <AvatarImage src={user?.profilePicture} alt='img' />
                        <AvatarFallback>{getInitialsFromUserName(user)}</AvatarFallback>
                    </Avatar>
                    <div>
                        <h1 className='font-semibold text-xs'>{user?.username}</h1>
                        <span className='text-gray-600 text-xs'>{user?.bio}</span>
                    </div>
                </div>
                <Textarea value={caption} onChange={(e) => setCaption(e.target.value)} className='focus-visible:ring-transparent boreder-none' placeholder='Write a caption...' />
                {
                    imagePreview && (
                        <div className='w-full h-64 flex items-center justify-center'>
                            <img src={imagePreview} alt='preview_img' className='object-cover h-full w-full rounded-md' />
                        </div>
                    )
                }
                <input ref={imageRef} type='file' className='hidden' onChange={fileChangeHandler} />
                {
                    !imagePreview && <Button onClick={() => imageRef.current.click()} className='w-fit mx-auto bg-[#0095F6] hover:bg-[#258bcf] '>Select from computer</Button>
                }
                {
                    imagePreview && (
                        loading ? (
                            <Button>
                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                Please wait !!!
                            </Button>
                        ) : (
                            <Button onClick={createPostHandler} type='submit' className='w-full'>Post</Button>
                        )
                    )
                }

            </DialogContent>
        </Dialog>
    )
}

export default CreatePost