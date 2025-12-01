import React, { useContext, useEffect, useState } from "react";
import { AdminUsersContext, DispatchContext } from "../../contexts/admin-users.context";
import UserItem from "./UserItem";
import { withRouter } from "react-router-dom";
import { useDeleteAdminUser, useFetchAdminUsers } from "../../rest/useRestAdminUsers";
import { UserContext } from "../../contexts/user.context";
import { TitleContext } from "../../contexts/title.context";
import { getInitialAdminUserState } from "../../reducers/admin-user.reducer";
import {Alert} from "reactstrap";

function ListUsers(props) {
    const users = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const [adminUsers, setAdminUsers] = useState([]);
    const fetchAdminUsers = useFetchAdminUsers();
    const deleteAdminUser = useDeleteAdminUser();
    const [refreshAdminUsers, setRefreshAdminUsers] = useState(true);
    const loggedUser = useContext(UserContext);
    const { setTitle } = useContext(TitleContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshAdminUsers) {
            setRefreshAdminUsers(false);
            fetchAdminUsers().then(fetchedUsers => {
                dispatch({ type: 'SET_ADMIN_USERS', adminUsers: fetchedUsers });
                const filteredUsers = fetchedUsers.filter(adminUser => adminUser._id !== loggedUser.userId);
                setAdminUsers(filteredUsers);
            }).catch(error => {
                dispatch({ type: 'SET_ADMIN_USERS', adminUsers: [] });
                setAdminUsers([]);
                setError(error.message);
            });
        }

        setTitle('User Management');
    }, [refreshAdminUsers, setTitle]);

    const handleEditUser = (adminUserId) => {
        props.history.push('/admin/edit-user/' + adminUserId);
    }

    const handleDeleteUser = (adminUserId) => {
        deleteAdminUser(adminUserId).then(() => {
            dispatch({ type: 'DELETE_ADMIN_USER', payload: { _id: adminUserId } });
            setError(null);
            setRefreshAdminUsers(true);
        }).catch(error => {
            setError('User could not be deleted: ' + error.message);
        });
    }

    const handleAddUser = () => {
        props.history.push('/admin/add-user');
    }

    const showActionButtons = (adminUser) => {
        return (
            <>
                <button className="btn btn-outline-success me-2" onClick={() => handleEditUser(adminUser._id)}>Edit</button>
                <button className="btn btn-outline-danger me-4" onClick={() => handleDeleteUser(adminUser._id)}>Delete</button>
            </>
        );
    }

    return (
        <div className="container p-5 my-2 mx-auto bg-light border-3 border rounded">
            <h1 className="mb-3 text-center display-3">User Management</h1>
            <div className="mb-3 d-flex justify-content-end">
                <button className="btn btn-outline-secondary" onClick={handleAddUser}>Add User</button>
            </div>
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                adminUsers.length === 0 ? (
                    <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">Sorry...</h4>
                        No users found.
                    </Alert>
                ) : (
                    <div className="list-group">
                        {adminUsers.map(adminUser => (
                            <UserItem
                                key={adminUser._id}
                                adminUser={adminUser}
                                actionButtons={showActionButtons(adminUser)}
                            />
                        ))}
                    </div>
                )
            )}
        </div>
    );
}

export default withRouter(ListUsers);