import React, {useContext, useState} from 'react';
import {TitleContext} from '../contexts/title.context';
import {NavLink, withRouter} from 'react-router-dom';
import {
    Navbar,
    NavbarBrand,
    NavbarToggler,
    Collapse,
    Nav,
    NavItem,
    NavLink as ReactstrapNavLink,
    UncontrolledDropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
    Button,
    Input, Dropdown
} from 'reactstrap';
import {DispatchContext, UserContext} from '../contexts/user.context';
import {useDeleteAdminUser} from '../rest/useRestAdminUsers';

function CustomNavbar(props) {
    const {title} = useContext(TitleContext);
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const [isOpen, setIsOpen] = useState(false);
    const deleteAdminUser = useDeleteAdminUser();
    const [searchTerm, setSearchTerm] = useState('');
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);

    const toggleDropdown = () => setDropdownOpen((prevState) => !prevState);

    const handleLogout = () => {
        loggedDispatch({type: 'LOGOUT'});
        props.history.push('/login');
    };

    const handleEditUser = () => {
        props.history.push('/admin/edit-user/' + loggedUser.userId);
    };

    const handleDeleteUser = () => {
        deleteAdminUser(loggedUser.userId).then(() => {
            loggedDispatch({type: 'LOGOUT'});
            props.history.push('/login');
        }).catch(error => {
            alert('User could not be deleted: ' + error.message);
        });
    };

    const handleProfileUser = () => {
        props.history.push('/profile/' + loggedUser.userId);
    }

    const getSignupLoginButtons = () => {
        if (loggedUser.isLogged) {
            return (
                <Dropdown nav inNavbar isOpen={dropdownOpen} toggle={toggleDropdown}>
                    <DropdownToggle nav caret>
                        {loggedUser.email}
                    </DropdownToggle>
                    <DropdownMenu right>
                        <DropdownItem className="text-secondary" onClick={handleProfileUser}>Profile</DropdownItem>
                        <DropdownItem className="text-success" onClick={handleEditUser}>Edit</DropdownItem>
                        <DropdownItem className="text-danger" onClick={handleDeleteUser}>Delete</DropdownItem>
                        <DropdownItem divider/>
                        <DropdownItem onClick={handleLogout}>Logout</DropdownItem>
                    </DropdownMenu>
                </Dropdown>
            );
        } else {
            return (
                <>
                    <NavItem className="">
                        <ReactstrapNavLink tag={NavLink} to="/login">Login</ReactstrapNavLink>
                    </NavItem>
                    <NavItem className="d-none d-md-block">
                        <span>|</span>
                    </NavItem>
                    <NavItem className="">
                        <ReactstrapNavLink tag={NavLink} to="/signup">Signup</ReactstrapNavLink>
                    </NavItem>
                </>
            );
        }
    };

    const getAdminRoutes = () => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <>
                    <NavItem className="">
                        <ReactstrapNavLink tag={NavLink} to="/admin/management">Admin Page</ReactstrapNavLink>
                    </NavItem>
                    <NavItem className="d-none d-md-block">
                        <span>|</span>
                    </NavItem>
                </>
            );
        } else {
            return null;
        }
    }

    const handleSearch = () => {
        if (searchTerm && searchTerm.trim() !== '') {
            props.history.push(`/search-bug/${searchTerm}`);
        }
    };

    return (
        <div>
            <Navbar className="top-nav mb-0" expand="md">
                <div className="main-header__nav">
                    <NavbarBrand href="/" className="text-light fs-6">Bugzilla - {title}</NavbarBrand>
                    <NavbarToggler onClick={toggle}/>
                </div>
            </Navbar>
            <Navbar className="bot-nav mt-0" expand="md" dark>
                <Collapse isOpen={isOpen} navbar className="mt-2">
                    <Nav className="d-flex d-inline-block align-items-center justify-content-md-start" navbar>
                        <NavItem className="">
                            <ReactstrapNavLink tag={NavLink} to="/" exact>Home Page</ReactstrapNavLink>
                        </NavItem>
                        <NavItem className="d-none d-md-block">
                            <span>|</span>
                        </NavItem>
                        <NavItem>
                            <ReactstrapNavLink tag={NavLink} to="/new-bug">New Bug</ReactstrapNavLink>
                        </NavItem>
                        <NavItem className="d-none d-md-block">
                            <span>|</span>
                        </NavItem>
                        <NavItem>
                            <ReactstrapNavLink tag={NavLink} to="/browse">Browse Bugs </ReactstrapNavLink>
                        </NavItem>
                        <NavItem className="d-none d-md-block">
                            <span>|</span>
                        </NavItem>
                        <NavItem >
                            <ReactstrapNavLink tag={NavLink} to="/search-bugs">Search Bugs </ReactstrapNavLink>
                        </NavItem>
                        <NavItem className="d-none d-md-block">
                            <span>|</span>
                        </NavItem>
                        {getAdminRoutes()}
                        <NavItem className="d-flex flex-row input-group search-group mx-2">
                            <Input
                                type="text"
                                placeholder="Search..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="form-control search-bar"
                            />
                            <div className="input-group-prepend">
                            <span onClick={handleSearch} className="btn btn-secondary search-button">
                                <i className="fas fa-search"></i>
                            </span>
                            </div>
                        </NavItem>
                        <NavItem className="d-none d-md-block">
                            <span>|</span>
                        </NavItem>
                        {getSignupLoginButtons()}
                    </Nav>
                </Collapse>
            </Navbar>
        </div>
    );
}

export default withRouter(CustomNavbar);