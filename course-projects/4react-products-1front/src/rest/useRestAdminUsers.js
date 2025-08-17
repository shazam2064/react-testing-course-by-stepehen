import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchAdminUsers = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchAdminUsers = async () => {
        try {
            const response = await axios.get(`${API_URL}/users`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.users;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchAdminUsers;
}

export const useFetchAdminUserById = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchAdminUserById = async (adminUserId) => {
        try {
            const response = await axios.get(`${API_URL}/users/${adminUserId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.user;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchAdminUserById;
}

export const useCreateAdminUser = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createAdminUser = async (adminUser) => {
        const formData = new FormData();
        formData.append("name", adminUser.name);
        formData.append("email", adminUser.email);
        formData.append("password", adminUser.password);
        formData.append("isAdmin", adminUser.isAdmin);

        try {
            const response = await axios.post(`${API_URL}/users`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.user;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createAdminUser;
}

export const useUpdateAdminUser = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateAdminUser = async (adminUser) => {
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

         const requestData = {
            name: adminUser.name,
            email: adminUser.email,
            password: adminUser.password,
            status: adminUser.status,
            isAdmin: adminUser.isAdmin
        };
        requestConfig.headers['Content-Type'] = 'application/json';


        try {
            const response = await axios.put(`${API_URL}/users/${adminUser._id}`, requestData, requestConfig);
            console.log(response);
            return response.data.user;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }

    };

    return updateAdminUser;
}

export const useDeleteAdminUser = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteAdminUser = async (adminUserId) => {
        console.log('deleteAdminUser:', adminUserId);
        try {
            const response = await axios.delete(`${API_URL}/users/${adminUserId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.user;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteAdminUser;
}