import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { DispatchContext, ProductsContext } from '../../contexts/products.context';
import { getInitialProductState } from '../../reducers/products.reducer';
import { useCreateProduct, useUpdateProduct } from '../../rest/useRestProducts';
import { API_URL } from '../../rest/api.rest';
import { UserContext } from '../../contexts/user.context';
import { Alert, Form, FormGroup } from "reactstrap";

function AddEditProduct() {
    const products = useContext(ProductsContext);
    const dispatch = useContext(DispatchContext);
    const [product, setProduct] = useState(getInitialProductState());
    const [error, setError] = useState(null);
    const createProduct = useCreateProduct();
    const updateProduct = useUpdateProduct();
    const { prodId } = useParams();
    const navigate = useNavigate();
    const isEditMode = !!prodId;
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            const product = products.find(product => product._id === prodId);
            setProduct(product);
            console.log('product: ' + product);
        } else {
            setProduct(getInitialProductState());
        }
    }, [prodId, isEditMode, products]);

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image' && files.length > 0) {
            const file = files[0];
            setProduct(prevProduct => ({
                ...prevProduct,
                imageFile: file,
                imageUrl: URL.createObjectURL(file) // Optional: for preview purposes
            }));
        } else {
            setProduct(prevProduct => ({
                ...prevProduct,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const { name, price, description } = product;
        return name && price > 0 && description;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert('Please fill in the missing fields');
            return;
        }
        if (error) {
            setVisible(true);
        }
        try {
            if (isEditMode) {
                await updateProduct(product);
            } else {
                await createProduct(product);
            }
            setError(null);
            navigate('/admin/admin-products');
        } catch (error) {
            setError(`Product could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    if (!loggedUser.isAdmin) {
        return <p>Access denied. Admins only.</p>;
    }

    return (
        <div className="container col-6 offset-3 my-4">
            <h1 className="mb-3 text-center display-3">{isEditMode ? 'Edit Product' : 'Add Product'}</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit} method="POST">
                <FormGroup>
                    <label htmlFor="name">Name</label>
                    <input className="form-control" type="text" id="name" name="name" onChange={handleChange}
                           value={product.name || ''} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="price">Price</label>
                    <input className="form-control" type="number" id="price" name="price" step="0.01"
                           onChange={handleChange} value={product.price || ''} />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="description">Description</label>
                    <textarea className="form-control" id="description" name="description" rows="5"
                              onChange={handleChange} value={product.description || ''}></textarea>
                </FormGroup>
                <FormGroup>
                    <label htmlFor="image">Image</label>
                    <input className="form-control" type="file" id="image" name="image" onChange={handleChange} />
                </FormGroup>
                <button className="btn btn-outline-success mb-3"
                        type="submit">{isEditMode ? 'Edit Product' : 'Add Product'}</button>
            </Form>
            <div>
                <img src={
                    isEditMode && product.imageUrl?.startsWith('images')
                        ? `${API_URL}/${product.imageUrl}`
                        : product.imageUrl
                }
                     alt={product.name || 'Product'} />
            </div>
        </div>
    );
}

export default AddEditProduct;