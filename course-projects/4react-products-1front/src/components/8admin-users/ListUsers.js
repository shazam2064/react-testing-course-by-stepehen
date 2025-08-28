import React, { useContext, useEffect, useState } from "react";
import { AdminUsersContext, DispatchContext } from "../../contexts/admin-users.context";
import UserItem from "./UserItem";
import { useNavigate } from "react-router-dom";
import { useDeleteAdminUser, useFetchAdminUsers } from "../../rest/useRestAdminUsers";
import { UserContext } from "../../contexts/user.context";
import { Alert } from "reactstrap";

function ListUsers() {
    const adminUsers = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchAdminUsers = useFetchAdminUsers();
    const deleteAdminUser = useDeleteAdminUser();
    const [refreshAdminUsers, setRefreshAdminUsers] = useState(true);
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);
    const navigate = useNavigate();

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshAdminUsers) {
            setRefreshAdminUsers(false);
            fetchAdminUsers().then(adminUsers => {
                const filteredUsers = adminUsers.filter(adminUser => adminUser._id !== loggedUser.userId);
                console.log('filtered users: ' + filteredUsers);
                dispatch({ type: 'SET_ADMIN_USERS', adminUsers: filteredUsers });
            }).catch(error => {
                dispatch({ type: 'SET_USERS', adminUsers: [] });
                setError(error.message);
            });
        }
    }, [refreshAdminUsers]);

    const handleEditUser = (adminUserId) => {
        navigate('/admin/edit-user/' + adminUserId);
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

    const showActionButtons = (adminUser) => {
        return (
            <>
                <button className="btn btn-outline-primary me-2" onClick={() => handleEditUser(adminUser._id)}>Edit</button>
                <button className="btn btn-outline-danger me-4" onClick={() => handleDeleteUser(adminUser._id)}>Delete</button>
            </>
        );
    }

    return (
        <section className="container my-4">
            <h1 className="mb-3 text-center display-3">User Management</h1>
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
        </section>
    );
}

export default ListUsers;