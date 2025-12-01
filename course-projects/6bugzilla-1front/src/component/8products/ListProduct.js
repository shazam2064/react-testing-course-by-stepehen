import React, { useContext, useEffect, useState } from 'react';
import { ProductsContext, DispatchContext } from "../../contexts/products.context";
import { useDeleteProduct, useFetchProducts } from "../../rest/useRestProducts";
import { UserContext } from "../../contexts/user.context";
import { TitleContext } from "../../contexts/title.context";
import ProductItem from "../8products/ProductItem";
import { withRouter } from "react-router-dom";
import {Alert, Table} from "reactstrap";

function ListProduct(props) {
    const products = useContext(ProductsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchProducts = useFetchProducts();
    const deleteProduct = useDeleteProduct();
    const [refreshProducts, setRefreshProducts] = useState(true);
    const loggedUser = useContext(UserContext);
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshProducts) {
            setRefreshProducts(false);
            fetchProducts().then(products => {
                dispatch({ type: 'SET_PRODUCTS', products: products });
            }).catch(error => {
                dispatch({ type: 'SET_PRODUCTS', products: [] });
                setError(error.message);
            });
        }

        setTitle('Product Management');
    }, [refreshProducts, setTitle]);

    const handleEditProduct = (productId) => {
        props.history.push('/admin/edit-product/' + productId);
    }

    const handleDeleteProduct = (productId) => {
        deleteProduct(productId).then(() => {
            dispatch({ type: 'DELETE_PRODUCT', payload: { _id: productId } });
            setError(null);
            setRefreshProducts(true);
        }).catch(error => {
            setError('Product could not be deleted: ' + error.message);
        });
    }

    const handleAddProduct = () => {
        props.history.push('/admin/add-product');
    }

    const showActionButtons = (product) => {
        return (
            <>
                <button className="btn btn-outline-success me-2" onClick={() => handleEditProduct(product._id)}>Edit</button>
                <button className="btn btn-outline-danger me-4" onClick={() => handleDeleteProduct(product._id)}>Delete</button>
            </>
        );
    }

    return (
        <div className="container p-5 my-2 mx-auto bg-light border-3 border rounded">
            <h1 className="mb-3 display-5">Product Management</h1>
            <div className="mb-3 d-flex justify-content-end">
                <button className="btn btn-outline-secondary" onClick={handleAddProduct}>Add Product</button>
            </div>
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                products.length === 0 ? (
                    <Alert color="warning">
                        <h4 className="alert-heading">Sorry...</h4>
                        No products found.
                    </Alert>
                ) : (
                    <Table responsive>
                        <thead className="table-secondary">
                        <tr>
                            <th>Name</th>
                            <th>Description</th>
                            <th>version</th>
                            <th>Classification</th>
                            <th>Number of Components</th>
                            <th>Actions</th>
                        </tr>
                        </thead>
                        <tbody>
                        {products.map(product => (
                            <ProductItem
                                key={product._id}
                                product={product}
                                actionButtons={showActionButtons(product)}
                            />
                        ))}
                        </tbody>
                    </Table>
                )
            )}
        </div>
    );
}

export default withRouter(ListProduct);