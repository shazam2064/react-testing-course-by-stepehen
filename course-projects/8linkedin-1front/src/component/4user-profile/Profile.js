import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {AdminUsersContext, DispatchContext} from "../../contexts/admin-users.context";
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {useDeleteAdminUser, useFetchAdminUserById, useFollowAdminUser} from "../../rest/useRestAdminUsers";
import {UserContext, DispatchContext as LoggedDispatchContext} from "../../contexts/user.context";
import {
    Accordion, AccordionBody,
    AccordionHeader,
    AccordionItem,
    Card,
    CardBody,
    CardText,
    CardTitle,
    Col,
    List,
    Row
} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {
    faBirthdayCake,
    faBriefcase,
    faEnvelope,
    faJedi,
    faLocation,
    faLocationPin, faMapLocationDot
} from '@fortawesome/free-solid-svg-icons';
import {API_URL} from "../../rest/api.rest";
import PostItem from "../0commons/PostItem";
import ProfileTabs from "./ProfileTabs";
import ErrorModal from "../0commons/ErrorModal";
import {useFetchPosts} from "../../rest/useRestPosts";
import {getInitialPostState} from "../../reducers/posts.reducer";
import ProfileModal from "./ProfileModal";
import {useCreateConnection} from "../../rest/useRestConnections";

