import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchAnswers = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchAnswers = async (questionId) => {
        try {
            const response = await axios.get(`${API_URL}/answers/${questionId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.answers;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchAnswers;
}

export const useVoteAnswer = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const voteAnswer = async (answerId, vote) => {
        try {
            const response = await axios.put(`${API_URL}/answers/vote/${answerId}`, { vote }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.answer;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return voteAnswer;
}

export const useCreateAnswer = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createAnswer = async (questionId, content) => {

        try {
            const response = await axios.post(`${API_URL}/answers/`, { questionId, content }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.answer;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createAnswer;
}

export const useUpdateAnswer = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateAnswer = async (answerId, content) => {
        try {
            const response = await axios.put(`${API_URL}/answers/${answerId}`, { content }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.answer;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateAnswer;
}

export const useDeleteAnswer = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteAnswer = async (answerId) => {
        try {
            const response = await axios.delete(`${API_URL}/answers/${answerId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.answer;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteAnswer;
}