import React, {useContext, useEffect, useRef, useState} from 'react';
import {Link, withRouter} from 'react-router-dom';
import {AdminUsersContext, DispatchContext} from "../../contexts/admin-users.context";
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {useDeleteAdminUser, useFetchAdminUserById, useFollowAdminUser} from "../../rest/useRestAdminUsers";
import {UserContext, DispatchContext as LoggedDispatchContext} from "../../contexts/user.context";
import {Card, CardBody, CardText, CardTitle, Col, List, Row} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBirthdayCake, faEnvelope} from '@fortawesome/free-solid-svg-icons';
import {API_URL} from "../../rest/api.rest";
import TweetItem from "../0commons/TweetItem";
import ProfileTabs from "./ProfileTabs";
import ErrorModal from "../0commons/ErrorModal";
import {useFetchTweets} from "../../rest/useRestTweets";
import {getInitialTweetState} from "../../reducers/tweets.reducer";
import ProfileModal from "./ProfileModal";

function Profile(props) {
    const {adminUsers} = useContext(AdminUsersContext);
    const dispatch = useContext(DispatchContext);
    const loggedDispatch = useContext(LoggedDispatchContext);
    const [adminUser, setAdminUser] = useState(getInitialAdminUserState()[0]);
    const [likedTweets, setLikedTweets] = useState(getInitialTweetState());
    const [retweetedTweets, setRetweetedTweets] = useState(getInitialTweetState());
    const [error, setError] = useState(null);
    const [view, setView] = useState('tweets');
    const fetchAdminUserById = useFetchAdminUserById();
    const deleteAdminUser = useDeleteAdminUser();
    const followAdminUser = useFollowAdminUser();
    const fetchTweets = useFetchTweets()
    const {userId} = props.match.params;
    const prevUserId = useRef(userId);
    const loggedUser = useContext(UserContext);
    const [reload, setReload] = useState(true);
    const isCreator = adminUser._id === loggedUser.userId;
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [initialTab, setInitialTab] = useState('1');

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

        const getTweets = async () => {
            try {
                const tweets = await fetchTweets();
                const likedTweets = tweets.filter(tweet => tweet.likes.includes(userId));
                const retweetedTweets = tweets.filter(tweet => tweet.retweets.includes(userId));
                setLikedTweets(likedTweets);
                setRetweetedTweets(retweetedTweets);
                setReload(false);
                setError(null);
            } catch (error) {
                setError('Tweets could not be retrieved: ' + error.message);
            }
        }

        if (reload || prevUserId.current !== userId) {
            fetchAdminUser();
            getTweets();
            setReload(false);
            setIsModalOpen(false);
            prevUserId.current = userId; // Update the previous userId
        }

    }, [userId, reload]);

    const triggerReload = () => {
        setReload(true);
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
            setError('User could not be followed/unfollowed: ' + error.message);
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
                                    className="btn btn-outline-secondary me-2"
                                    onClick={() => handleEditUser(adminUser._id)}
                                >
                                    Edit
                                </button>
                                <button
                                    className="btn btn-outline-danger me-4"
                                    onClick={() => handleDeleteUser(adminUser._id)}
                                >
                                    Delete
                                </button>
                            </>
                        )}

                        {/* If not creator, show follow/unfollow button */}
                        {!isCreator && (
                            <button
                                className="btn btn-primary rounded-pill text-light me-4"
                                onClick={() => handleFollowUser(adminUser._id)}
                            >
                                {adminUser.followers.some(follower => follower._id === loggedUser.userId) ? 'Unfollow' : 'Follow'}
                            </button>
                        )}
                    </>
                )}
            </>
        );
    }

    const memberSince = new Date(adminUser.createdAt).toLocaleDateString();

    return (
        <div className="container container-fluid">
            {error && <ErrorModal error={error}/>}
            <Card className="mb-4">
                <CardBody>
                    <Row className="d-flex mb-4">
                        <Col sm={2} className="d-flex justify-content-center">
                            <img
                                src={adminUser.imageUrl}
                                alt="Profile"
                                style={{
                                    width: '150px',
                                    height: '150px',
                                    borderRadius: '50%',
                                    objectFit: 'cover'
                                }}
                            />
                        </Col>
                        <Col sm={8} className="d-flex flex-column justify-content-start pt-5">
                            <CardTitle tag="h2">{adminUser.name}</CardTitle>
                            <CardText className="text-muted fs-6">@{adminUser.email}</CardText>
                        </Col>
                        <Col sm={2} className="d-flex justify-content-end align-items-center pb-5">
                            {showActionButtons(adminUser)}
                        </Col>
                    </Row>
                    <Col sm={8} className="mb-1">
                        <CardText className="text-muted">
                            <FontAwesomeIcon icon={faBirthdayCake}/> Member since: {memberSince}
                        </CardText>
                    </Col>
                    <footer>
                        <Row>
                            <List type="unstyled" className="d-flex flex-row">
                                <li>
                                    <button
                                        className="btn btn-link text-muted mb-0 d-flex d-inline-flex p-0"
                                        onClick={() => {
                                            toggleModal();
                                            setInitialTab('1'); // Show Followers tab
                                        }}
                                    >
                                        Followers: <strong>{adminUser.followers.length}</strong>
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
                                        Following: <strong> {adminUser.following.length}</strong>
                                    </button>
                                </li>
                            </List>
                        </Row>
                    </footer>
                </CardBody>
            </Card>
            <Card>
                <ProfileTabs
                    adminUser={adminUser}
                    likedTweets={likedTweets}
                    retweetedTweets={retweetedTweets}
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