import { setPosts } from '@/redux/postSlice';
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import constants from '../constants'

const useGetAllPosts = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getAllPosts = async () => {
            try {
                const baseUrl = constants.baseUrl;
                const getAllPostsUrl = 'api/v1/post/getAllPosts';
                const getAllPostsResponse = await axios.get(baseUrl + getAllPostsUrl, { withCredentials: true });
                if (getAllPostsResponse.data.success) {
                    dispatch(setPosts(getAllPostsResponse.data.posts));
                }
            } catch (error) {
                console.log(error);
            }
        }
        getAllPosts();
    }, []);
};

export default useGetAllPosts