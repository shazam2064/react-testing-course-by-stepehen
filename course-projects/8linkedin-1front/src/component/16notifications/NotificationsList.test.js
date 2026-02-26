import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { act } from 'react-dom/test-utils';
import userEvent from '@testing-library/user-event';
import { UserContext } from '../../contexts/user.context';

// mock the REST hook module before importing the component
jest.mock('../../rest/useRestAdminUsers', () => ({
  useFetchAdminUserById: jest.fn(),
}));

// mock NotificationItem so tests don't depend on its implementation
jest.mock('./NotificationItem', () => {
  const React = require('react');
  return function NotificationItemMock(props) {
    return React.createElement('div', { 'data-testid': 'notification-item' }, props.type);
  };
});

const { useFetchAdminUserById } = require('../../rest/useRestAdminUsers');
const NotificationsList = require('./NotificationsList').default;

afterEach(() => {
  jest.clearAllMocks();
});

describe('NotificationsList', () => {
  it('renders fetched notifications and filters by Messages', async () => {
    const now = new Date().toISOString();
    const adminUserData = {
      _id: 'u1',
      // remove connections from this test to keep the generated notifications deterministic
      connections: [],
      conversations: [
        {
          _id: 'conv1',
          lastMessage: { _id: 'm1', text: 'hello', sender: { _id: 'u2', name: 'Bob' }, createdAt: now, read: false },
        },
      ],
      applications: [
        { _id: 'app1', job: { _id: 'j1', title: 'Dev' }, status: 'approved', createdAt: now },
      ],
    };

    const fetchAdminUser = jest.fn().mockResolvedValue(adminUserData);
    useFetchAdminUserById.mockReturnValue(fetchAdminUser);

    const loggedUser = { userId: 'u1' };
    render(
      <UserContext.Provider value={loggedUser}>
        <NotificationsList />
      </UserContext.Provider>
    );

    // header should appear
    expect(await screen.findByText(/Your Notifications/i)).toBeInTheDocument();

    // two mocked notification items should be rendered (unreadMessage + application)
    const items = await screen.findAllByTestId('notification-item');
    expect(items).toHaveLength(2);

    // click Messages filter -> only unreadMessage remains
    const messagesButton = screen.getByRole('button', { name: /Messages/i });
    // wrap the click in act so React state updates are flushed in tests
    await act(async () => {
      userEvent.click(messagesButton);
    });

    // wait for the filtered list to update
    await waitFor(() => {
      const filtered = screen.getAllByTestId('notification-item');
      expect(filtered).toHaveLength(1);
      expect(filtered[0]).toHaveTextContent('unreadMessage');
    });
  });

  it('shows "No notifications" when there are none', async () => {
    const adminUserData = { _id: 'u1', connections: [], conversations: [], applications: [] };
    const fetchAdminUser = jest.fn().mockResolvedValue(adminUserData);
    useFetchAdminUserById.mockReturnValue(fetchAdminUser);

    const loggedUser = { userId: 'u1' };
    render(
      <UserContext.Provider value={loggedUser}>
        <NotificationsList />
      </UserContext.Provider>
    );

    expect(await screen.findByText(/No notifications/i)).toBeInTheDocument();
  });
});
