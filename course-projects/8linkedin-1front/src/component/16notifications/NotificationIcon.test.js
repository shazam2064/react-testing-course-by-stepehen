import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// mock NotificationItem to keep tests focused
jest.mock('./NotificationItem', () => {
  const React = require('react');
  return function NotificationItemMock(props) {
    return React.createElement('div', { 'data-testid': 'notification-item' }, props.type);
  };
});

import NotificationIcon from './NotificationIcon';

describe('NotificationIcon', () => {
  it('shows black bell when there are no notifications', () => {
    const React = require('react');
    const history = createMemoryHistory();
    const adminUser = { _id: 'u1', connections: [], conversations: [], applications: [] };
    render(
      React.createElement(Router, { history }, React.createElement(NotificationIcon, { adminUser, reloadFlag: 0 }))
    );

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-black');
  });

  it('shows red bell when there are notifications, opens dropdown and navigates to notifications page', async () => {
    const React = require('react');
    const history = createMemoryHistory();
    jest.spyOn(history, 'push');

    const now = new Date().toISOString();
    const adminUser = {
      _id: 'u1',
      connections: [
        {
          _id: 'conn1',
          sender: { _id: 'u2', name: 'Bob' },
          receiver: { _id: 'u1', name: 'Me' },
          status: 'pending',
          createdAt: now,
        },
      ],
      conversations: [
        {
          _id: 'conv1',
          lastMessage: {
            _id: 'm1',
            text: 'hello',
            sender: { _id: 'u2', name: 'Bob' },
            createdAt: now,
            read: false,
          },
        },
      ],
      applications: [],
    };

    render(
      React.createElement(Router, { history }, React.createElement(NotificationIcon, { adminUser, reloadFlag: 0 }))
    );

    const svg = document.querySelector('svg');
    expect(svg).toBeInTheDocument();
    expect(svg).toHaveClass('text-danger');

    // open dropdown
    const toggleButton = screen.getAllByRole('button')[0];
    userEvent.click(toggleButton);

    // header and mocked notification items should be present
    // target the dropdown header (h6) by its heading role to avoid ambiguous matches
    expect(await screen.findByRole('heading', { name: /Notifications/i })).toBeInTheDocument();
    const items = await screen.findAllByTestId('notification-item');
    expect(items.length).toBeGreaterThan(0);

    // click view all -> history.push('/notifications')
    const viewAll = screen.getByText(/View all notifications/i);
    userEvent.click(viewAll);
    expect(history.push).toHaveBeenCalledWith('/notifications');
  });
});
