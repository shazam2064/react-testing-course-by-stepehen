import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import {BrowserRouter as Router, Route, Switch} from "react-router-dom";
import React, {useState} from "react";
import SideBar from "./component/12navbar/sidebar/SideBar";
import Content from "./component/12navbar/content/Content";
import {AdminUsersProvider} from "./contexts/admin-users.context";
import {UserProvider} from "./contexts/user.context";
import Topbar from "./component/12navbar/content/Topbar";

function App() {
    const [sidebarIsOpen, setSidebarOpen] = useState(true);
    const toggleSidebar = () => setSidebarOpen(!sidebarIsOpen);

    return (
        <Router>
            <div className="App wrapper">
                <UserProvider>
                    <AdminUsersProvider>
                        <Topbar toggleSidebar={toggleSidebar} isOpen={sidebarIsOpen}/>
                        <SideBar toggle={toggleSidebar} isOpen={sidebarIsOpen}/>
                        <Content toggleSidebar={toggleSidebar} sidebarIsOpen={sidebarIsOpen}/>
                    </AdminUsersProvider>
                </UserProvider>
            </div>
        </Router>
    );
}

export default App;