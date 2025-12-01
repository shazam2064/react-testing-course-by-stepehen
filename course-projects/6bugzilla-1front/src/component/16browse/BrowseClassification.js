import React, { useContext, useEffect, useState } from 'react';
import { ClassificationsContext, DispatchContext } from "../../contexts/classifications.context";
import { useFetchClassifications } from "../../rest/useRestClassifications";
import { TitleContext } from "../../contexts/title.context";
import {Alert} from "reactstrap";

function BrowseClassification(props) {
    const classifications = useContext(ClassificationsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchClassifications = useFetchClassifications();
    const { setTitle } = useContext(TitleContext);

    useEffect(() => {
        fetchClassifications().then(classifications => {
            dispatch({ type: 'SET_CLASSIFICATIONS', classifications: classifications });
        }).catch(error => {
            dispatch({ type: 'SET_CLASSIFICATIONS', classifications: [] });
            setError(error.message);
        });

        setTitle('Browse Classifications');
    }, [setTitle]);

    const handleProductClick = (productId) => {
        props.history.push(`/browse-prod/${productId}`);
    };

    return (
        <div className="container p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h1 className="display-6 mb-3 text-secondary">Select a product category to browse:</h1>
            {error ? (
                <Alert className="custom-alert">
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                classifications.map(classification => (
                    <div key={classification._id} className="container p-1 my-2 mx-auto">
                        <p><em>{classification.name}: {classification.description}</em></p>
                        <ul>
                            {classification.products.map(product => (
                                <li key={product._id}>
                                    <a href="" onClick={() => handleProductClick(product._id)}>{product.name}</a>: {product.description}
                                </li>
                            ))}
                        </ul>
                    </div>
                ))
            )}
        </div>
    );
}

export default BrowseClassification;