import React, { useContext, useEffect, useState } from 'react';
import { DispatchContext, ProductsContext } from '../../contexts/products.context';
import ProductItem from '../0commons/ProductItem';
import { withRouter } from 'react-router-dom';
import AddToCartButton from "./AddToCartButton";
import { useFetchProducts, useDeleteProduct } from "../../rest/useRestProducts";
import {Alert} from "reactstrap";

function ListProducts(props) {
    const products = useContext(ProductsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchProducts = useFetchProducts();
    const deleteProduct = useDeleteProduct();
    const { adminProducts } = props;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        const getProducts = async () => {
            try {
                const products = await fetchProducts();
                dispatch({ type: 'SET_PRODUCTS', products });
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({ type: 'LOGOUT' });
                }
                dispatch({ type: 'SET_PRODUCTS', products: [] });
                setError('Products could not be retrieved.');
            }
        };

        getProducts();

        if (error) {
            setVisible(true);
        }
    }, [dispatch, error]);

    const handleEditProduct = (prodId) => {
        props.history.push(`/admin/edit-product/${prodId}`);
    };

    const handleDeleteProduct = (prodId) => {
        deleteProduct(prodId).then(() => {
            dispatch({ type: 'DELETE_PRODUCT', payload: { _id: prodId } });
            setError(null);
        }).catch(error => {
            setError('Product could not be deleted.');
        });
    };

    const handleViewProduct = (prodId) => {
        console.log('Viewing product:', prodId);
        props.history.push(`/view-product/${prodId}`);
    }

    const showActionButtons = (product) => {
        console.log('adminProducts:', product._id);
        if (adminProducts) {
            return (
                <>
                    <button className="btn btn-outline-primary" onClick={() => handleEditProduct(product._id)}>Edit</button>
                    <button className="btn btn-outline-danger" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
                </>
            );
        } else {
            return (
                <>
                    <button className="btn btn-outline-success" onClick={() => handleViewProduct(product._id)}>View Details</button>
                    <AddToCartButton productItem={product} />
                </>
            );
        }
    }

    return (
        <section className="container">
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                products.length === 0 ? (
                    <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">Sorry...</h4>
                        No products found.
                    </Alert>
                ) : (
                    <div className="row">
                        {products.map(product => (
                            <div className="col-md-4 mb-4" key={product._id}>
                                <ProductItem
                                    product={product}
                                    actionButtons={showActionButtons(product)}
                                />
                            </div>
                        ))}
                    </div>
                )
            )}
        </section>
    );
}

export default withRouter(ListProducts);