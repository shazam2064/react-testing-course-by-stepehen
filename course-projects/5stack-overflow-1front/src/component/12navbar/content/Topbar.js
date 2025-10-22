import React, { useContext, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faAlignLeft } from "@fortawesome/free-solid-svg-icons";
import {
    Navbar,
    Button,
    NavbarToggler,
    Collapse,
    Nav,
    NavItem,
    NavLink, DropdownToggle, Dropdown, DropdownMenu, DropdownItem, NavbarBrand,
} from "reactstrap";
import { Link, withRouter } from "react-router-dom";
import { DispatchContext, UserContext } from '../../../contexts/user.context';
import { useDeleteAdminUser } from '../../../rest/useRestAdminUsers';

const Topbar = (props) => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const deleteAdminUser = useDeleteAdminUser();
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = () => {
        loggedDispatch({ type: 'LOGOUT' });
        props.history.push('/login');
    };

    const handleEditUser = () => {
        props.history.push('/admin/edit-user/' + loggedUser.userId);
        setDropdownOpen(false);
    };

    const handleDeleteUser = () => {
        deleteAdminUser(loggedUser.userId).then(() => {
            loggedDispatch({ type: 'LOGOUT' });
            props.history.push('/login');
            setDropdownOpen(false);
        }).catch(error => {
            alert('User could not be deleted: ' + error.message);
            setDropdownOpen(false);
        });
    };

    const handleProfileUser = () => {
        props.history.push('/profile/' + loggedUser.userId);
        setDropdownOpen(false);
    };

    const getSignupLoginButtons = () => {
        if (loggedUser.isLogged) {
            return (
                <>
                    <NavItem className="nav-item">
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                            <DropdownToggle nav caret>
                                {loggedUser.email}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={handleProfileUser}>Profile</DropdownItem>
                                <DropdownItem className="text-primary" onClick={handleEditUser}>Edit</DropdownItem>
                                <DropdownItem className="text-danger" onClick={handleDeleteUser}>Delete</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavItem>
                    <NavItem className="nav-item">
                        <Button color="link" onClick={handleLogout}>Logout</Button>
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

    const getAdminRoutes = () => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <>
                    <NavItem className="nav-item">
                        <NavLink tag={Link} to={"/admin/users"}>
                            Users
                        </NavLink>
                    </NavItem>
                    <NavItem className="nav-item">
                        <NavLink tag={Link} to={"/admin/add-user"}>
                            Add User
                        </NavLink>
                    </NavItem>
                </>
            );
        } else {
            return null;
        }
    }

    const [topbarIsOpen, setTopbarOpen] = useState(true);
    const toggleTopbar = () => setTopbarOpen(!topbarIsOpen);

    return (
        <Navbar
            color="light"
            light
            className="topbar"
            expand="md"
            container="fluid"
            fixed="top"
        >
            <Button color="info" onClick={props.toggleSidebar} className="nav-item">
                <FontAwesomeIcon icon={faAlignLeft} />
            </Button>
            <NavbarBrand href="/" className="navbar-brand">
                <img className="img"
                    src="https://stackoverflow.design/assets/img/logos/so/logo-stackoverflow.svg" alt="Stack Overflow" className="stackoverflow-icon" />
            </NavbarBrand>
            <NavbarToggler onClick={toggleTopbar} />
            <Collapse isOpen={topbarIsOpen} navbar>
                <Nav className="nav" navbar>
                    <div className="d-md-flex flex-row justify-content-center m-md-auto">
                        {getAdminRoutes()}
                    </div>
                    <div className="d-md-flex flex-row justify-content-end ml-md-auto">
                        {getSignupLoginButtons()}
                    </div>
                </Nav>
            </Collapse>
        </Navbar>
    );
};

export default withRouter(Topbar);