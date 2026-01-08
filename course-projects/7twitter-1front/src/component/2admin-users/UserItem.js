import React, { memo } from "react";
import { withRouter, Link } from "react-router-dom";
import {API_URL} from "../../rest/api.rest";

const UserItem = memo(function UserItem({ adminUser, actionButtons }) {
    return (
        <div key={adminUser._id} className="d-flex align-items-center mb-4">
            <img
                src={`${API_URL}/${adminUser.image}` || "https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png"}
                alt={`${adminUser.name}'s profile`}
                className="rounded-circle me-3"
                style={{ width: "50px", height: "50px", objectFit: "cover" }}
            />
            <Link to={`/profile/${adminUser._id}`} className="text-decoration-none">
                <h1 className="h5 mb-0 text-black">{adminUser.name}</h1>
                <p className="mb-0 text-muted">@{adminUser.email}</p>
            </Link>
            <div className="ms-auto">{actionButtons}</div>
        </div>
    );
});

export default withRouter(UserItem);