function Profile(props) {
    const {adminUsers, triggerReloadGlobal} = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const loggedDispatch = useContext(LoggedDispatchContext);
    const [adminUser, setAdminUser] = useState(getInitialAdminUserState()[0]);
    const [likedPosts, setLikedPosts] = useState(getInitialPostState());
    const [error, setError] = useState(null);
    const [view, setView] = useState('posts');
    const fetchAdminUserById = useFetchAdminUserById();
    const deleteAdminUser = useDeleteAdminUser();
    const followAdminUser = useFollowAdminUser();
    const createConnection = useCreateConnection();
    const fetchPosts = useFetchPosts()
    const {userId} = props.match.params;
    const prevUserId = useRef(userId);
    const loggedUser = useContext(UserContext);
    const [reload, setReload] = useState(true);
    const isCreator = adminUser._id === loggedUser.userId;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialTab, setInitialTab] = useState('1');
    const [openExperience, setOpenExperience] = useState('');
    const [openEducation, setOpenEducation] = useState('');
    // guard against undefined arrays during initial render/tests
    const connections = adminUser.connections || [];
    const followers = adminUser.followers || [];
    const following = adminUser.following || [];

    const hasConnection = connections.some(
        connection => connection.sender && connection.sender._id === loggedUser.userId
    );
    const isFollower = followers.some(follower => follower && follower._id === loggedUser.userId);
    const isPending = hasConnection && connections.some(connection => connection && connection.status === 'pending');


    const toggleExperience = (id) => {
        setOpenExperience(openExperience === id ? '' : id);
    };

    const toggleEducation = (id) => {
        setOpenEducation(openEducation === id ? '' : id);
    };

    useEffect(() => {
        const fetchAdminUser = async () => {
            try {
                const fetchedAdminUser = await fetchAdminUserById(userId);
                setAdminUser({
                    ...fetchedAdminUser,
                    imageUrl: fetchedAdminUser.image
                        ? `${API_URL}/${fetchedAdminUser.image}`
                        : 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
                });
            } catch (error) {
                setError(`User could not be fetched: ${error.message}`);
            }
        }

        const getPosts = async () => {
            try {
                const posts = await fetchPosts();
                const likedPosts = posts.filter(post => post.likes.includes(userId));
                setLikedPosts(likedPosts);
                setReload(false);
                setError(null);
            } catch (error) {
                setError('Posts could not be retrieved: ' + error.message);
            }
        }

        if (reload || prevUserId.current !== userId) {
            fetchAdminUser();
            getPosts();
            setReload(false);
            setIsModalOpen(false);
            prevUserId.current = userId; // Update the previous userId
        }

    }, [userId, reload]);

    const triggerReload = () => {
        setReload(true);
        // triggerReloadGlobal();
    }

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    }

    const handleEditUser = (adminUserId) => {
        props.history.push('/admin/edit-user/' + adminUserId);
    }

    const handleDeleteUser = (adminUserId) => {
        deleteAdminUser(adminUserId).then(() => {
            dispatch({type: 'DELETE_ADMIN_USER', payload: {_id: adminUserId}});
            if (adminUserId === loggedUser.userId) {
                console.log('User logged out');
                loggedDispatch({type: 'LOGOUT'});
                props.history.push('/login');
            }
            setError(null);
            triggerReload()
        }).catch(error => {
            setError('User could not be deleted: ' + error.message);
        });
    }

    const handleFollowUser = (adminUserId) => {
        followAdminUser(adminUserId).then(() => {
            setError(null);
            triggerReload()
        }).catch(error => {
            setError('User could not be unfollowed: ' + error.message);
        });
    }

    const handleCreateFollowRequest = (adminUserId) => {
        createConnection(adminUserId).then(() => {
            setError(null);
            triggerReload();
        }).catch(error => {
            setError('Connection request could not be created: ' + error.message);
        });
    }

    const showActionButtons = (adminUser) => {
        return (
            <>
                {/* All if user is logged */}
                {loggedUser.isLogged && (
                    <>
                        {/* If admin or creator, show edit and delete buttons */}
                        {(loggedUser.isAdmin || isCreator) && (
                            <>
                                <button
                                    className="btn btn-outline-secondary btn-outline me-2"
                                    onClick={() => handleEditUser(adminUser._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-outline-danger btn-outline me-4"
                                    onClick={() => handleDeleteUser(adminUser._id)}
                                >
                                    Delete
                                </button>
                            </>
                        )}

                        {/* If not creator, show request/unfollow button */}
                        {!isCreator && (
                            <button
                                className={`btn ${isPending ? 'btn-secondary' : isFollower ? 'btn-danger' : 'btn-primary'} rounded-pill text-light me-4`}
                                onClick={() => {
                                    if (!hasConnection && !isFollower) {
                                        handleCreateFollowRequest(adminUser._id);
                                    } else if (isFollower) {
                                        handleFollowUser(adminUser._id);
                                    }
                                }}
                                disabled={isPending}
                            >
                                {isPending
                                    ? 'Request Sent'
                                    : isFollower
                                        ? 'Unfollow'
                                        : 'Request Follow'}
                            </button>
                        )}
                    </>
                )}
            </>
        );
    }

    return (
        <div className="container container-fluid mb-4">
            {error && <ErrorModal error={error}/>}
            <Card className="mb-4">
                <CardBody>
                    <Row className="d-flex mb-4">
                        <Col sm={2} className="d-flex justify-content-center">
                            <img
                                src={adminUser.imageUrl}
                                alt="Profile"
                                className="profile-image"
                            />
                        </Col>
                        <Col sm={8} className="d-flex flex-column justify-content-start pt-4">
                            <CardTitle tag="h2"
                                       className="text-decoration-underline text-primary mb-0">{adminUser.name}</CardTitle>
                            <CardText className="fs-5 mb-2">@{adminUser.email}</CardText>
                            <Col className="d-flex align-items-center text-muted gap-2 mb-0">
                                <FontAwesomeIcon icon={faBriefcase}/>
                                Headline: {adminUser.headline ? adminUser.headline : "Not provided"}
                            </Col>
                            <Col className="d-flex align-items-center text-muted gap-2 ">
                                <FontAwesomeIcon icon={faMapLocationDot}/>
                                Location: {adminUser.location ? adminUser.location : "Not provided"}
                            </Col>
                        </Col>
                        <Col sm={2} className="d-flex justify-content-end align-items-center pb-5">
                            {showActionButtons(adminUser)}
                        </Col>
                    </Row>
                    <footer>
                        <Row className="d-flex align-items-center justify-content-between">
                            <Col className="d-flex mx-3 align-items-center">
                                <CardText className="mb-0">{adminUser.about}</CardText>
                            </Col>
                            <Col className="d-flex justify-content-end me-5">
                                <List type="unstyled" className="d-flex flex-row">
                                    <li>
                                        <button
                                            className="btn btn-link text-muted mb-0 d-flex d-inline-flex p-0"
                                            onClick={() => {
                                                toggleModal();
                                                setInitialTab('1'); // Show Followers tab
                                            }}
                                        >
                                            Followers: <strong>{followers.length}</strong>
                                        </button>
                                    </li>
                                    <span className="mx-2"></span>
                                    <li>
                                        <button
                                            className="btn btn-link text-muted mb-0 d-flex d-inline-flex p-0"
                                            onClick={() => {
                                                toggleModal();
                                                setInitialTab('2'); // Show Following tab
                                            }}
                                        >
                                            Following: <strong>{following.length}</strong>
                                        </button>
                                    </li>
                                </List>
                            </Col>
                        </Row>
                    </footer>
                </CardBody>
            </Card>
            {/* Experience Section */}
            <Card className="mb-4">
                <CardBody>
                    <CardTitle tag="h4">Experience</CardTitle>
                    {adminUser.experience && adminUser.experience.length > 0 ? (
                        <Accordion className="custom-border" open={openExperience} toggle={toggleExperience}>
                            {adminUser.experience.map((exp, index) => (
                                <AccordionItem key={index}>
                                    <AccordionHeader targetId={String(index)}>
                                        <p className="text-secondary mb-0">{exp.company} - {exp.role}</p>
                                    </AccordionHeader>
                                    <AccordionBody accordionId={String(index)}>
                                        <p><p className="text-muted d-inline-flex mb-0">Start Date:</p> {exp.startDate}
                                        </p>
                                        <p><p className="text-muted d-inline-flex mb-0">End Date:</p> {exp.endDate}</p>
                                        <p><p
                                            className="text-muted d-inline-flex mb-0">Description:</p> {exp.description}
                                        </p>
                                    </AccordionBody>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <CardText className="text-muted">No experience added yet.</CardText>
                    )}
                </CardBody>
            </Card>
            {/* Education Section */}
            <Card className="mb-4">
                <CardBody>
                    <CardTitle tag="h4">Education</CardTitle>
                    {adminUser.education && adminUser.education.length > 0 ? (
                        <Accordion className="custom-border" open={openEducation} toggle={toggleEducation}>
                            {adminUser.education.map((edu, index) => (
                                <AccordionItem key={index}>
                                    <AccordionHeader targetId={String(index)}>
                                        <p className="text-secondary mb-0">{edu.school} - {edu.degree}</p>
                                    </AccordionHeader>
                                    <AccordionBody accordionId={String(index)}>
                                        <p><p className="text-muted d-inline-flex mb-0">Field of Study:</p> {edu.fieldOfStudy}</p>
                                        <p><p className="text-muted d-inline-flex mb-0">Start Date:</p> {edu.startDate}</p>
                                        <p><p className="text-muted d-inline-flex mb-0">End Date:</p> {edu.endDate}</p>
                                    </AccordionBody>
                                </AccordionItem>
                            ))}
                        </Accordion>
                    ) : (
                        <CardText className="text-muted">No education added yet.</CardText>
                    )}
                </CardBody>
            </Card>
            {/* Skills Section */}
            <Card className="mb-4">
                <CardBody>
                    <CardTitle tag="h4">Skills</CardTitle>
                    {adminUser.skills && adminUser.skills.length > 0 ? (
                        <ul className="list-unstyled d-flex flex-wrap gap-2">
                            {adminUser.skills.map((skill, index) => (
                                <li key={index}>
                                    <span className="d-flex text-info align-items-center border border-info rounded px-2 py-1">
                                        {skill}
                                    </span>
                                </li>
                            ))}
                        </ul>
                    ) : (
                        <CardText className="text-muted">No skills added yet.</CardText>
                    )}
                </CardBody>
            </Card>
            {/* Posts Section */}
            <Card className="mb-4">
                <ProfileTabs
                    adminUser={adminUser}
                    likedPosts={likedPosts}
                    setError={setError}
                    triggerReload={triggerReload}
                    props={props}
                />
            </Card>
            <ProfileModal
                isOpen={isModalOpen}
                toggle={toggleModal}
                adminUser={adminUser}
                initialTab={initialTab}
            />
        </div>
    );
}

export default withRouter(Profile);