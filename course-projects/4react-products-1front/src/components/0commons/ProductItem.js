import React, { memo } from 'react';
import { withRouter } from 'react-router-dom';
import { API_URL } from '../../rest/api.rest';

const ProductItem = memo(function ProductItem({ product, history, actionButtons }) {
    return (
        <div key={product._id}>
            <article className="card">
                <header className="card-header text-center">
                    <h1 className="h5">
                        {product.name}
                    </h1>
                </header>
                <div className="card-img-top">
                    <img src={`${API_URL}/${product.imageUrl}`}
                         alt={product.imageUrl}
                         className="img-fluid"
                    />
                </div>
                <div className="card-body text-center">
                    <h2 className="h6 text-muted">$
                        {product.price}
                    </h2>
                    <p className="card-text">
                        {product.description}
                    </p>
                </div>
                <div className="card-footer d-flex justify-content-around">
                    {actionButtons}
                </div>
            </article>
        </div>
    );
});

export default withRouter(ProductItem);