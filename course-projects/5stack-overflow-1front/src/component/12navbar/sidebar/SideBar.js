import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
    faHome,
    faBriefcase,
    faCopy,
} from "@fortawesome/free-solid-svg-icons";
import {NavItem, NavLink, Nav} from "reactstrap";
import classNames from "classnames";
import { Link } from "react-router-dom";


const SideBar = ({ isOpen, toggle }) => (
    <div className={classNames("sidebar", { "is-open": isOpen })}>
        <div className="side-menu">
            <Nav vertical justified  className="nav">
                <NavItem>
                    <NavLink tag={Link} to={"/"} activeClassName="active">
                        <FontAwesomeIcon icon={faHome}/>
                        <span className="mr-5"></span> Home
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to={"/questions"} activeClassName="active">
                        <FontAwesomeIcon icon={faBriefcase}/>
                        <span className="mr-5"></span> Questions
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink tag={Link} to={"/tags"} activeClassName="active">
                        <FontAwesomeIcon icon={faCopy}/>
                        <span className="mr-5"></span> Tags
                    </NavLink>
                </NavItem>
            </Nav>
        </div>
    </div>
);

export default SideBar;
