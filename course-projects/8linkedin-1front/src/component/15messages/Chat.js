import React, { useContext, useEffect, useState } from 'react';
import { ConversationsContext, DispatchContext } from "../../contexts/conversations.context";
import {
    useUpdateConversation,
    useDeleteConversation,
    useFetchConversations,
    useFetchConversation,
    useMarkConversationAsRead
} from "../../rest/useRestConversations";
import { UserContext } from "../../contexts/user.context";
import MessengerItem from "./MessengerItem";
import MessageItem from "./MessageItem";
import CreateConvoModal from "./CreateConvoModal";
import { Button, Input, Alert, Card, Col, Row } from "reactstrap";
import { API_URL } from "../../rest/api.rest";
import {faMessage, faTrash} from "@fortawesome/free-solid-svg-icons";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {AdminUsersContext} from "../../contexts/admin-users.context";

function Chat(props) {
    const { conversations } = useContext(ConversationsContext);
    const dispatch = useContext(DispatchContext);
    const fetchConversations = useFetchConversations();
    const fetchConversation = useFetchConversation();
    const deleteConversation = useDeleteConversation();
    const markConversationAsRead = useMarkConversationAsRead();
    const updateConversation = useUpdateConversation();
    const loggedUser = useContext(UserContext);
    const [refreshConversations, setRefreshConversations] = useState(true);
    const [filteredConversations, setFilteredConversations] = useState([]);
    const [selectedConversation, setSelectedConversation] = useState(null);
    const [newMessage, setNewMessage] = useState('');
    const [error, setError] = useState('');
    const [isCreateConvoModalOpen, setIsCreateConvoModalOpen] = useState(false);
    const { triggerReloadGlobal } = useContext(AdminUsersContext);

    useEffect(() => {
        const getConversations = async () => {
            try {
                const conversations = await fetchConversations();
                dispatch({ type: 'SET_CONVERSATIONS', conversations });
                const filtered = conversations.filter(conversation =>
                    conversation.participants.some(participant => participant._id === loggedUser.userId)
                );
                setFilteredConversations(filtered);
            } catch (error) {
                setError('Conversations could not be retrieved.');
            }
        };

        const getConversation = async (conversationId) => {
            try {
                const conversationData = await fetchConversation(conversationId);
                setSelectedConversation(conversationData);
            } catch (error) {
                setError('Conversation could not be retrieved.');
            }
        }

        if (refreshConversations) {
            getConversations();
            if (selectedConversation) {
                getConversation(selectedConversation._id);
            }
            setRefreshConversations(false);
        }
    }, [dispatch, loggedUser.userId, refreshConversations]);

    useEffect(() => {
        const messagesContainer = document.querySelector('.messages');
        if (messagesContainer) {
            messagesContainer.scrollTop = messagesContainer.scrollHeight;
        }
    }, [selectedConversation]);

    const handleSelectConversation = (conversation) => {
        setSelectedConversation(conversation);
        setRefreshConversations(true);
    };

    const handleSendMessage = async () => {
        if (newMessage.trim() === '') return;
        try {
            await updateConversation(selectedConversation._id, newMessage);
            setRefreshConversations(true);
            setNewMessage('');
            // triggerReloadGlobal();
        } catch (error) {
            setError('Message could not be sent.');
        }
    };

    const handleDeleteConversation = async () => {
        if (!selectedConversation) return;
        try {
            await deleteConversation(selectedConversation._id);
            setFilteredConversations(filteredConversations.filter(c => c._id !== selectedConversation._id));
            setSelectedConversation(null);
        } catch (error) {
            setError('Conversation could not be deleted.');
        }
    };

    const toggleCreateConvoModal = () => {
        setIsCreateConvoModalOpen(!isCreateConvoModalOpen);
        setRefreshConversations(true);
    };

    const handleMarkAsRead = async (messageId) => {
        try {
            if (
                selectedConversation &&
                [...selectedConversation.messages, selectedConversation.lastMessage].some(
                    (message) => message._id === messageId
                )
            ) {
                console.log(`Message ${messageId} marked as read`);
                await markConversationAsRead(selectedConversation._id);

                setSelectedConversation((prev) => ({
                    ...prev,
                    messages: prev.messages.map((message) =>
                        message._id === messageId ? { ...message, read: true } : message
                    ),
                    lastMessage:
                        prev.lastMessage && prev.lastMessage._id === messageId
                            ? { ...prev.lastMessage, read: true }
                            : prev.lastMessage,
                }));

                setRefreshConversations(true);
                // triggerReloadGlobal();
            } else {
                console.error(`Message ${messageId} not found in selectedConversation`);
            }
        } catch (error) {
            setError('Failed to mark message as read.');
        }
    };

    return (
        <Card className="d-flex">
            {/* Sidebar */}
            <Row className="d-flex">
                <Col className="px-5 py-4" xs="3">
                    <h4 className="fs-4 mb-3">Conversations</h4>
                    <Button color="primary" className="mb-1" onClick={toggleCreateConvoModal}>
                        New Conversation
                    </Button>
                    <hr className="mb-2" />
                    {filteredConversations.map(convo => {
                        const participant = convo.participants.find(p => p._id !== loggedUser.userId);
                        return (
                            <MessengerItem
                                key={convo._id}
                                conversation={convo}
                                participant={participant}
                                onClick={() => handleSelectConversation(convo)}
                                isSelected={selectedConversation && selectedConversation._id === convo._id}
                            />
                        );
                    })}
                </Col>
                <Col className="px-2 py-4" xs="7">
                    {selectedConversation ? (
                        <>
                            <div className="d-flex justify-content-between align-items-center mb-3">
                                <div className="d-flex align-items-center">
                                    <img
                                        src={`${API_URL}/${selectedConversation.participants.find(p => p._id !== loggedUser.userId).image}`}
                                        alt="Participant"
                                        className="tiny-profile-image"
                                    />
                                    <div
                                        className="fs-4 text-decoration-underline"
                                        style={{cursor: 'pointer'}}
                                        onClick={() => props.history.push(`/profile/${selectedConversation.participants.find(p => p._id !== loggedUser.userId)._id}`)}
                                    >
                                        {selectedConversation.participants.find(p => p._id !== loggedUser.userId).name}
                                    </div>
                                </div>
                                <Button color="danger" className="btn-outline text-white" size="sm"
                                        onClick={handleDeleteConversation}>
                                    <FontAwesomeIcon icon={faTrash}/>
                                </Button>
                            </div>
                            <div className="chat-container">
                                <div className="messages">
                                    {[...selectedConversation.messages, selectedConversation.lastMessage]
                                        .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))
                                        .map((message, index, array) => (
                                            <MessageItem
                                                key={message._id}
                                                message={message}
                                                isOwnMessage={message.sender._id === loggedUser.userId}
                                                isLastMessage={index === array.length - 1}
                                                markAsRead={handleMarkAsRead}
                                            />
                                        ))}
                                </div>
                                <div className="message-input">
                                    <Input
                                        type="text"
                                        value={newMessage}
                                        onChange={(e) => setNewMessage(e.target.value)}
                                        placeholder="Type a message..."
                                    />
                                    <Button color="primary" onClick={handleSendMessage}>
                                        Send
                                    </Button>
                                </div>
                            </div>
                        </>
                    ) : (
                        <div className="text-center">
                            <Alert color="info">Select a conversation to start chatting or create a new one.</Alert>
                        </div>
                    )}
                </Col>
            </Row>

            <CreateConvoModal
                isOpen={isCreateConvoModalOpen}
                toggle={toggleCreateConvoModal}
                loggedUser={loggedUser}
                onConversationCreated={async (newConversation) => {
                    try {
                        const fullConversation = await fetchConversation(newConversation._id); // Fetch the full conversation details
                        setSelectedConversation(fullConversation); // Set the fully populated conversation
                    } catch (error) {
                        setError('Failed to fetch conversation details: ' + error.message);
                    } finally {
                        setRefreshConversations(true); // Trigger the refresh
                    }
                }}
            />
        </Card>
    );
}

export default Chat;