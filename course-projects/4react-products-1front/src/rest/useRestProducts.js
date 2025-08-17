import { useContext } from 'react';
import axios from 'axios';
import { UserContext, DispatchContext } from '../contexts/user.context';
import { API_URL } from './api.rest';

export const useFetchProducts = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const fetchProducts = async () => {
        try {
            const response = await axios.get(`${API_URL}/products?numItems=10&page=1`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return response.data.products;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return fetchProducts;
};

export const useCreateProduct = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const createProduct = async (product) => {
        const formData = new FormData();
        formData.append('name', product.name);
        formData.append('description', product.description);
        formData.append('price', product.price);
        formData.append('image', product.imageFile);

        try {
            const response = await axios.post(`${API_URL}/products`, formData, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`,
                    'Content-Type': 'multipart/form-data'
                }
            });
            console.log(response);
            return response.data.product;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return createProduct;
};

export const useUpdateProduct = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const updateProduct = async (product) => {
        let requestData;
        const requestConfig = {
            headers: {
                Authorization: `Bearer ${loggedUser.token}`
            }
        };

        if (product.imageFile) {
            requestData = new FormData();
            requestData.append('name', product.name);
            requestData.append('description', product.description);
            requestData.append('price', product.price);
            requestData.append('image', product.imageFile);
            requestConfig.headers['Content-Type'] = 'multipart/form-data';
        } else {
            requestData = {
                name: product.name,
                description: product.description,
                price: product.price
            };
            requestConfig.headers['Content-Type'] = 'application/json';
        }

        try {
            const response = await axios.put(`${API_URL}/products/${product._id}`, requestData, requestConfig);
            console.log(response);
            return response.data.product;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return updateProduct;
};

export const useDeleteProduct = () => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);

    const deleteProduct = async (productId) => {
        console.log('Deleting product:', productId);
        try {
            const response = await axios.delete(`${API_URL}/products/${productId}`, {
                headers: {
                    Authorization: `Bearer ${loggedUser.token}`
                }
            });
            console.log(response);
            return productId;
        } catch (error) {
            console.error(error.response.data, error.response.status);
            if (error.response.status === 401) {
                loggedDispatch({ type: 'LOGOUT' });
            }
            throw new Error(error.response.data.message);
        }
    };

    return deleteProduct;

}