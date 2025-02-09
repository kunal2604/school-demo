import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import axios from 'axios'
import { Heart, Home, LogOut, MessageCircle, PlusSquare, Search, TrendingUp } from 'lucide-react'
import { useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useNavigate } from 'react-router-dom'
import { toast } from 'sonner'
import CreatePost from './CreatePost'
import { setAuthUser } from '@/redux/authSlice'
import { getInitialsFromUserName } from '@/lib/utils'
import { setPosts, setSelectedPost } from '@/redux/postSlice'
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover'
import { Button } from './ui/button'
import constants from '../constants'

const LeftSidebar = () => {
    const navigate = useNavigate();
    const { user } = useSelector(store => store.auth);
    const dispatch = useDispatch();
    const [openCreatePost, setOpenCreatePost] = useState(false);
    const { likeNotification } = useSelector(store => store.rtn);

    const logoutHandler = async () => {
        try {
            const baseUrl = constants.baseUrl;
            const logoutUrl = 'api/v1/user/logout';
            const logoutResponse = await axios.get(baseUrl + logoutUrl, { withCredentials: true });
            if (logoutResponse.data.success) {
                dispatch(setAuthUser(null));
                dispatch(setSelectedPost(null));
                dispatch(setPosts([]));
                navigate('/login');
                toast.success(logoutResponse.data.message);
            }
        } catch (error) {
            toast.error(error.response.data.message);
        }
    }

    const sidebarHandler = (textType) => {
        switch (textType) {
            case 'Home':
                navigate('/');
                break;
            case 'Messages':
                navigate('/chat');
                break;
            case 'Logout':
                logoutHandler();
                break;
            case 'Create':
                setOpenCreatePost(true);
                break;
            case 'Profile':
                navigate(`/profile/${user?._id}`);
                break;
            // default:
            //     console.log('This action is not available');
            //     break;
        }
    }

    const sidebarItems = [
        { icon: <Home />, text: 'Home' },
        { icon: <Search />, text: 'Search' },
        { icon: <TrendingUp />, text: 'Explore' },
        { icon: <MessageCircle />, text: 'Messages' },
        { icon: <Heart />, text: 'Notifications' },
        { icon: <PlusSquare />, text: 'Create' },
        {
            icon: (
                <Avatar className='w-6 h-6'>
                    <AvatarImage src={user?.profilePicture} alt={user?.email}/>
                    <AvatarFallback>{getInitialsFromUserName(user)}</AvatarFallback>
                </Avatar>
            ),
            text: 'Profile'
        },
        { icon: <LogOut />, text: 'Logout' }
    ];

    return (
        <div className='fixed top-0 z-10 left-0 px-4 border-r border-gray-300 h-screen w-[16%] bg-[#e9ffd7]'>
            <div className='flex flex-col'>
                <h1 className='my-8 pl-3 font-bold text-xl'>LOGO</h1>
                <div>
                    {
                        sidebarItems.map((item, index) => {
                            return (
                                <div onClick={() => sidebarHandler(item.text)} key={index} className='flex items-center gap-3 relative hover:bg-gray-100 p-3 my-3 rounded-lg cursor-pointer'>
                                    {item.icon}
                                    <span>{item.text}</span>
                                    {
                                        item.text == 'Notifications' && likeNotification.length > 0 && (
                                            <Popover>
                                                <PopoverTrigger asChild>
                                                    <Button size='icon' className="rounded-full h-5 w-5 bg-red-600 hover:bg-red-600 absolute bottom-6 left-6">{likeNotification.length}</Button>
                                                </PopoverTrigger>
                                                <PopoverContent>
                                                    <div>
                                                        {
                                                            likeNotification.length == 0 ? (<p>No new notification</p>) : (
                                                                likeNotification.map((notification) => {
                                                                    return (
                                                                        <div key={notification.userId} className='flex items-center gap-2 my-2'>
                                                                            <Avatar>
                                                                                <AvatarImage src={notification.userDetails?.profilePicture}/>
                                                                                <AvatarFallback>{getInitialsFromUserName(notification.userDetails)}</AvatarFallback>
                                                                            </Avatar>
                                                                            <p className='text-sm'><span className='font-bold'>{notification.userDetails?.username}</span> liked your post</p>
                                                                        </div>
                                                                    )
                                                                })
                                                            )
                                                        }
                                                    </div>
                                                </PopoverContent>
                                            </Popover>
                                        )
                                    }
                                </div>
                            )
                        })
                    }
                </div>
            </div>
            <CreatePost open={openCreatePost} setOpen={setOpenCreatePost}></CreatePost>
        </div>
    )
}
export default LeftSidebar