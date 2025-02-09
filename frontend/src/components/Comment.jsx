import { Avatar, AvatarFallback, AvatarImage } from './ui/avatar'
import { getInitialsFromUserName } from '@/lib/utils'

const Comment = ({ comment }) => {
    return (
        <div className='my-2'>
            <div className='flex gap-3 items-center'>
                <Avatar>
                    <AvatarImage src={comment?.author?.profilePicture} />
                    <AvatarFallback>{getInitialsFromUserName(comment?.author)}</AvatarFallback>
                </Avatar>
                <h1 className='font-bold text-sm'>{comment?.author?.username} <span className='font-normal pl-1'>{comment?.text}</span></h1>
            </div>
        </div>
    )
}

export default Comment