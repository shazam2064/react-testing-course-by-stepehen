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

export const useFollowAdminUser = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const followAdminUser = async (adminUserId) => {
        try {
            const response = await axios.put(`${API_URL}/users/follow/${adminUserId}`, {}, {
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

    return followAdminUser;
}

export const useCreateAdminUser = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createAdminUser = async (adminUser) => {
        const formData = new FormData();
        formData.append("name", adminUser.name);
        formData.append("email", adminUser.email);
        formData.append("image", adminUser.imageFile);
        formData.append("password", adminUser.password);
        formData.append("isAdmin", adminUser.isAdmin || false);
        formData.append("headline", adminUser.headline || "");
        formData.append("about", adminUser.about || "");
        formData.append("location", adminUser.location || "");
        formData.append("experience", JSON.stringify(adminUser.experience || []));
        formData.append("education", JSON.stringify(adminUser.education || []));
        formData.append("skills", JSON.stringify(adminUser.skills || []));
        formData.append("connections", JSON.stringify(adminUser.connections || []));
        formData.append("jobs", JSON.stringify(adminUser.jobs || []));
        formData.append("applications", JSON.stringify(adminUser.applications || []));
        formData.append("posts", JSON.stringify(adminUser.posts || []));
        formData.append("comments", JSON.stringify(adminUser.comments || []));
        formData.append("following", JSON.stringify(adminUser.following || []));
        formData.append("followers", JSON.stringify(adminUser.followers || []));
        formData.append("conversations", JSON.stringify(adminUser.conversations || []));
        console.log('createAdminUser:', adminUser);

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
        let requestData;
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

        if (adminUser.imageFile) {
            requestData = new FormData();
            requestData.append("name", adminUser.name);
            requestData.append("email", adminUser.email);
            requestData.append("image", adminUser.imageFile);
            requestData.append("password", adminUser.password);
            requestData.append("isAdmin", adminUser.isAdmin || false);
            requestData.append("headline", adminUser.headline || "");
            requestData.append("about", adminUser.about || "");
            requestData.append("location", adminUser.location || "");
            requestData.append("experience", JSON.stringify(adminUser.experience || []));
            requestData.append("education", JSON.stringify(adminUser.education || []));
            requestData.append("skills", JSON.stringify(adminUser.skills || []));
            requestData.append("connections", JSON.stringify(adminUser.connections || []));
            requestData.append("jobs", JSON.stringify(adminUser.jobs || []));
            requestData.append("applications", JSON.stringify(adminUser.applications || []));
            requestData.append("posts", JSON.stringify(adminUser.posts || []));
            requestData.append("comments", JSON.stringify(adminUser.comments || []));
            requestData.append("following", JSON.stringify(adminUser.following || []));
            requestData.append("followers", JSON.stringify(adminUser.followers || []));
            requestData.append("conversations", JSON.stringify(adminUser.conversations || []));
            requestConfig.headers['Content-Type'] = 'multipart/form-data';
        } else {
            requestData = {
                name: adminUser.name,
                email: adminUser.email,
                password: adminUser.password,
                isAdmin: adminUser.isAdmin || false,
                image: adminUser.image, // Retain the old image
                headline: adminUser.headline || "",
                about: adminUser.about || "",
                location: adminUser.location || "",
                experience: adminUser.experience || [],
                education: adminUser.education || [],
                skills: adminUser.skills || [],
                connections: adminUser.connections || [],
                jobs: adminUser.jobs || [],
                applications: adminUser.applications || [],
                posts: adminUser.posts || [],
                comments: adminUser.comments || [],
                following: adminUser.following || [],
                followers: adminUser.followers || [],
                conversations: adminUser.conversations || []
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        }

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
};

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