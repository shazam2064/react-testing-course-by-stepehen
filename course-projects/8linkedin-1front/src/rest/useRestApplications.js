import {useContext} from "react";
import {UserContext, DispatchContext} from "../contexts/user.context";
import axios from "axios";
import {API_URL} from "./api.rest";

export const useFetchApplications = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const useFetchApplications = async () => {
        try {
            const response = await axios.get(`${API_URL}/applications`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.applications;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    }

    return useFetchApplications;
}

export const useCreateApplication = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createApplication = async (application) => {
        const formData = new FormData();
        formData.append('job', application.jobId);
        formData.append('resume', application.resume);
        formData.append('coverLetter', application.coverLetter);
        formData.append('status', 'pending');

        try {
            const response = await axios.post(`${API_URL}/applications`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.application;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    }

    return createApplication;
}

export const useUpdateApplication = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateApplication = async (applicationId, status) => {
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`,
                "Content-Type": "application/json"
            }
        };

        const requestData = { status };

        try {
            const response = await axios.put(`${API_URL}/applications/${applicationId}`, requestData, requestConfig);
            console.log(response);
            return response.data.application;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateApplication;
};

export const useDeleteApplication = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteApplication = async (applicationId) => {
        try {
            const response = await axios.delete(`${API_URL}/applications/${applicationId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
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
    }

    return deleteApplication;
}
