import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import SideBar from './SideBar';
import { UserContext, DispatchContext } from '../../../contexts/user.context';
import { AdminUsersContext } from '../../../contexts/admin-users.context';

jest.mock('../../../rest/useRestAdminUsers', () => ({
  useFetchAdminUserById: jest.fn(),
}));

afterEach(() => {
  jest.resetAllMocks();
});

function renderWithProviders({ isOpen = true, user = { isLogged: false }, history = createMemoryHistory(), setSidebarOpen = jest.fn(), adminUsers = [] } = {}) {
  return render(
    <Router history={history}>
      <UserContext.Provider value={user}>
        <DispatchContext.Provider value={jest.fn()}>
          <AdminUsersContext.Provider value={{ adminUsers, reloadFlag: false }}>
            <SideBar isOpen={isOpen} setSidebarOpen={setSidebarOpen} history={history} />
          </AdminUsersContext.Provider>
        </DispatchContext.Provider>
      </UserContext.Provider>
    </Router>
  );
}

test('renders no profile/connections when user is not logged in', () => {
  renderWithProviders({ isOpen: true, user: { isLogged: false } });
  // side-menu should be present but no profile card content
  expect(screen.queryByText(/Connections/i)).toBeNull();
  expect(screen.queryByText(/No connections available/i)).toBeNull();
});

test('shows profile card and connections when logged in', async () => {
  const sampleAdmin = {
    _id: 'admin-1',
    name: 'Logged User',
    about: 'About me',
    location: 'City',
    headline: 'Developer',
    image: null,
    following: [
      { _id: 'f1', name: 'Friend One', image: null },
      { _id: 'f2', name: 'Friend Two', image: null },
    ],
  };

  // configure mocked hook to return a fetch function that resolves to sampleAdmin
  const rest = require('../../../rest/useRestAdminUsers');
  rest.useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));

  renderWithProviders({ isOpen: true, user: { isLogged: true, userId: 'admin-1' } });

  // wait for async fetch and DOM update
  await waitFor(() => expect(screen.getByText('Logged User')).toBeInTheDocument());
  expect(screen.getByText('About me')).toBeInTheDocument();
  expect(screen.getByText(/Location:/)).toBeInTheDocument();
  expect(screen.getByText(/Headline:/)).toBeInTheDocument();

  // connections heading and friend names should be present
  expect(screen.getByText(/Connections/i)).toBeInTheDocument();
  expect(screen.getByText('Friend One')).toBeInTheDocument();
  expect(screen.getByText('Friend Two')).toBeInTheDocument();
});

test('clicking a connection link navigates to that profile', async () => {
  const sampleAdmin = {
    _id: 'admin-1',
    name: 'Logged User',
    about: 'About me',
    location: 'City',
    headline: 'Developer',
    image: null,
    following: [
      { _id: 'f1', name: 'Friend One', image: null },
    ],
  };

  const rest = require('../../../rest/useRestAdminUsers');
  rest.useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));

  const history = createMemoryHistory({ initialEntries: ['/'] });
  renderWithProviders({ isOpen: true, user: { isLogged: true, userId: 'admin-1' }, history });

  await waitFor(() => expect(screen.getByText('Friend One')).toBeInTheDocument());

  const link = screen.getByText('Friend One').closest('a');
  expect(link).toBeInTheDocument();

  fireEvent.click(link);
  expect(history.location.pathname).toBe('/profile/f1');
});
