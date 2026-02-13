import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Topbar from './Topbar';
import { UserContext, DispatchContext } from '../../../contexts/user.context';
import { AdminUsersContext } from '../../../contexts/admin-users.context';

// Provide a stable mock for useFetchAdminUserById so Topbar can fetch adminUser when isLogged=true
jest.mock('../../../rest/useRestAdminUsers', () => ({
  useFetchAdminUserById: jest.fn(() => jest.fn().mockResolvedValue({ _id: '1', name: 'Mock User', image: null })),
  useDeleteAdminUser: jest.fn(),
}));

jest.mock('../../16notifications/NotificationIcon', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'notification-icon' }, 'notif');
});

afterEach(() => {
  jest.resetAllMocks();
});

function renderWithProviders({ user = { isLogged: false }, dispatch = jest.fn(), history = createMemoryHistory() } = {}) {
  const utils = render(
    <Router history={history}>
      <AdminUsersContext.Provider value={{ adminUsers: [], reloadFlag: false }}>
        <UserContext.Provider value={user}>
          <DispatchContext.Provider value={dispatch}>
            <Topbar toggleSidebar={jest.fn()} />
          </DispatchContext.Provider>
        </UserContext.Provider>
      </AdminUsersContext.Provider>
    </Router>
  );
  return { ...utils, history, dispatch };
}

test('shows Login and Signup when not logged in', () => {
  renderWithProviders({ user: { isLogged: false } });
  expect(screen.getByText('Login')).toBeInTheDocument();
  expect(screen.getByText('Signup')).toBeInTheDocument();
});

test('shows Logout when logged in and hides Login/Signup', async () => {
  const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
  renderWithProviders({ user });
  // wait for async fetchAdminUser to settle (Profile link rendering depends on it)
  await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());
  expect(screen.queryByText('Login')).toBeNull();
  expect(screen.queryByText('Signup')).toBeNull();
});

test('calls dispatch LOGOUT and redirects on Logout click', async () => {
  const dispatch = jest.fn();
  const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
  const history = createMemoryHistory();
  renderWithProviders({ user, dispatch, history });

  await waitFor(() => expect(screen.getByText('Logout')).toBeInTheDocument());

  fireEvent.click(screen.getByText('Logout'));
  expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
  expect(history.location.pathname).toBe('/login');
});

test('navigates to post search when search term provided', () => {
  const history = createMemoryHistory({ initialEntries: ['/'] });
  renderWithProviders({ user: { isLogged: false }, history });

  const input = screen.getByPlaceholderText('Search...');
  fireEvent.change(input, { target: { value: 'hello' } });

  const searchIcon = document.querySelector('.search-icon');
  fireEvent.click(searchIcon);

  expect(history.location.pathname).toBe('/post/hello');
});
