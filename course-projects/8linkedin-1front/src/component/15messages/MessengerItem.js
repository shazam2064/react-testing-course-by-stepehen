import React, { memo } from "react";
import { API_URL } from "../../rest/api.rest";

const MessengerItem = memo(function MessengerItem({ conversation, participant, onClick, isSelected }) {

    return (
        <div
            key={conversation._id}
            className={`d-flex align-items-center mb-3 p-2 ${isSelected ? "bg-dark-subtle" : ""}`}
            style={{ cursor: "pointer", borderRadius: "5px" }}
            onClick={onClick}
        >
            <img
                src={`${API_URL}/${participant.image}` || "https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png"}
                alt={`${participant.name}'s profile`}
                className="rounded-circle me-2"
                style={{ width: "40px", height: "40px", objectFit: "cover" }}
            />
            <h1 className="h6 mb-0 text-black">{participant.name}</h1>
        </div>
    );
});

export default MessengerItem;