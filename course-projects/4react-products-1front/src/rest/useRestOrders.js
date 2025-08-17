import {useContext} from "react";
import axios from "axios";
import {UserContext, DispatchContext} from "../contexts/user.context";
import {API_URL} from "./api.rest";

export const useFetchOrders = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchOrders = async () => {
        try {
            const response = await axios.get(`${API_URL}/orders`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.orders;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({type: "LOGOUT"});
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchOrders;
}

export const useCreateOrder = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createOrder = async (orderData) => {
        try {
            const response = await axios.post(`${API_URL}/orders`, orderData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.order;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({type: "LOGOUT"});
            }
            throw new Error(error.response.data.message);
        }
    };

    return createOrder;
}

export const useDeleteOrder = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteOrder = async (orderId) => {
        try {
            const response = await axios.delete(`${API_URL}/orders/${orderId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.order;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({type: "LOGOUT"});
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteOrder;
}