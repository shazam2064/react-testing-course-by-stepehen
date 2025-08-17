import React, { useContext, useState } from 'react';
import { NavLink, withRouter } from 'react-router-dom';
import { DispatchContext, UserContext } from '../contexts/user.context';
import { useDeleteAdminUser } from '../rest/useRestAdminUsers';
import '@fortawesome/fontawesome-free/css/all.min.css';
import { Navbar, NavbarBrand, NavbarToggler, Collapse, Nav, NavItem, Button, Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from 'reactstrap';

function NavbarComponent(props) {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const deleteAdminUser = useDeleteAdminUser();
    const [isOpen, setIsOpen] = useState(false);
    const [dropdownOpen, setDropdownOpen] = useState(false);

    const toggle = () => setIsOpen(!isOpen);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const handleLogout = () => {
        loggedDispatch({ type: 'LOGOUT' });
        props.history.push('/login');
    };

    const handleEditUser = () => {
        props.history.push('/admin/edit-user/' + loggedUser.userId);
    };

    const handleDeleteUser = () => {
        deleteAdminUser(loggedUser.userId).then(() => {
            loggedDispatch({ type: 'LOGOUT' });
            props.history.push('/login');
        }).catch(error => {
            alert('User could not be deleted: ' + error.message);
        });
    };

    const getSignupLoginButtons = () => {
        if (loggedUser.isLogged) {
            return (
                <Nav navbar>
                    <NavItem>
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown}>
                            <DropdownToggle nav caret>
                                {loggedUser.email}
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem className="text-primary" onClick={handleEditUser}>Edit</DropdownItem>
                                <DropdownItem className="text-danger" onClick={handleDeleteUser}>Delete</DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </NavItem>
                    <NavItem>
                        <NavLink className="nav-link" exact to="/login" activeClassName="active" onClick={handleLogout}>Logout</NavLink>
                    </NavItem>
                </Nav>
            );
        } else {
            return (
                <Nav navbar>
                    <NavItem>
                        <NavLink className="nav-link" exact to="/login" activeClassName="active">Login</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className="nav-link" exact to="/signup" activeClassName="active">Signup</NavLink>
                    </NavItem>
                </Nav>
            );
        }
    };

    const getAdminRoutes = () => {
        if (loggedUser.isAdmin) {
            return (
                <>
                    <NavItem>
                        <NavLink className="nav-link" to="/admin/add-product" activeClassName="active">Add Product</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className="nav-link" to="/admin/admin-products" activeClassName="active">Admin Products</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className="nav-link" to="/admin/users" activeClassName="active">Users</NavLink>
                    </NavItem>
                    <NavItem>
                        <NavLink className="nav-link" to="/admin/add-user" activeClassName="active">Add User</NavLink>
                    </NavItem>
                </>
            );
        } else {
            return null;
        }
    };

    return (
        <Navbar color="success" light="true" dark="true" container="sm" expand="md">
            <NavbarBrand href="/">
                <i className="fas fa-shopping-cart"></i>
            </NavbarBrand>
            <NavbarToggler onClick={toggle} />
            <Collapse isOpen={isOpen} navbar>
                <Nav className="me-auto" navbar>
                        <NavItem>
                            <NavLink className="nav-link" to="/products" activeClassName="active">Products</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/cart" activeClassName="active">Cart</NavLink>
                        </NavItem>
                        <NavItem>
                            <NavLink className="nav-link" to="/orders" activeClassName="active">Orders</NavLink>
                        </NavItem>
                        {getAdminRoutes()}
                </Nav>
                {getSignupLoginButtons()}
            </Collapse>
        </Navbar>
    );
}

export default withRouter(NavbarComponent);