import {useContext} from "react";
import {UserContext, DispatchContext} from "../contexts/user.context";
import axios from "axios";
import {API_URL} from "./api.rest";

export const useCreateComment = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createComment = async (post, text) => {
        try {
            const response = await axios.post(`${API_URL}/comments`, {post, text}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.comment;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    }

    return createComment;
}

export const useUpdateComment = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateComment = async (commentId, text) => {
        try {
            const response = await axios.put(`${API_URL}/comments/${commentId}`, { text }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.comment;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    }

    return updateComment;
}

export const useDeleteComment = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteComment = async (commentId) => {
        try {
            const response = await axios.delete(`${API_URL}/comments/${commentId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.comment;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    }

    return deleteComment;
}

export const useLikeComment = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const likePost = async (commentId) => {
        try {
            const response = await axios.put(`${API_URL}/comments/like/${commentId}`, {}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.post;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return likePost;
}