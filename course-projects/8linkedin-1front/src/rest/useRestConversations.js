import { useContext } from "react";
import axios from "axios";
import { ConversationsContext, DispatchContext } from "../contexts/conversations.context";
import { API_URL } from "./api.rest";
import { UserContext } from "../contexts/user.context";

export const useFetchConversations = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchConversations = async () => {
        try {
            const response = await axios.get(`${API_URL}/conversations`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversations;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchConversations;
}

export const useFetchConversation = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchConversation = async (conversationId) => {
        try {
            const response = await axios.get(`${API_URL}/conversations/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversation;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchConversation;
}

export const useCreateConversation = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createConversation = async (conversationData) => {
        const formData = new FormData();
        formData.append('participants', JSON.stringify(conversationData.participants || []));
        formData.append('text', conversationData.text);

        try {
            const response = await axios.post(`${API_URL}/conversations`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversation;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createConversation;
}

export const useUpdateConversation = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateConversation = async (conversationId, text) => {
        try {
            const response = await axios.put(`${API_URL}/conversations/${conversationId}`, {text}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversation;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateConversation;
}

export const useDeleteConversation = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteConversation = async (conversationId) => {
        try {
            const response = await axios.delete(`${API_URL}/conversations/${conversationId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversation;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteConversation;
}

export const useMarkConversationAsRead = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const markConversationAsRead = async (conversationId) => {
        try {
            const response = await axios.put(`${API_URL}/conversations/read/${conversationId}`, {}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.conversation;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return markConversationAsRead;
}