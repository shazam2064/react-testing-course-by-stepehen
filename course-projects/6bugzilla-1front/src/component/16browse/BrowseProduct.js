import React, { useContext, useEffect, useState } from 'react';
import { ProductsContext, DispatchContext } from "../../contexts/products.context";
import { useFetchProducts } from "../../rest/useRestProducts";
import { UserContext } from "../../contexts/user.context";
import { TitleContext } from "../../contexts/title.context";
import {Alert} from "reactstrap";

function BrowseProduct(props) {
    const { prodId } = props.match.params;
    const products = useContext(ProductsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchProducts = useFetchProducts();
    const loggedUser = useContext(UserContext);
    const { setTitle } = useContext(TitleContext);

    useEffect(() => {
        fetchProducts().then(products => {
            dispatch({ type: 'SET_PRODUCTS', products: products });
        }).catch(error => {
            dispatch({ type: 'SET_PRODUCTS', products: [] });
            setError(error.message);
        });

        setTitle('Product Management');
    }, [setTitle]);

    const handleComponentClick = (componentId) => {
        props.history.push(`/bug-browse/${componentId}`);
    };

    const handleUserClick = (userId) => {
        props.history.push(`/profile/${userId}`);
    };

    const selectedProduct = products.find(product => product._id === prodId);

    return (
        <div className="container p-5 my-4 mx-auto bg-light border-3 border rounded">
            {error ? (
                <Alert className="custom-alert">
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : selectedProduct ? (
                <div className="container p-1 my-2 mx-auto">
                    <h2 className="d-flex justify-content-start">{selectedProduct.name}</h2>
                    <p><em>{selectedProduct.description}</em></p>
                    <hr/>
                    <p>Select a component to see open bugs in that component:</p>
                    <ul>
                        {selectedProduct.components.map(component => (
                            <li key={component._id}>
                                <span className="text-muted"> Assignee - </span><a href="" onClick={() => handleUserClick(component.assignee._id)}>{component.assignee.name}</a>
                                <br/>
                                <a href="" onClick={() => handleComponentClick(component._id)}>{component.name}</a>: {component.description}
                            </li>
                        ))}
                    </ul>
                </div>
            ) : (
                <p>Product not found</p>
            )}
        </div>
    );
}

export default BrowseProduct;