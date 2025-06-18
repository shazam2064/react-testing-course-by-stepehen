import React from 'react';

function UserList({ users }) {
    const renderedUsers = users.map((user) => {
        return <tr key={user.email}>
            <td>{user.name}</td>
            <td>{user.email}</td>
        </tr>;
    })

    return (
        <table>
            <thead>
                <tr>
                    <th>Name</th>
                    <th>Email</th>
                </tr>
            </thead>
            <tbody>
                {renderedUsers}
            </tbody>
        </table>
    );
}

export default UserList;