import React, {useContext, useEffect, useState} from "react";
import {AdminUsersContext, DispatchContext} from "../../contexts/admin-users.context";
import UserItem from "./UserItem";
import {withRouter} from "react-router-dom";
import {useDeleteAdminUser, useFetchAdminUsers} from "../../rest/useRestAdminUsers";
import {UserContext} from "../../contexts/user.context";
import {Alert, Button, Card, Col, FormGroup, Input, Label, Row} from "reactstrap";
import {faHashtag, faSearch} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";

function ListUsers(props) {
    const {adminUsers} = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchAdminUsers = useFetchAdminUsers();
    const deleteAdminUser = useDeleteAdminUser();
    const [refreshAdminUsers, setRefreshAdminUsers] = useState(true);
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        const getAdminUsers = async () => {
            try {
                const adminUsers = await fetchAdminUsers();
                const filteredUsers = adminUsers.filter(adminUser => adminUser._id !== loggedUser.userId);
                dispatch({type: 'SET_ADMIN_USERS', adminUsers: filteredUsers});
                console.log('adminUsers', filteredUsers);
                setRefreshAdminUsers(false);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_ADMIN_USERS', adminUsers: []});
                setError('Admin users could not be retrieved.');
            }
        }

        if (refreshAdminUsers) {
            getAdminUsers();
            setRefreshAdminUsers(false);
        }
    }, [dispatch, refreshAdminUsers]);

    const handleEditUser = (adminUserId) => {
        props.history.push('/admin/edit-user/' + adminUserId);
    }

    const handleDeleteUser = (adminUserId) => {
        deleteAdminUser(adminUserId).then(() => {
            dispatch({type: 'DELETE_ADMIN_USER', payload: {_id: adminUserId}});
            setError(null);
            setRefreshAdminUsers(true);
        }).catch(error => {
            setError('User could not be deleted: ' + error.message);
        });
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const filteredAdminUsers = adminUsers
        .filter(adminUser => adminUser.name.toLowerCase().includes(searchTerm.toLowerCase()) || adminUser.email.toLowerCase().includes(searchTerm.toLowerCase()))

    const showActionButtons = (adminUser) => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <>
                    <button className="btn btn-outline-secondary btn-outline me-2"
                            onClick={() => handleEditUser(adminUser._id)}>Edit
                    </button>
                    <button className="btn btn-outline-danger btn-outline me-4"
                            onClick={() => handleDeleteUser(adminUser._id)}>Delete
                    </button>
                </>
            );
        } else {
            return null;
        }
    }

    const AddUserButton = () => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <Col >
                    <div className="text-right d-flex justify-content-end">
                        <Button
                            color="outline-primary"
                            className="rounded-pill w-50 btn-outline"
                            onClick={() => props.history.push('/admin/add-user')}>
                            Add User
                        </Button>
                    </div>
                </Col>


            );
        }
    }

    return (
        <Card className="container p-s5 mx-auto py-4 px-4">
            <h1 className="mb-3 display-3">Users</h1>
            <Row>
                <Col md={10} className="mb-4 d-flex flex-row input-group search-group mx-2">
                    <FormGroup className="search-group">
                        <Label for="searchUsers" hidden>Search</Label>
                        <div className="d-flex flex-row input-group search-group mx-2">
                            <Input
                                type="text"
                                id="searchUsers"
                                placeholder="Search users..."
                                value={searchTerm}
                                className="form-control search-bar"
                                onChange={handleSearchChange}
                            />
                            <span className="btn-block btn bg-light border-secondary-subtle">
                                <FontAwesomeIcon icon={faSearch} className="text-info"/>
                            </span>
                        </div>
                    </FormGroup>
                </Col>
                    {AddUserButton()}
            </Row>
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
                    <Row>
                        <Col>
                            <div className="list-group">
                                {filteredAdminUsers.map(adminUser => (
                                    <UserItem
                                        key={adminUser._id}
                                        adminUser={adminUser}
                                        actionButtons={showActionButtons(adminUser)}
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                )
            )}
        </Card>
    );
}

export default withRouter(ListUsers);