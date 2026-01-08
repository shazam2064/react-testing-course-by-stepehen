import { useContext } from "react";
import axios from "axios";
import { TweetsContext, DispatchContext } from "../contexts/tweets.context";
import { API_URL } from "./api.rest";
import {UserContext} from "../contexts/user.context";

export const useFetchTweets = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchTweets = async () => {
        try {
            const response = await axios.get(`${API_URL}/tweets`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tweets;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchTweets;
}

export const useFetchTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchTweet = async (tweetId) => {
        try {
            const response = await axios.get(`${API_URL}/tweets/${tweetId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tweet;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchTweet;
}

export const useCreateTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createTweet = async (tweet) => {
        const formData = new FormData();
        formData.append('text', tweet.text);
        formData.append('image', tweet.imageFile);

        try {
            const response = await axios.post(`${API_URL}/tweets`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.tweet;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createTweet;
}

export const useUpdateTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateTweet = async (tweet) => {
        let requestData;
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

        if (tweet.imageFile) {
            requestData = new FormData();
            requestData.append('text', tweet.text);
            requestData.append('image', tweet.imageFile);
            requestConfig.headers['Content-Type'] = 'multipart/form-data';
        } else if (tweet.image) {
            requestData = {
                text: tweet.text,
                image: tweet.image
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        } else {
            requestData = {
                text: tweet.text,
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await axios.put(`${API_URL}/tweets/${tweet._id}`, requestData, requestConfig);
            console.log(response);
            return response.data.tweet;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateTweet;
};

export const useDeleteTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteTweet = async (tweetId) => {
        try {
            const response = await axios.delete(`${API_URL}/tweets/${tweetId}`, {
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

    return deleteTweet;
}

export const useLikeTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const likeTweet = async (tweetId) => {
        try {
            const response = await axios.put(`${API_URL}/tweets/like/${tweetId}`, {}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tweet;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return likeTweet;
}

export const useReTweet = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const reTweet = async (tweetId) => {
        try {
            const response = await axios.put(`${API_URL}/tweets/retweet/${tweetId}`, {}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.tweet;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return reTweet;
}