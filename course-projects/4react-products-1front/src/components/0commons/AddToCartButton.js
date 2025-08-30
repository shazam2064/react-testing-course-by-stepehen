import React, { useState } from 'react';
import { withRouter } from 'react-router-dom';
import { useAddProductToCart } from "../../rest/useRestCart";

function AddToCartButton({ productItem, history }) {
    const addProductToCart = useAddProductToCart();
    const [refreshCart, setRefreshCart] = useState(false);

    const handleAddToCart = async () => {
        await addProductToCart(productItem._id, 1);
        setRefreshCart(true);
        history.push({
            pathname: '/cart',
            state: { refreshCart: true }
        });
    };

    return (
        <button className="btn btn-outline-success" onClick={handleAddToCart}>Add to Cart</button>
    );
}

export default withRouter(AddToCartButton);