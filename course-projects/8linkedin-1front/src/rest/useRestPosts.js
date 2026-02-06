import { useContext } from "react";
import axios from "axios";
import { PostsContext, DispatchContext } from "../contexts/posts.context";
import { API_URL } from "./api.rest";
import {UserContext} from "../contexts/user.context";

export const useFetchPosts = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchPosts = async () => {
        try {
            const response = await axios.get(`${API_URL}/posts`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.posts;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchPosts;
}

export const useFetchPost = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchPost = async (postId) => {
        try {
            const response = await axios.get(`${API_URL}/posts/${postId}`, {
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

    return fetchPost;
}

export const useCreatePost = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createPost = async (post) => {
        const formData = new FormData();
        formData.append('content', post.content);
        formData.append('image', post.imageFile);

        try {
            const response = await axios.post(`${API_URL}/posts`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
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

    return createPost;
}

export const useUpdatePost = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updatePost = async (post) => {
        let requestData;
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

        if (post.imageFile) {
            requestData = new FormData();
            requestData.append('content', post.content);
            requestData.append('image', post.imageFile);
            requestConfig.headers['Content-Type'] = 'multipart/form-data';
        } else if (post.image) {
            requestData = {
                content: post.content,
                image: post.image
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        } else {
            requestData = {
                content: post.content,
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await axios.put(`${API_URL}/posts/${post._id}`, requestData, requestConfig);
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

    return updatePost;
};

export const useDeletePost = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deletePost = async (postId) => {
        try {
            const response = await axios.delete(`${API_URL}/posts/${postId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.message;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deletePost;
}

export const useLikePost = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const likePost = async (postId) => {
        try {
            const response = await axios.put(`${API_URL}/posts/like/${postId}`, {}, {
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

