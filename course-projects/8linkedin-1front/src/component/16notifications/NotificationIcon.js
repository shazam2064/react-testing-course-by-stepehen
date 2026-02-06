import React, { useState, useEffect } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBell } from "@fortawesome/free-solid-svg-icons";
import { Dropdown, DropdownToggle, DropdownMenu, DropdownItem } from "reactstrap";
import NotificationItem from "./NotificationItem";
import { withRouter } from "react-router-dom";

const NotificationIcon = ({ adminUser, reloadFlag, history }) => {
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const [notifications, setNotifications] = useState([]);
    const [hasNotifications, setHasNotifications] = useState(false);

    const toggleDropdown = () => {
        setDropdownOpen(!dropdownOpen);

        if (dropdownOpen) {
            const hasUnreadMessages = notifications.some(
                (notification) => notification.type === "unreadMessage"
            );
            setHasNotifications(hasUnreadMessages);
        }
    };

    useEffect(() => {
        const allNotifications = [];

        if (adminUser.connections && adminUser.connections.length > 0) {
            adminUser.connections.forEach((connection) => {
                const isSender = connection.sender._id === adminUser._id;
                allNotifications.push({
                    type: "followRequest",
                    data: {
                        sender: connection.sender,
                        receiver: connection.receiver,
                        _id: connection._id,
                        status: connection.status,
                        isSender: isSender,
                    },
                    createdAt: connection.createdAt,
                });
            });
        }

        if (adminUser.conversations && adminUser.conversations.length > 0) {
            adminUser.conversations
                .filter(
                    (conversation) =>
                        conversation.lastMessage &&
                        !conversation.lastMessage.read &&
                        conversation.lastMessage.sender._id !== adminUser._id
                )
                .forEach((conversation) => {
                    allNotifications.push({
                        type: "unreadMessage",
                        data: {
                            senderId: conversation.lastMessage.sender._id,
                            senderName: conversation.lastMessage.sender.name,
                        },
                        createdAt: conversation.lastMessage.createdAt,
                    });
                });
        }

        if (adminUser.applications && adminUser.applications.length > 0) {
            adminUser.applications.forEach((application) => {
                allNotifications.push({
                    type: "application",
                    data: {
                        job: {
                            _id: application.job._id,
                            title: application.job.title,
                        },
                        status: application.status,
                    },
                    createdAt: application.createdAt,
                });
            });
        }

        allNotifications.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setNotifications(allNotifications);

        const hasUnreadMessages = allNotifications.some(
            (notification) => notification.type === "unreadMessage"
        );
        const hasPendingFollowRequests = allNotifications.some(
            (notification) =>
                notification.type === "followRequest" && notification.data.status === "pending"
        );
        const hasApprovedApplications = allNotifications.some(
            (notification) =>
                notification.type === "application" && notification.data.status === "approved"
        );

        setHasNotifications(hasUnreadMessages || hasPendingFollowRequests || hasApprovedApplications);
    }, [adminUser, reloadFlag]);

    const handleViewAllNotifications = () => {
        history.push("/notifications");
    };

    return (
        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mt-0">
            <DropdownToggle color="light" className="text-info hover bg-white border-0">
                <FontAwesomeIcon
                    icon={faBell}
                    className={hasNotifications ? "text-danger" : "text-black"}
                />
            </DropdownToggle>
            <DropdownMenu>
                <DropdownItem header className="text-black">Notifications</DropdownItem>

                {notifications.length > 0 ? (
                    notifications.slice(0, 4).map((notification, index) => (
                        <NotificationItem
                            key={index}
                            type={notification.type}
                            data={notification.data}
                            isPage={false}
                        />
                    ))
                ) : (
                    <DropdownItem>No notifications</DropdownItem>
                )}

                <DropdownItem divider />
                <DropdownItem className="text-center" onClick={handleViewAllNotifications}>
                    View all notifications
                </DropdownItem>
            </DropdownMenu>
        </Dropdown>
    );
};

export default withRouter(NotificationIcon);