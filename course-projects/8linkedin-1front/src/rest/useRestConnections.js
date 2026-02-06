import { useContext } from "react";
import axios from "axios";
import { ConnectionsContext, DispatchContext } from "../contexts/connections.context";
import { API_URL } from "./api.rest";
import { UserContext } from "../contexts/user.context";

export const useFetchConnections = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchConnections = async () => {
        try {
            const response = await axios.get(`${API_URL}/connections`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.connections;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchConnections;
}

export const useCreateConnection = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createConnection = async (receiverId) => {
        try {
            const response = await axios.post(`${API_URL}/connections`, { receiver: receiverId }, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.connection;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createConnection;
}

export const useUpdateConnection = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateConnection = async (connectionId, status) => {
        try {
            const response = await axios.put(`${API_URL}/connections/${connectionId}`, {status: status}, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.connection;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateConnection;
}