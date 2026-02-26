import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';

// mocks for rest hooks used by CreateConvoModal
jest.mock('../../rest/useRestAdminUsers', () => ({
  useFetchAdminUsers: jest.fn(),
}));
jest.mock('../../rest/useRestConversations', () => ({
  useCreateConversation: jest.fn(),
  useUpdateConversation: jest.fn(),
}));

const { useFetchAdminUsers } = require('../../rest/useRestAdminUsers');
const { useCreateConversation, useUpdateConversation } = require('../../rest/useRestConversations');
// add AdminUsersContext for providing triggerReloadGlobal in tests
const { AdminUsersContext } = require('../../contexts/admin-users.context');

// lightweight UserItem mock to expose onClick and render user name
jest.mock('../2admin-users/UserItem', () => {
  const React = require('react');
  return ({ adminUser, onClick }) =>
    React.createElement('div', {
      'data-testid': `user-${adminUser._id}`,
      onClick: onClick,
      role: 'button'
    }, adminUser.name);
});

afterEach(() => {
  jest.clearAllMocks();
});

const CreateConvoModal = require('./CreateConvoModal').default;

describe('CreateConvoModal', () => {
  it('fetches users, selects one and creates a new conversation', async () => {
    const loggedUser = { userId: 'u1', name: 'Me' };
    const otherUser = { _id: 'u2', name: 'Other', followers: [], conversations: [] };
    const currentUser = { _id: 'u1', name: 'Me', followers: [{ _id: 'u2' }], conversations: [] };
    const fetchedUsers = [currentUser, otherUser];

    // hook returns a function that when invoked resolves fetched users
    useFetchAdminUsers.mockReturnValue(() => Promise.resolve(fetchedUsers));

    const newConversation = { _id: 'conv-new', participants: ['u1', 'u2'] };
    const createFn = jest.fn().mockResolvedValue(newConversation);
    useCreateConversation.mockReturnValue(createFn);
    useUpdateConversation.mockReturnValue(jest.fn()); // not used in this test

    const toggle = jest.fn();
    const onConversationCreated = jest.fn();

    render(
      <AdminUsersContext.Provider value={{ triggerReloadGlobal: jest.fn() }}>
        <CreateConvoModal
          isOpen={true}
          toggle={toggle}
          loggedUser={loggedUser}
          onConversationCreated={onConversationCreated}
        />
      </AdminUsersContext.Provider>
    );

    // modal should open and fetch users -> user item should appear
    const modal = await screen.findByTestId('create-convo-modal');
    expect(modal).toHaveAttribute('data-open', '1');

    // user item for other user should be rendered
    const otherUserEl = await screen.findByTestId('user-u2');
    expect(otherUserEl).toBeInTheDocument();

    // select user (click UserItem)
    userEvent.click(otherUserEl);

    // type a message and send
    const input = screen.getByPlaceholderText(/Type your message/i);
    userEvent.type(input, 'Hello there');
    userEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(createFn).toHaveBeenCalledWith(expect.objectContaining({
        participants: [loggedUser.userId, otherUser._id],
        text: 'Hello there'
      }));
      expect(onConversationCreated).toHaveBeenCalledWith(newConversation);
      expect(toggle).toHaveBeenCalled(); // modal toggled closed
    });
  });

  it('updates an existing conversation when one exists between users', async () => {
    const loggedUser = { userId: 'u1', name: 'Me' };
    const otherUser = { _id: 'u2', name: 'Other', followers: [], conversations: [] };
    const existingConvo = { _id: 'conv-ex', participants: ['u1', 'u2'] };
    const currentUser = { _id: 'u1', name: 'Me', followers: [{ _id: 'u2' }], conversations: [existingConvo] };
    const fetchedUsers = [currentUser, otherUser];

    useFetchAdminUsers.mockReturnValue(() => Promise.resolve(fetchedUsers));

    const updateFn = jest.fn().mockResolvedValue(existingConvo);
    useUpdateConversation.mockReturnValue(updateFn);
    useCreateConversation.mockReturnValue(jest.fn()); // not used here

    const toggle = jest.fn();
    const onConversationCreated = jest.fn();

    render(
      <AdminUsersContext.Provider value={{ triggerReloadGlobal: jest.fn() }}>
        <CreateConvoModal
          isOpen={true}
          toggle={toggle}
          loggedUser={loggedUser}
          onConversationCreated={onConversationCreated}
        />
      </AdminUsersContext.Provider>
    );

    // wait for other user to appear and select
    const otherUserEl = await screen.findByTestId('user-u2');
    userEvent.click(otherUserEl);

    // type message and click send
    const input = screen.getByPlaceholderText(/Type your message/i);
    userEvent.type(input, 'Update this convo');
    userEvent.click(screen.getByRole('button', { name: /Send Message/i }));

    await waitFor(() => {
      expect(updateFn).toHaveBeenCalledWith(existingConvo._id, 'Update this convo');
      expect(onConversationCreated).toHaveBeenCalledWith(existingConvo);
      expect(toggle).toHaveBeenCalled();
    });
  });
});

