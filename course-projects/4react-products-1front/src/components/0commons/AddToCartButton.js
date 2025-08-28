import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAddProductToCart } from "../../rest/useRestCart";

function AddToCartButton({ productItem }) {
    const addProductToCart = useAddProductToCart();
    const [refreshCart, setRefreshCart] = useState(false);
    const navigate = useNavigate();

    const handleAddToCart = async () => {
        await addProductToCart(productItem._id, 1);
        setRefreshCart(true);
        navigate('/cart', { state: { refreshCart: true } });
    };

    return (
        <button className="btn btn-outline-success" onClick={handleAddToCart}>Add to Cart</button>
    );
}

export default AddToCartButton;