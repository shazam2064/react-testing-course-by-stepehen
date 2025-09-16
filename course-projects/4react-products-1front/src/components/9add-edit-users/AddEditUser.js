import React, { useState, useEffect, useContext } from 'react';
import { withRouter } from 'react-router-dom';
import {AdminUsersContext} from "../../contexts/admin-users.context";
import {useCreateAdminUser, useFetchAdminUserById, useUpdateAdminUser} from '../../rest/useRestAdminUsers';
import { UserContext } from '../../contexts/user.context';
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {Alert, Form, FormGroup, Toast, ToastBody, ToastHeader} from "reactstrap";

function AddEditUser(props) {
    const adminUsers = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState(getInitialAdminUserState());
    const [error, setError] = useState(null);
    const createAdminUser = useCreateAdminUser();
    const updateAdminUser = useUpdateAdminUser();
    const fetchAdminUserById = useFetchAdminUserById();
    const {adminUserId} = props.match.params;
    const isEditMode = !!adminUserId;
    const loggedUser = useContext(UserContext) || {};
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchAdminUserById(adminUserId).then(adminUser => {
                setAdminUser(adminUser);
                console.log('user: ' + adminUser);
            }).catch(error => {
                setError(`User could not be fetched: ${error.message}`);
            });
        } else {
            setAdminUser(getInitialAdminUserState());
        }
    }, [adminUserId, isEditMode]);

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target;
        setAdminUser(prevState => ({
            ...prevState,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            if (isEditMode) {
                await updateAdminUser(adminUser);
            } else {
                await createAdminUser(adminUser);
            }
            setError(null);
            props.history.push('/admin/users');
        } catch (error) {
            setError(`User could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    if (!loggedUser.isAdmin) {
        return <div className="container p-s5 my-4 col-8 offset-2">
            <Alert color="warning">
                <h4 className="alert-heading">
                    Unauthorized!
                </h4>
                <p>
                    Hey, you are not authorized to view this page.
                </p>
                <hr />
                <p className="mb-0">
                    Go <a
                    className="alert-link"
                    onClick={() => props.history.push('/')}>
                    back
                </a>.
                </p>
            </Alert>
        </div>;
    }

    return (
        <div className="container p-s5 my-4 col-6 offset-3">
        <h1 className="mb-3 text-center display-3">{isEditMode ? 'Edit User' : 'Add User'}</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit} method="Post">
                <FormGroup>
                    <label htmlFor="name">Name</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        className="form-control"
                        onChange={handleChange}
                        value={adminUser.name}
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="email">Email</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        className="form-control"
                        onChange={handleChange}
                        value={adminUser.email}
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="password">Password</label>
                    <input
                        type="password"
                        id="password"
                        name="password"
                        className="form-control"
                        onChange={handleChange}
                        value={adminUser.password}
                        required={!isEditMode}
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="status">Status</label>
                    <input
                        type="text"
                        id="status"
                        name="status"
                        className="form-control"
                        onChange={handleChange}
                        value={adminUser.status}
                    />
                </FormGroup>
                <FormGroup className="custom-control custom-checkbox d-flex align-items-center justify-content-center">
                    <input
                        type="checkbox"
                        id="isAdmin"
                        name="isAdmin"
                        className="custom-control-input"
                        onChange={handleChange}
                        checked={adminUser.isAdmin}
                    />
                    <label className="custom-control-label" htmlFor="isAdmin">Admin</label>
                </FormGroup>
                <div className="d-flex align-items-center justify-content-center">
                    <button className="btn btn-outline-success mb-3">{isEditMode ? 'Update User' : 'Add User'}</button>
                </div>
            </Form>
        </div>
    );
}

export default withRouter(AddEditUser);