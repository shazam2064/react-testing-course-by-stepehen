import React from 'react';
import ListProducts from "./0commons/ListProducts";

function Shop(props) {
    return (
        <div className="container mt-2">
            <h1 className="mb-3 text-center display-3">Shop</h1>
            <div className="d-flex align-items-center">
                <ListProducts adminProducts={false}/>
            </div>
        </div>
    );
}

export default Shop;