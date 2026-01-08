import React, {useContext, useState} from "react";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faAlignLeft, faSearch} from "@fortawesome/free-solid-svg-icons";
import {
    Navbar,
    Button,
    NavbarToggler,
    Collapse,
    Nav,
    NavItem,
    NavLink, DropdownToggle, Dropdown, DropdownMenu, DropdownItem, NavbarBrand, Input,
} from "reactstrap";
import {Link, withRouter} from "react-router-dom";
import {DispatchContext, UserContext} from '../../../contexts/user.context';
import {useDeleteAdminUser} from '../../../rest/useRestAdminUsers';

const Topbar = (props) => {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const [searchTerm, setSearchTerm] = useState('');

    const handleLogout = () => {
        loggedDispatch({type: 'LOGOUT'});
        props.history.push('/login');
    };

    const handleSearch = () => {
        if (searchTerm && searchTerm.trim() !== '') {
            props.history.push(`/tweet/${searchTerm}`);
            setSearchTerm('');
        }
    };

    const getSignupLoginButtons = () => {
        if (loggedUser.isLogged) {
            return (
                <>
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
                <FontAwesomeIcon icon={faAlignLeft}/>
            </Button>
            <NavbarBrand href="/" className="navbar-brand">
                <img className="img"
                     src="https://upload.wikimedia.org/wikipedia/commons/thumb/6/6f/Logo_of_Twitter.svg/1200px-Logo_of_Twitter.svg.png"
                     alt="Twitter"/>
            </NavbarBrand>
            <Nav className="nav w-100 d-flex justify-content-between" navbar>
                <div className="d-md-flex flex-row justify-content-start">
                    <NavItem className="d-flex flex-row input-group search-group mx-2">
                        <Input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="form-control search-bar"
                        />
                        <span onClick={handleSearch} className="input-group-text search-icon bg-primary">
                            <FontAwesomeIcon icon={faSearch} className="text-light" />
                        </span>
                    </NavItem>
                </div>
                <div onClick={handleSearch} className="d-md-flex flex-row">
                    {getSignupLoginButtons()}
                </div>
            </Nav>
        </Navbar>
    );
};

export default withRouter(Topbar);