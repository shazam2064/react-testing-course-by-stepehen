import React, {useState, useEffect, useContext} from 'react';
import {withRouter} from 'react-router-dom';
import {AdminUsersContext, DispatchContext} from "../../contexts/admin-users.context";
import {
    useCreateAdminUser,
    useFetchAdminUserById,
    useUpdateAdminUser
} from '../../rest/useRestAdminUsers';
import {UserContext} from '../../contexts/user.context';
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {Alert, Col, Form, FormGroup, FormText, Input, Label, Row} from "reactstrap";
import {API_URL} from "../../rest/api.rest";

function AddEditUser(props) {
    const { triggerReload } = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const [adminUser, setAdminUser] = useState({
        ...getInitialAdminUserState()[0],
        imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
    });
    const [error, setError] = useState(null);
    const createAdminUser = useCreateAdminUser();
    const updateAdminUser = useUpdateAdminUser();
    const fetchAdminUserById = useFetchAdminUserById();
    const {adminUserId} = props.match.params;
    const isEditMode = !!adminUserId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const isCreator = adminUser._id === loggedUser.userId;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchAdminUserById(adminUserId).then(adminUser => {
                setAdminUser({
                    ...adminUser,
                    imageUrl: adminUser.image ? `${API_URL}/${adminUser.image}` : 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
                });
                console.log('user: ' + adminUser);
            }).catch(error => {
                setError(`User could not be fetched: ${error.message}`);
            });
        } else {
            setAdminUser({
                ...getInitialAdminUserState()[0],
                imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png'
            });
        }
    }, [adminUserId, isEditMode]);

    const handleChange = (e) => {
        const {name, value, type, checked, files} = e.target;
        if (name === 'image' && files.length > 0) {
            const file = files[0];
            setAdminUser(prevState => ({
                ...prevState,
                imageFile: file,
                imageUrl: URL.createObjectURL(file) // For preview purposes
            }));
        } else {
            setAdminUser(prevState => ({
                ...prevState,
                [name]: type === 'checkbox' ? checked : value
            }));
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        try {
            let savedUser;
            if (isEditMode) {
                await updateAdminUser(adminUser);
                savedUser = adminUser;
            } else {
                savedUser = await createAdminUser(adminUser);
            }
            if (loggedUser.userId === adminUser._id) {
                triggerReload();
                console.log('trigger from the handle submit');
            }
            setError(null);
            props.history.push(`/profile/${isEditMode ? adminUserId : savedUser._id}`);
        } catch (error) {
            setError(`User could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    if (!isAdmin) {
        if (!isCreator) {
            return <div className="container p-s5 my-4 col-8 mx-auto">
                <Alert color="warning">
                    <h4 className="alert-heading">
                        Unauthorized!
                    </h4>
                    <p>
                        Hey, you are not authorized to view this page.
                    </p>
                    <hr/>
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
    }

    return (
        <section className="container p-s5 my-4 col-6 mx-auto">
            <h1 className="mb-3 text-center display-3">{isEditMode ? 'Edit User' : 'Add User'}</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit} method="Post">
                <Col>
                    <Row>
                        <Col xs="2">
                            <img
                                src={adminUser.imageUrl}
                                alt="Profile Picture"
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Col>
                        <Col xs="9">
                            <FormGroup>
                                <Label for="image">
                                    Profile Picture
                                </Label>
                                <Input
                                    type="file"
                                    id="image"
                                    name="image"
                                    onChange={handleChange}
                                />
                                {/* Hidden input to retain the old image URL */}
                                {isEditMode && adminUser.image && (
                                    <input
                                        type="hidden"
                                        name="existingImage"
                                        value={adminUser.image}
                                    />
                                )}
                                <FormText>
                                    If no profile picture is uploaded, a default image will be used.
                                </FormText>
                            </FormGroup>
                        </Col>
                    </Row>
                </Col>
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
                {isAdmin && (
                    <FormGroup
                        className="custom-control custom-checkbox d-flex justify-content-center">
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
                )}
                <div className="d-flex align-items-center justify-content-center">
                    <button
                        className="btn btn-outline-secondary mb-3">{isEditMode ? 'Update User' : 'Add User'}</button>
                </div>
            </Form>
        </section>
    );
}

export default withRouter(AddEditUser);