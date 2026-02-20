import React, {useContext, useState, useEffect} from "react";
import {Card, CardBody, CardTitle, CardText, CardImg, ListGroup, ListGroupItem} from "reactstrap";
import classNames from "classnames";
import {Link, withRouter} from "react-router-dom";
import {DispatchContext, UserContext} from "../../../contexts/user.context";
import {API_URL} from "../../../rest/api.rest";
import {AdminUsersContext} from "../../../contexts/admin-users.context";
import {useFetchAdminUserById} from "../../../rest/useRestAdminUsers";
import {getInitialAdminUserState} from "../../../reducers/admin-user.reducer";

const SideBar = ({ isOpen, setSidebarOpen, history }) => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const {adminUsers, reloadFlag} = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState({
        ...getInitialAdminUserState()[0],
        imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
    });
    const [error, setError] = useState(null);
    const [topFollowedUsers, setTopFollowedUsers] = useState([]);
    const fetchAdminUserById = useFetchAdminUserById();

    useEffect(() => {
        // Only call setSidebarOpen when a function was provided (tests may omit it)
        if (typeof setSidebarOpen === 'function') {
            if (loggedUser.isLogged && history.location.pathname !== `/profile/${loggedUser.userId}`) {
                setSidebarOpen(true);
            } else {
                setSidebarOpen(false);
            }
        }
    }, [loggedUser.isLogged, loggedUser.userId, history.location.pathname, setSidebarOpen]);

    useEffect(() => {
        if (!loggedUser.userId) return; // Ensure userId exists before fetching
        fetchAdminUserById(loggedUser.userId)
            .then((fetchedAdminUser) => {
                setAdminUser({
                    ...fetchedAdminUser,
                    imageUrl: fetchedAdminUser.image
                        ? `${API_URL}/${fetchedAdminUser.image}`
                        : 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
                });

                if (fetchedAdminUser.image) {
                    loggedDispatch({
                        type: 'SET_USER',
                        payload: { image: `${fetchedAdminUser.image}` },
                    });
                }

                // Fetch top followed users
                if (fetchedAdminUser.following && fetchedAdminUser.following.length > 0) {
                    const topUsers = fetchedAdminUser.following.slice(0, 3).map(user => ({
                        _id: user._id, // include id so Link targets are correct
                        name: user.name || "Unknown User",
                        imageUrl: user.image
                            ? `${API_URL}/${user.image}`
                            : 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
                    }));
                    setTopFollowedUsers(topUsers);
                }
            })
            .catch((error) => {
                setError(`User could not be fetched: ${error.message}`);
            });
    }, [adminUsers, loggedUser.userId, reloadFlag]);

    return (
        <div className={classNames("sidebar", {"is-open": isOpen})}>
            <div className="side-menu">
                {loggedUser.isLogged && (
                    <>
                        {/* Profile Card */}
                        <Card className="mb-2">
                            <CardImg
                                top
                                src={adminUser.imageUrl}
                                alt="Profile Image"
                                className="profile-image"
                            />
                            <CardBody>
                                <CardTitle
                                    tag="h4"
                                    className="text-center font-weight-bold"
                                    style={{ marginTop: "5px", marginBottom: "5px" }}
                                >
                                    {adminUser.name}
                                </CardTitle>
                                <CardText
                                    className="text-center text-muted"
                                    style={{ marginTop: "5px", marginBottom: "5px" }}
                                >
                                    {adminUser.about || "No about information available"}
                                </CardText>
                                <CardText
                                    className="text-center"
                                    style={{ marginTop: "5px", marginBottom: "5px" }}
                                >
                                    <strong>Location:</strong> {adminUser.location || "Not specified"}
                                </CardText>
                                <CardText
                                    className="text-center"
                                    style={{ marginTop: "5px", marginBottom: "5px" }}
                                >
                                    <strong>Headline:</strong> {adminUser.headline || "No headline available"}
                                </CardText>
                            </CardBody>
                        </Card>

                        {/* Connections Card */}
                        <Card>
                            <CardBody>
                                <CardTitle tag="h5" className="font-weight-bold">
                                    Connections
                                </CardTitle>
                                <ListGroup>
                                    {topFollowedUsers.length > 0 ? (
                                        topFollowedUsers.map((user, index) => (
                                            <ListGroupItem key={index}>
                                                <img
                                                    src={user.imageUrl}
                                                    alt={user.name}
                                                    className="tiny-profile-image rounded-circle me-2"
                                                />
                                                <Link to={`/profile/${user._id}`} className="text-black">
                                                    {user.name}
                                                </Link>
                                            </ListGroupItem>
                                        ))
                                    ) : (
                                        <ListGroupItem>No connections available</ListGroupItem>
                                    )}
                                </ListGroup>
                            </CardBody>
                        </Card>
                    </>
                )}
            </div>
        </div>
    );
};

export default withRouter(SideBar);