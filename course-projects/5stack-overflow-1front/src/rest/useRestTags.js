import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchTags = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchTags = async () => {
        try {
            const response = await axios.get(`${API_URL}/tags`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tags;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchTags;
}

export const useCreateTag = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createTag = async (tag) => {
        try {
            const response = await axios.post(`${API_URL}/tags`,  tag, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.tag;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createTag;
}

export const useUpdateTag = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateTag = async (tagId, tag) => {
        try {
            const response = await axios.put(`${API_URL}/tags/${tagId}`,  tag, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.tag;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateTag;
}

export const useDeleteTag = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteTag = async (tagId) => {
        try {
            const response = await axios.delete(`${API_URL}/tags/${tagId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tag;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteTag;
}