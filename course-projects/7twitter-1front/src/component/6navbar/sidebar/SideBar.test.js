import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { UserContext, DispatchContext } from '../../../contexts/user.context';
import { AdminUsersContext } from '../../../contexts/admin-users.context';

jest.mock('../../../rest/useRestAdminUsers', () => ({
  useFetchAdminUserById: () => (userId) => Promise.resolve({ _id: userId || 'u1', image: null })
}));

import SideBar from './SideBar';

const sampleUserLoggedOut = { isLogged: false, userId: null };
const sampleUserLoggedIn = { isLogged: true, userId: 'u1' };
const sampleAdminUsers = [];

function renderWithProviders({ isOpen = true, user = sampleUserLoggedOut, adminUsers = sampleAdminUsers, history = createMemoryHistory() } = {}) {
  return render(
    <Router history={history}>
      <UserContext.Provider value={user}>
        <DispatchContext.Provider value={jest.fn()}>
          <AdminUsersContext.Provider value={{ adminUsers, reloadFlag: false }}>
            <SideBar isOpen={isOpen} toggle={jest.fn()} />
          </AdminUsersContext.Provider>
        </DispatchContext.Provider>
      </UserContext.Provider>
    </Router>
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('SideBar', () => {
  it('renders Home, Explore and Users links with correct hrefs', () => {
    const history = createMemoryHistory();
    renderWithProviders({ history });

    const homeLink = screen.getByText(/Home/i).closest('a');
    const exploreLink = screen.getByText(/Explore/i).closest('a');
    const usersLink = screen.getByText(/Users/i).closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(exploreLink).toHaveAttribute('href', '/tweets');
    expect(usersLink).toHaveAttribute('href', '/users');

    const sidebar = document.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies "is-open" class when isOpen is true and not when false', () => {
    const history = createMemoryHistory();
    const { container: c1 } = renderWithProviders({ isOpen: true, history });
    expect(c1.querySelector('.sidebar')).toHaveClass('is-open');

    const { container: c2 } = renderWithProviders({ isOpen: false, history });
    expect(c2.querySelector('.sidebar')).not.toHaveClass('is-open');
  });

  it('navigates when a link is clicked', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    renderWithProviders({ isOpen: true, history });

    await userEvent.click(screen.getByText(/Explore/i));
    expect(history.location.pathname).toBe('/tweets');

    await userEvent.click(screen.getByText(/Users/i));
    expect(history.location.pathname).toBe('/users');
  });

  it('shows profile link and tweet button when logged in', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    renderWithProviders({ isOpen: true, user: sampleUserLoggedIn, history });

    expect(screen.getByText(/Profile/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Tweet/i })).toBeInTheDocument();
  });
});
