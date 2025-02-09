import { setUserProfile } from '@/redux/authSlice';
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import constants from '../constants'

const useGetUserProfile = (userId) => {
    const dispatch = useDispatch();
    useEffect(() => {
        const getUserProfile = async () => {
            try {
                const baseUrl = constants.baseUrl;
                const getUserProfileUrl = `api/v1/user/${userId}/profile`;
                const getUserProfileResponse = await axios.get(baseUrl + getUserProfileUrl, { withCredentials: true });
                if (getUserProfileResponse.data.success) {
                    dispatch(setUserProfile(getUserProfileResponse.data.user));
                }
            } catch (error) {
                dispatch(setUserProfile(null));
                console.log(error);
            }
        }
        getUserProfile();
    }, [userId]);
};

export default useGetUserProfile