import React, {useState, useEffect, useContext} from 'react';
import {Modal, ModalHeader, ModalBody, Button, Input, Alert} from 'reactstrap';
import { useFetchAdminUsers } from "../../rest/useRestAdminUsers";
import UserItem from "../2admin-users/UserItem";
import {useCreateConversation, useUpdateConversation} from "../../rest/useRestConversations";
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {UserContext} from "../../contexts/user.context";
import {AdminUsersContext} from "../../contexts/admin-users.context";

function CreateConvoModal({ isOpen, toggle, loggedUser, onConversationCreated }) {
    const fetchAdminUsers = useFetchAdminUsers();
    const createConversation = useCreateConversation();
    const updateConversation = useUpdateConversation();
    const [users, setUsers] = useState([]);
    const [selectedUser, setSelectedUser] = useState(getInitialAdminUserState()[0]);
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(true);
    const [refreshKey, setRefreshKey] = useState(true);
    const [currentUser, setCurrentUser] = useState(loggedUser);
    const { triggerReloadGlobal } = useContext(AdminUsersContext);

    const onDismiss = () => setVisible(false);

    const handleToggle = () => {
        toggle();
        setVisible(false);
        setSelectedUser(getInitialAdminUserState()[0]);
        setMessage('');
        setRefreshKey(true);
    };

    useEffect(() => {
        const getUsers = async () => {
            try {
                const fetchedUsers = await fetchAdminUsers();
                const currentUser = fetchedUsers.find(user => user._id === loggedUser.userId);
                setCurrentUser(currentUser);
                setUsers(fetchedUsers.filter(user =>
                    currentUser.followers.some(follower => follower._id === user._id)
                ));
            } catch (error) {
                console.error('Failed to fetch users:', error);
            }
        };

        if (isOpen && refreshKey) {
            getUsers();
            setVisible(false);
            setSelectedUser(getInitialAdminUserState()[0]);
            setMessage('');
            setRefreshKey(false);
        }
    }, [isOpen, fetchAdminUsers, loggedUser.userId]);

    const handleCreateConversation = async () => {
        if (selectedUser && message.trim()) {
            try {
                const existingConversation = currentUser.conversations.find(convo =>
                    convo.participants.some(participant => participant === selectedUser._id)
                );

                if (existingConversation) {
                    await updateConversation(existingConversation._id, message);
                    onConversationCreated(existingConversation);
                    // triggerReloadGlobal();
                } else {
                    const newConversation = await createConversation({
                        participants: [loggedUser.userId, selectedUser._id],
                        text: message,
                    });
                    onConversationCreated(newConversation);
                    // triggerReloadGlobal();
                }

                handleToggle();
            } catch (error) {
                setError('Failed to send message. Please try again: ' + error.message);
            }
        }
    };

    return (
        <Modal
            // expose attributes so tests can locate and assert modal state
            data-testid="create-convo-modal"
            data-open={isOpen ? '1' : '0'}
            isOpen={isOpen}
            toggle={handleToggle}
        >
            <ModalHeader toggle={handleToggle}>Start a New Conversation</ModalHeader>
            <ModalBody>
                {error ?
                    <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">An error occurred</h4>
                        {error}
                    </Alert> : null}
                <h5>Select a User</h5>
                <div className="mb-3">
                    {users.map(user => (
                        <div key={user._id} className="d-flex align-items-center justify-content-between mb-2">
                            <UserItem
                                adminUser={user}
                                onClick={() => setSelectedUser(user)}
                                isSelected={selectedUser && selectedUser._id === user._id}
                            />
                            <input
                                type="checkbox"
                                checked={selectedUser && selectedUser._id === user._id}
                                onChange={() => setSelectedUser(user)}
                                className="ms-2"
                            />
                        </div>
                    ))}
                </div>
                <Input
                    type="text"
                    placeholder="Type your message..."
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    className="mb-3"
                />
                <Button color="primary" onClick={handleCreateConversation} disabled={selectedUser._id === '' || !message.trim()}>
                    Send Message
                </Button>
            </ModalBody>
        </Modal>
    );
}

export default CreateConvoModal;