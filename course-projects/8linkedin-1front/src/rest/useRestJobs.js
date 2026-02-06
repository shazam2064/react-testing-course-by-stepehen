import { useContext } from 'react';
import axios from 'axios';
import { JobsContext, DispatchContext } from '../contexts/jobs.context';
import { API_URL } from './api.rest';
import { UserContext } from '../contexts/user.context';

export const useFetchJobs = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchJobs = async () => {
        try {
            const response = await axios.get(`${API_URL}/jobs`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.jobs;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchJobs;
}

export const useFetchJob = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchJob = async (jobId) => {
        try {
            const response = await axios.get(`${API_URL}/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.job;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchJob;
}

export const useCreateJob = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createJob = async (jobData) => {
        const formData = new FormData();
        formData.append('title', jobData.title);
        formData.append('company', jobData.company);
        formData.append('location', jobData.location);
        formData.append('description', jobData.description);
        formData.append('requirements', JSON.stringify(jobData.requirements || []));

        try {
            const response = await axios.post(`${API_URL}/jobs`, jobData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.job;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createJob;
}

export const useUpdateJob = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateJob = async (job) => {
        try {
            const response = await axios.put(`${API_URL}/jobs/${job._id}`, job, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.job;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateJob;
}

export const useDeleteJob = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteJob = async (jobId) => {
        try {
            const response = await axios.delete(`${API_URL}/jobs/${jobId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.job;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteJob;
}