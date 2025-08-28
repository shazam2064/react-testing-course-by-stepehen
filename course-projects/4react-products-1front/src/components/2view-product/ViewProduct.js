import React, { useContext, useState } from 'react';
import { useParams } from 'react-router-dom';
import { ProductsContext } from '../../contexts/products.context';
import AddToCartButton from "../0commons/AddToCartButton";
import { API_URL } from "../../rest/api.rest";
import { Alert } from "reactstrap";

function ViewProduct() {
    const { prodId } = useParams();
    const products = useContext(ProductsContext);
    const product = products.find(p => p._id === prodId);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    if (!product) {
        return (
            <div className="container my-4">
                <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">Sorry...</h4>
                    No product found.
                </Alert>
            </div>
        );
    }

    return (
        <div className="container mt-4 col-8 offset-2">
            <h2 className="display-4 text-center mb-4">{product.name}</h2>

            <div className="row">
                <div className="col-md-6">
                    <img src={`${API_URL}/${product.imageUrl}`} alt={product.imageUrl} className="img-fluid" />
                </div>

                <div className="col-md-6">
                    <h2 className="text-success">${product.price}</h2>
                    <p>{product.description}</p>

                    <AddToCartButton productItem={product} />
                </div>
            </div>
        </div>
    );
}

export default ViewProduct;