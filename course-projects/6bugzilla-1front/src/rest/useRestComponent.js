import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchComponents = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchComponents = async () => {
        try {
            const response = await axios.get(`${API_URL}/components`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.components;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchComponents;
}

export const useFetchComponentById = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchComponentById = async (componentId) => {
        try {
            const response = await axios.get(`${API_URL}/components/${componentId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.component;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchComponentById;
}

export const useCreateComponent = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createComponent = async (component) => {
        const formData = new FormData();
        formData.append("name", component.name);
        formData.append("description", component.description);
        formData.append("product", component.product);
        formData.append("assignee", component.assignee);
        component.CC.forEach(cc => formData.append("CC", cc));

        try {
            const response = await axios.post(`${API_URL}/components`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.component;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };
    
    return createComponent;
}

export const useUpdateComponent = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateComponent = async (component) => {
        try {
            const response = await axios.put(`${API_URL}/components/${component._id}`, component, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.component;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateComponent;
}

export const useDeleteComponent = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteComponent = async (componentId) => {
        try {
            const response = await axios.delete(`${API_URL}/components/${componentId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.component;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteComponent;
}