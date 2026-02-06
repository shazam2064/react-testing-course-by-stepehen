import React, {useContext, useEffect, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {
    faAlignLeft,
    faBell,
    faBriefcase,
    faHome,
    faMessage,
    faSearch,
    faUsers
} from "@fortawesome/free-solid-svg-icons";
import {
    Navbar,
    Button,
    Nav,
    NavItem,
    NavLink, NavbarBrand, Input, Dropdown, DropdownToggle, DropdownMenu, DropdownItem,
} from "reactstrap";
import {Link, withRouter} from "react-router-dom";
import {DispatchContext, UserContext} from '../../../contexts/user.context';
import { useFetchAdminUserById} from '../../../rest/useRestAdminUsers';
import {API_URL} from "../../../rest/api.rest";
import {AdminUsersContext} from "../../../contexts/admin-users.context";
import {getInitialAdminUserState} from "../../../reducers/admin-user.reducer";
import NotificationIcon from "../../16notifications/NotificationIcon";

const Topbar = (props) => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const [searchTerm, setSearchTerm] = useState('');
    const { adminUsers, reloadFlag } = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState({
        ...getInitialAdminUserState()[0],
        imageUrl: 'https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png',
    });
    const [error, setError] = useState(null);
    const fetchAdminUserById = useFetchAdminUserById();

    useEffect(() => {
        const getAdminUser = async () => {
            try {
                if (!loggedUser.userId) return;
                const fetchedAdminUser = await fetchAdminUserById(loggedUser.userId);
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
            } catch (error) {
                setError(`User could not be fetched: ${error.message}`);
            }
        };

        if (loggedUser.isLogged) {
            getAdminUser();
        }

    }, [adminUsers, loggedUser.userId, reloadFlag]);

    const handleLogout = () => {
        loggedDispatch({ type: 'LOGOUT' });
        props.history.push('/login');
    };

    const handleSearch = () => {
        if (searchTerm && searchTerm.trim() !== '') {
            props.history.push(`/post/${searchTerm}`);
            setSearchTerm('');
        }
    };

    const getSignupLoginButtons = () => {
        if (loggedUser.isLogged) {
            return (
                <>
                    <NavItem className="nav-item">
                        <Button
                            color="link"
                            onClick={handleLogout}
                            className="logout-link"
                        >
                            Logout
                        </Button>
                    </NavItem>
                </>
            );
        } else {
            return (
                <>
                    <NavItem className="nav-item">
                        <NavLink tag={Link} to="/login">Login</NavLink>
                    </NavItem>
                    <NavItem className="nav-item">
                        <NavLink tag={Link} to="/signup">Signup</NavLink>
                    </NavItem>
                </>
            );
        }
    };

    const getAuthorizedRoutes = () => {
        if (loggedUser.isLogged) {
            return (
                <>
                    <NavItem className="mt-0">
                        <NavLink
                            tag={Link}
                            to={`/profile/${adminUser._id}`}
                            activeClassName="active"
                            style={{ display: "flex", alignItems: "center" }}
                        >
                            <img
                                src={adminUser.imageUrl}
                                alt="Profile"
                                className="tiny-profile-image rounded-circle me-2"
                                style={{
                                    width: "30px",
                                    height: "30px",
                                    objectFit: "cover",
                                }}
                            />
                            Profile
                        </NavLink>
                    </NavItem>
                    <NotificationIcon adminUser={adminUser} reloadFlag={reloadFlag}/>
                    <NavItem>
                        <NavLink tag={Link} to={"/messaging"} activeClassName="active">
                            <FontAwesomeIcon icon={faMessage}/>
                            <span className="me-1"></span> Messaging
                        </NavLink>
                    </NavItem>
                </>
            );
        }
        return null;
    };

    const getCommonRoutes = () => {
        return (
            <>
                <NavItem>
                    <NavLink tag={Link} to={"/"} activeClassName="active">
                        <FontAwesomeIcon icon={faHome} />
                        <span className="me-1"></span> Home
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to={"/users"} activeClassName="active">
                        <FontAwesomeIcon icon={faUsers} />
                        <span className="me-1"></span> My Network
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to={"/jobs"} activeClassName="active">
                        <FontAwesomeIcon icon={faBriefcase} />
                        <span className="me-1"></span> Jobs
                    </NavLink>
                </NavItem>
            </>
        );
    };

    return (
        <Navbar
            className="topbar"
            expand="md"
            container="fluid"
            fixed="top"
        >
            <NavbarBrand href="/" className="navbar-brand">
                <img className="img"
                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/c/ca/LinkedIn_logo_initials.png/500px-LinkedIn_logo_initials.png"
                     alt="LinkedIn" />
            </NavbarBrand>
            <Nav className="nav" navbar>
                <div className="d-md-flex flex-row justify-content-start">
                    <NavItem className="d-flex flex-row input-group search-group mx-2">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control search-bar"
                        />
                        <span onClick={handleSearch} className="input-group-text search-icon bg-light">
                            <FontAwesomeIcon icon={faSearch} className="text-info" />
                        </span>
                    </NavItem>
                </div>
                <div onClick={handleSearch} className="d-md-flex flex-row justify-content-center m-md-auto">
                    {getCommonRoutes()}
                    {getAuthorizedRoutes()}
                </div>
                <div onClick={handleSearch} className="d-md-flex flex-row justify-content-end ml-md-auto">
                    {getSignupLoginButtons()}
                </div>
            </Nav>
        </Navbar>
    );
};

export default withRouter(Topbar);