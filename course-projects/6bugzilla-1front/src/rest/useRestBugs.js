import { useContext } from "react";
import axios from "axios";
import { UserContext, DispatchContext } from "../contexts/user.context";
import { API_URL } from "./api.rest";

export const useFetchBugs = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchBugs = async () => {
        try {
            const response = await axios.get(`${API_URL}/bugs`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.bugs;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchBugs;
}

export const useFetchBugById = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchBugById = async (bugId) => {
        try {
            const response = await axios.get(`${API_URL}/bugs/${bugId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.bug;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchBugById;
}

export const useCreateBug = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createBug = async (bug) => {
        const formData = new FormData();
        formData.append("product", bug.product);
        formData.append("component", bug.component);
        formData.append("summary", bug.summary);
        formData.append("description", bug.description);
        formData.append("severity", bug.severity);
        formData.append("priority", bug.priority);
        formData.append("version", bug.version);
        formData.append("hardware", bug.hardware);
        formData.append("os", bug.os);
        formData.append("status", bug.status);
        formData.append("resolution", bug.resolution);
        bug.CC.forEach(cc => formData.append("CC", cc));
        formData.append("assignee", bug.assignee);
        formData.append("reporter", loggedUser.userId);
        formData.append("deadline", bug.deadline);
        formData.append("hoursWorked", bug.hoursWorked);
        formData.append("hoursLeft", bug.hoursLeft);
        if (bug.dependencies && bug.dependencies.length > 0) {
            bug.dependencies.forEach(dep => formData.append("dependencies", dep));
        }
        formData.append("attachment", bug.imageFile);

        try {
            const response = await axios.post(`${API_URL}/bugs`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    "Content-Type": "multipart/form-data"
                }
            });
            console.log(response);
            return response.data.bug;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createBug;
}

export const useUpdateBug = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateBug = async (bug) => {
        let requestData;
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

        const productId = bug.product._id ? bug.product._id : bug.product;
        const componentId = bug.component._id ? bug.component._id : bug.component;

        if (bug.imageFile) {
            requestData = new FormData();
            requestData.append("product", productId);
            requestData.append("component", componentId);
            requestData.append("summary", bug.summary);
            requestData.append("description", bug.description);
            requestData.append("severity", bug.severity);
            requestData.append("priority", bug.priority);
            requestData.append("version", bug.version);
            requestData.append("hardware", bug.hardware);
            requestData.append("os", bug.os);
            requestData.append("status", bug.status);
            requestData.append("resolution", bug.resolution);
            bug.CC.forEach(cc => requestData.append("CC", cc));
            requestData.append("assignee", bug.assignee._id);
            requestData.append("reporter", bug.reporter._id);
            requestData.append("deadline", bug.deadline);
            requestData.append("hoursWorked", bug.hoursWorked);
            requestData.append("hoursLeft", bug.hoursLeft);
            bug.dependencies.forEach(dep => requestData.append("dependencies", dep));
            requestData.append("attachment", bug.imageFile);
            requestConfig.headers["Content-Type"] = "multipart/form-data";
        } else {
            requestData = {
                product: productId,
                component: componentId,
                summary: bug.summary,
                description: bug.description,
                severity: bug.severity,
                priority: bug.priority,
                version: bug.version,
                hardware: bug.hardware,
                os: bug.os,
                status: bug.status,
                resolution: bug.resolution,
                CC: bug.CC,
                assignee: bug.assignee._id,
                reporter: bug.reporter._id,
                deadline: bug.deadline,
                hoursWorked: bug.hoursWorked,
                hoursLeft: bug.hoursLeft,
                dependencies: JSON.stringify(bug.dependencies),
            };
            requestConfig.headers["Content-Type"] = "application/json";
        }

        try {
            const response = await axios.put(`${API_URL}/bugs/${bug._id}`, requestData, requestConfig);
            console.log(response);
            return response.data.bug;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateBug;
}

export const useDeleteBug = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteBug = async (bugId) => {
        try {
            const response = await axios.delete(`${API_URL}/bugs/${bugId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.bug;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: "LOGOUT" });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteBug;
}