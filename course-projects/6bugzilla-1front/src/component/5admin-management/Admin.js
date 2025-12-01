import React, { useContext, useEffect } from 'react';
import { TitleContext } from '../../contexts/title.context';

function Admin(props) {
    const { setTitle } = useContext(TitleContext);

    useEffect(() => {
        setTitle('Admin Management');
    }, [setTitle]);

    const handleRedirect = (path) => {
        props.history.push(path);
    };

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded text-center">
            <h1 className="display-3 mb-2">Admin Management</h1>
            <div className="mb-3">
                <h2 className="link-like" onClick={() => handleRedirect('/admin/users')}>Users</h2>
                <p>Create new user accounts or edit existing ones. You can also add and remove users from groups (also known as "user privileges").</p>
            </div>
            <div className="mb-3">
                <h2 className="link-like" onClick={() => handleRedirect('/admin/classifications')}>Classification</h2>
                <p>If your installation has to manage many products at once, it's a good idea to group these products into distinct categories. This lets users find information more easily when doing searches or when filing new bugs.</p>
            </div>
            <div className="mb-3">
                <h2 className="link-like" onClick={() => handleRedirect('/admin/products')}>Products</h2>
                <p>Edit all aspects of products, including group restrictions which let you define who can access bugs being in these products. You can also edit some specific attributes of products such as <span className="link-like" onClick={() => handleRedirect('/admin/components')}>components</span>.</p>
            </div>
        </div>
    );
}

export default Admin;