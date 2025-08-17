import React, { memo } from 'react';

function CartItem(props) {
    const { prodId, cartItem, quantity, handleDeleteProduct } = props;

    const getCartItem = () => {
        if (!prodId || !cartItem || !quantity) {
            return <p>No product found with id: {prodId}</p>;
        }

        const handleDelete = () => {
            console.log(`Deleting product with id: ${prodId}`);
            handleDeleteProduct(prodId);
        };

        return (
            <li className="list-group-item d-flex justify-content-between align-items-center my-1 border-2 rounded-3">
                <div>
                    <h5>{cartItem.name}</h5>
                    <p>${cartItem.price} ({quantity})</p>
                    <input type="hidden" name="productId" value={cartItem.id}/>
                </div>
                <button className="btn btn-outline-danger" onClick={handleDelete}>Delete</button>
            </li>
        );
    };

    return (
        <div>
            {getCartItem()}
        </div>
    );
}

export default memo(CartItem);