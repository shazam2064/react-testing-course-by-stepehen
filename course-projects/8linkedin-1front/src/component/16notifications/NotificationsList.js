import React, { useEffect, useState, useContext } from "react";
import { UserContext } from "../../contexts/user.context";
import { ListGroup, ListGroupItem, Spinner, Button, ButtonGroup, Card } from "reactstrap";
import { useFetchAdminUserById } from "../../rest/useRestAdminUsers";
import NotificationItem from "./NotificationItem";

const NotificationsList = () => {
    const loggedUser = useContext(UserContext);
    const fetchAdminUser = useFetchAdminUserById();
    const [adminUser, setAdminUser] = useState(null);
    const [notifications, setNotifications] = useState([]);
    const [filteredNotifications, setFilteredNotifications] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState("all");

    useEffect(() => {
        if (!loggedUser) return;

        const fetchNotifications = async () => {
            try {
                const adminUserData = await fetchAdminUser(loggedUser.userId);
                setAdminUser(adminUserData);
                const allNotifications = [];

                if (adminUserData.connections) {
                    adminUserData.connections.forEach((connection) => {
                        const isSender = connection.sender._id === adminUserData._id;
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

                if (adminUserData.conversations) {
                    adminUserData.conversations
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

                if (adminUserData.applications) {
                    adminUserData.applications.forEach((application) => {
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
                setFilteredNotifications(allNotifications);
                setLoading(false);
            } catch (error) {
                console.error("Error fetching notifications:", error);
                setLoading(false);
            }
        };

        if (loading) {
            fetchNotifications();
            console.log("Fetching notifications for user:", loggedUser.userId);
        }
    }, [loggedUser, fetchAdminUser, loading]);

    const handleFilterChange = (type) => {
        setFilter(type);
        if (type === "all") {
            setFilteredNotifications(notifications);
        } else {
            setFilteredNotifications(notifications.filter((notif) => notif.type === type));
        }
    };

    if (loading) {
        return <Spinner color="primary" />;
    }

    return (
        <Card className="container p-s5 mx-auto py-4 px-4">
            <h3>Your Notifications</h3>
            <ButtonGroup className="mb-3">
                <Button color="primary" onClick={() => handleFilterChange("all")} active={filter === "all"}>
                    All
                </Button>
                <Button color="info" onClick={() => handleFilterChange("application")} active={filter === "application"}>
                    Applications
                </Button>
                <Button color="success" className="text-white" onClick={() => handleFilterChange("unreadMessage")} active={filter === "unreadMessage"}>
                    Messages
                </Button>
                <Button color="warning" className="text-white" onClick={() => handleFilterChange("followRequest")} active={filter === "followRequest"}>
                    Follow Requests
                </Button>
            </ButtonGroup>
            <ListGroup>
                {filteredNotifications.length > 0 ? (
                    filteredNotifications.map((notification, index) => (
                        <NotificationItem
                            key={index}
                            type={notification.type}
                            data={notification.data}
                            isPage={true}
                        />
                    ))
                ) : (
                    <ListGroupItem>No notifications</ListGroupItem>
                )}
            </ListGroup>
        </Card>
    );
};

export default NotificationsList;