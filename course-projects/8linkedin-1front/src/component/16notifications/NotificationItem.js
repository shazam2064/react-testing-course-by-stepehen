import React, { useContext } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faCheck, faTimes } from "@fortawesome/free-solid-svg-icons";
import { DropdownItem } from "reactstrap";
import { useUpdateConnection } from "../../rest/useRestConnections";
import { UserContext } from "../../contexts/user.context";
import {AdminUsersContext} from "../../contexts/admin-users.context";

const NotificationItem = ({ type, data, isPage }) => {
    const updateConnection = useUpdateConnection();
    const { triggerReloadGlobal } = useContext(AdminUsersContext);

    const handleAccept = async (connectionId) => {
        try {
            await updateConnection(connectionId, "accepted");
            // triggerReloadGlobal();
        } catch (error) {
            console.error("Error accepting connection:", error.message);
        }
    };

    const handleReject = async (connectionId) => {
        try {
            await updateConnection(connectionId, "rejected");
            // triggerReloadGlobal();
        } catch (error) {
            console.error("Error rejecting connection:", error.message);
        }
    };

    const itemStyle = isPage
        ? { padding: "20px", border: "1px solid #ddd", fontSize: "16px" }
        : null;

    switch (type) {
        case "followRequest":
            return (
                <DropdownItem style={itemStyle} className="d-flex justify-content-between align-items-center">
                    {data.status === "pending" ? (
                        data.isSender ? (
                            <span>You sent a follow request to {data.receiver.name}</span>
                        ) : (
                            <>
                                <span className="me-2">{data.sender.name} sent you a follow request</span>
                                <div>
                                    <FontAwesomeIcon
                                        icon={faCheck}
                                        className="text-success me-2"
                                        onClick={() => handleAccept(data._id)}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            transition: "transform 0.2s",
                                        }}
                                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                                    />
                                    <FontAwesomeIcon
                                        icon={faTimes}
                                        className="text-danger"
                                        onClick={() => handleReject(data._id)}
                                        style={{
                                            cursor: "pointer",
                                            fontSize: "16px",
                                            transition: "transform 0.2s",
                                        }}
                                        onMouseEnter={(e) => (e.target.style.transform = "scale(1.2)")}
                                        onMouseLeave={(e) => (e.target.style.transform = "scale(1)")}
                                    />
                                </div>
                            </>
                        )
                    ) : (
                        <span>
                        {!data.isSender
                            ? `You ${data.status} ${data.sender.name}'s follow request`
                            : `${data.receiver.name} ${data.status} your follow request`}
                        </span>
                    )}
                </DropdownItem>
            );
        case "unreadMessage":
            return (
                <DropdownItem style={itemStyle}>
                    <span>{data.senderName} sent you a message</span>
                </DropdownItem>
            );
        case "application":
            return (
                <DropdownItem style={itemStyle}>
                    <span>
                        <strong>{data.job.title}</strong> - {data.status}
                    </span>
                </DropdownItem>
            );
        default:
            return null;
    }
};

export default NotificationItem;