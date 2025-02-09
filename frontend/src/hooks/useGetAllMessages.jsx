import { setMessages } from '@/redux/chatSlice';
import axios from 'axios'
import { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import constants from '../constants'

const useGetAllMessages = () => {
    const dispatch = useDispatch();
    const { selectedUser } = useSelector(store => store.chat);
    useEffect(() => {
        const getAllMessages = async () => {
            try {                
                const baseUrl = constants.baseUrl;
                const getAllMessagesUrl = `api/v1/message/all/${selectedUser?._id}`;
                const getAllMessagesResponse = await axios.get(baseUrl + getAllMessagesUrl, { withCredentials: true });
                if (getAllMessagesResponse.data.success) {
                    dispatch(setMessages(getAllMessagesResponse.data.messages));
                }
            } catch (error) {
                console.log(error);
            }
        }
        getAllMessages();
    }, [selectedUser]);
};

export default useGetAllMessages