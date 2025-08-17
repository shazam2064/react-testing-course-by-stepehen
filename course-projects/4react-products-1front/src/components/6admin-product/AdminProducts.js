import React, { useContext } from 'react';
import ListProducts from "../0commons/ListProducts";
import { UserContext } from '../../contexts/user.context';

function AdminProducts(props) {
    const loggedUser = useContext(UserContext);

    if (!loggedUser.isAdmin) {
        return <p>Access denied. Admins only.</p>;
    }

    return (
        <div className="container mt-2">
            <h1 className="mb-3 text-center display-3">Admin Products</h1>
            <div className="d-flex align-items-center">
                <ListProducts adminProducts={true}/>
            </div>
        </div>
    );
}

export default AdminProducts;