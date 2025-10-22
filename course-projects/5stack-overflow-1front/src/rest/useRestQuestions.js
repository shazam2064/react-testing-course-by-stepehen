import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchQuestions = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchQuestions = async () => {
        try {
            const response = await axios.get(`${API_URL}/questions`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.questions;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchQuestions;
}

export const useVoteQuestion = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const voteQuestion = async (questionId, vote) => {
        try {
            const response = await axios.put(`${API_URL}/questions/vote/${questionId}`, { vote }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.question;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return voteQuestion;
}

export const useFetchQuestion = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchQuestion = async (questionId) => {
        try {
            const response = await axios.get(`${API_URL}/questions/${questionId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.question;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchQuestion;
}

export const useFetchQuestionsByTag = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchQuestionsByTag = async (tagId) => {
        try {
            const response = await axios.get(`${API_URL}/question/${tagId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.questions;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchQuestionsByTag;
}

export const useCreateQuestion = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createQuestion = async (question) => {

        try {
            const response = await axios.post(`${API_URL}/questions`, question, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.question;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createQuestion;
}

export const useUpdateQuestion = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateQuestion = async (question) => {
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        }

        const requestData = {
            title: question.title,
            content: question.content,
            tags: question.tags
        };
        requestConfig.headers["Content-Type"] = "application/json";

        try {
            const response = await axios.put(`${API_URL}/questions/${question._id}`, requestData, requestConfig);
            console.log(response);
            return response.data.question;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateQuestion;
}

export const useDeleteQuestion = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteQuestion = async (questionId) => {
        try {
            const response = await axios.delete(`${API_URL}/questions/${questionId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.question;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteQuestion;
}