import React, { useContext, useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {faHome, faHashtag, faUsers} from "@fortawesome/free-solid-svg-icons";
import { NavItem, NavLink, Nav, Button } from "reactstrap";
import classNames from "classnames";
import { Link, withRouter } from "react-router-dom";
import {DispatchContext, UserContext} from "../../../contexts/user.context";
import { API_URL } from "../../../rest/api.rest";
import AddEditTweet from "../../8add-edit-tweets/AddEditTweet";
import { AdminUsersContext } from "../../../contexts/admin-users.context";
import { useFetchAdminUserById } from "../../../rest/useRestAdminUsers";
import { getInitialAdminUserState } from "../../../reducers/admin-user.reducer";

const SideBar = ({ isOpen, history }) => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const { adminUsers, reloadFlag } = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState({
        ...getInitialAdminUserState()[0],
        imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
    });
    const [error, setError] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const fetchAdminUserById = useFetchAdminUserById();

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
            })
            .catch((error) => {
                setError(`User could not be fetched: ${error.message}`);
            });
    }, [adminUsers, loggedUser.userId, reloadFlag]);

    const toggleModal = () => {
        console.log(`${adminUser.imageUrl}`);
        setIsModalOpen(!isModalOpen);
    };

    return (
        <div className={classNames("sidebar", { "is-open": isOpen })}>
            <div className="side-menu">
                <Nav vertical justified className="nav">
                    <NavItem>
                        <NavLink tag={Link} to={"/"} activeClassName="active">
                            <FontAwesomeIcon icon={faHome} />
                            <span className="me-1"></span> Home
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink tag={Link} to={"/tweets"} activeClassName="active">
                            <FontAwesomeIcon icon={faHashtag} />
                            <span className="me-1"></span> Explore
                        </NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink tag={Link} to={"/users"} activeClassName="active">
                            <FontAwesomeIcon icon={faUsers} />
                            <span className="me-1"></span> Users
                        </NavLink>
                    </NavItem>
                    {loggedUser.isLogged && (
                        <>
                            <NavItem className="mt-0">
                                <NavLink tag={Link} to={`/profile/${adminUser._id}`} activeClassName="active">
                                    <img
                                        src={adminUser.imageUrl}
                                        alt="Profile"
                                        className="rounded-circle me-1"
                                        style={{ width: "30px", height: "30px" }}
                                    />
                                    Profile
                                </NavLink>
                            </NavItem>
                            <NavItem className="mt-3">
                                <Button
                                    color="primary"
                                    className="rounded-pill w-100 text-light"
                                    onClick={toggleModal}
                                >
                                    Tweet
                                </Button>
                            </NavItem>
                        </>
                    )}
                </Nav>
            </div>
            <AddEditTweet isOpen={isModalOpen} toggle={toggleModal} tweetId={null} />
        </div>
    );
};

export default withRouter(SideBar);