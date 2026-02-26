import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { ConversationsContext, DispatchContext } from '../../contexts/conversations.context';
import { UserContext } from '../../contexts/user.context';
import { AdminUsersContext } from '../../contexts/admin-users.context';

// set API_URL to avoid import-time logs
process.env.API_URL = process.env.API_URL || 'http://test';

// mock rest hooks
jest.mock('../../rest/useRestConversations', () => ({
  useFetchConversations: jest.fn(),
  useFetchConversation: jest.fn(),
  useUpdateConversation: jest.fn(),
  useDeleteConversation: jest.fn(),
  useMarkConversationAsRead: jest.fn(),
}));

const {
  useFetchConversations,
  useFetchConversation,
  useUpdateConversation,
  useDeleteConversation,
  useMarkConversationAsRead,
} = require('../../rest/useRestConversations');

// mock child components safely (require React inside factory)
jest.mock('./MessengerItem', () => {
  const React = require('react');
  return ({ conversation, participant, onClick, isSelected }) =>
    React.createElement('div', {
      'data-testid': `messenger-${conversation._id}`,
      onClick: onClick,
      role: 'button'
    }, participant?.name || conversation._id);
});

jest.mock('./MessageItem', () => {
  const React = require('react');
  return ({ message, isOwnMessage, isLastMessage, markAsRead }) => {
    React.useEffect(() => {
      if (!isOwnMessage && !message.read && isLastMessage) {
        // simulate MessageItem marking read on mount like real component
        markAsRead && markAsRead(message._id);
      }
    }, []);
    return React.createElement('div', { 'data-testid': `message-${message._id}` }, message.text);
  };
});

jest.mock('./CreateConvoModal', () => {
  const React = require('react');
  return ({ isOpen }) => React.createElement('div', { 'data-testid': 'create-convo-modal', 'data-open': isOpen ? '1' : '0' }, '');
});

afterEach(() => {
  jest.clearAllMocks();
});

const sampleUser = { userId: 'u1', name: 'Alice' };

function renderWithProviders({
  fetchConversationsImpl,
  fetchConversationImpl,
  updateImpl,
  deleteImpl,
  markReadImpl,
  conversations = [],
  user = sampleUser
} = {}) {
  useFetchConversations.mockReturnValue(fetchConversationsImpl || (() => Promise.resolve([])));
  useFetchConversation.mockReturnValue(fetchConversationImpl || (() => Promise.resolve(null)));
  useUpdateConversation.mockReturnValue(updateImpl || jest.fn().mockResolvedValue({}));
  useDeleteConversation.mockReturnValue(deleteImpl || jest.fn().mockResolvedValue({}));
  useMarkConversationAsRead.mockReturnValue(markReadImpl || jest.fn().mockResolvedValue({}));

  const Chat = require('./Chat').default;

  return render(
    <MemoryRouter>
      <ConversationsContext.Provider value={{ conversations }}>
        <DispatchContext.Provider value={jest.fn()}>
          <UserContext.Provider value={user}>
            <AdminUsersContext.Provider value={{ triggerReloadGlobal: jest.fn() }}>
              <Chat />
            </AdminUsersContext.Provider>
          </UserContext.Provider>
        </DispatchContext.Provider>
      </ConversationsContext.Provider>
    </MemoryRouter>
  );
}

describe('Chat', () => {
  it('shows placeholder when no conversations', async () => {
    renderWithProviders({ fetchConversationsImpl: jest.fn().mockResolvedValue([]) });

    expect(await screen.findByText(/Select a conversation to start chatting/i)).toBeInTheDocument();
  });

  it('loads conversations, selects one and sends a message (calls updateConversation)', async () => {
    const convo = {
      _id: 'c1',
      participants: [{ _id: 'u1', name: 'Alice' }, { _id: 'u2', name: 'Bob', image: 'b.png' }],
      messages: [{ _id: 'm1', text: 'Hi', sender: { _id: 'u2' }, createdAt: new Date().toISOString(), read: false }],
      lastMessage: { _id: 'm2', text: 'Last', sender: { _id: 'u2' }, createdAt: new Date().toISOString(), read: false }
    };

    const fetchConversationsImpl = jest.fn().mockResolvedValue([convo]);
    const fetchConversationImpl = jest.fn().mockResolvedValue(convo);
    const updateImpl = jest.fn().mockResolvedValue({});
    const markReadImpl = jest.fn().mockResolvedValue({});

    renderWithProviders({ fetchConversationsImpl, fetchConversationImpl, updateImpl, markReadImpl, conversations: [convo] });

    // wait for messenger item
    await waitFor(() => expect(screen.getByTestId('messenger-c1')).toBeInTheDocument());

    // click to select conversation
    userEvent.click(screen.getByTestId('messenger-c1'));

    // fetchConversation should be called (component effect)
    await waitFor(() => expect(fetchConversationImpl).toHaveBeenCalledWith('c1'));

    // message items should render (MessageItem mock)
    await waitFor(() => expect(screen.getByTestId('message-m1')).toBeInTheDocument());

    // type a message and send
    const input = screen.getByPlaceholderText(/Type a message.../i);
    userEvent.type(input, 'Hello Bob');
    userEvent.click(screen.getByRole('button', { name: /Send/i }));

    await waitFor(() => {
      expect(updateImpl).toHaveBeenCalledWith('c1', 'Hello Bob');
      expect(input.value).toBe('');
    });

    // markAsRead should have been called for last message
    expect(markReadImpl).toHaveBeenCalled();
  });

  it('deletes a selected conversation and shows placeholder afterwards', async () => {
    const convo = {
      _id: 'c2',
      participants: [{ _id: 'u1', name: 'Alice' }, { _id: 'u3', name: 'Charlie', image: 'c.png' }],
      messages: [],
      lastMessage: { _id: 'ml', text: '', sender: { _id: 'u3' }, createdAt: new Date().toISOString(), read: true }
    };

    const fetchConversationsImpl = jest.fn().mockResolvedValue([convo]);
    const fetchConversationImpl = jest.fn().mockResolvedValue(convo);
    const deleteImpl = jest.fn().mockResolvedValue({});
    renderWithProviders({ fetchConversationsImpl, fetchConversationImpl, deleteImpl, conversations: [convo] });

    // select convo
    await waitFor(() => expect(screen.getByTestId('messenger-c2')).toBeInTheDocument());
    userEvent.click(screen.getByTestId('messenger-c2'));

    // wait for conversation details to render
    await waitFor(() => expect(screen.queryByText(/Select a conversation to start chatting/i)).not.toBeInTheDocument());

    // find delete button (styled .btn-danger) in DOM and click
    const deleteButton = document.querySelector('button.btn-danger') || document.querySelector('button.btn-outline') || document.querySelector('button');
    expect(deleteButton).toBeInTheDocument();
    userEvent.click(deleteButton);

    // assert delete called and UI shows placeholder
    await waitFor(() => {
      expect(deleteImpl).toHaveBeenCalledWith('c2');
      expect(screen.getByText(/Select a conversation to start chatting/i)).toBeInTheDocument();
    });
  });
});
