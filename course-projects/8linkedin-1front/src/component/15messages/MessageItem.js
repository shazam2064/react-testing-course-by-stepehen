import React, { useEffect } from 'react';

function MessageItem({ message, isOwnMessage, isLastMessage, markAsRead }) {
    useEffect(() => {
        if (!isOwnMessage && !message.read && isLastMessage) {
            markAsRead(message._id);
        }
    }, [isOwnMessage, message.read, isLastMessage, markAsRead, message._id]);

    return (
        <div
            id={`message-${message._id}`}
            className={`message-item ${isOwnMessage ? 'sent' : 'received'}`}
        >
            <p>{message.text}</p>
            <small>
                {isLastMessage && (
                    <>
                        {new Date(message.createdAt).toLocaleString()}
                        <span>
                            {' - '}
                            {message.read ? 'Read' : 'Delivered'}
                        </span>
                    </>
                )}
            </small>
        </div>
    );
}

export default MessageItem;