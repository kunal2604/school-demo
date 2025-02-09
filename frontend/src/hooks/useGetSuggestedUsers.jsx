import { setSuggestedUsers } from '@/redux/authSlice';
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import constants from '../constants'

const useGetSuggestedUsers = () => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getSuggestedUsers = async () => {
            try {
                const baseUrl = constants.baseUrl;
                const getSuggestedUsersUrl = 'api/v1/user/suggested';
                const getSuggestedUsersResponse = await axios.get(baseUrl + getSuggestedUsersUrl, { withCredentials: true });
                if (getSuggestedUsersResponse.data.success) {       
                    dispatch(setSuggestedUsers(getSuggestedUsersResponse.data.suggestedUsers));
                }
            } catch (error) {
                console.log(error);
            }
        }
        getSuggestedUsers();
    }, []);
};

export default useGetSuggestedUsers