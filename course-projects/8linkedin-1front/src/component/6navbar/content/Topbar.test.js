import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Topbar from './Topbar';
import { UserContext, DispatchContext } from '../../../contexts/user.context';

jest.mock('../../../rest/useRestAdminUsers', () => ({
  useDeleteAdminUser: jest.fn()
}));

function renderWithProviders(userValue, dispatchValue = jest.fn(), history = createMemoryHistory()) {
  const utils = render(
    <Router history={history}>
      <UserContext.Provider value={userValue}>
        <DispatchContext.Provider value={dispatchValue}>
          <Topbar toggleSidebar={jest.fn()} />
        </DispatchContext.Provider>
      </UserContext.Provider>
    </Router>
  );
  return { ...utils, history, dispatchValue };
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('Topbar component', () => {
  it('shows Login and Signup when not logged in', () => {
    renderWithProviders({ isLogged: false });
    expect(screen.getByText('Login')).toBeInTheDocument();
    expect(screen.getByText('Signup')).toBeInTheDocument();
  });

  it('shows Logout when logged in and hides Login/Signup', () => {
    const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
    renderWithProviders(user);
    expect(screen.getByText('Logout')).toBeInTheDocument();
    expect(screen.queryByText('Login')).toBeNull();
    expect(screen.queryByText('Signup')).toBeNull();
  });

  it('calls dispatch LOGOUT and redirects on Logout click', () => {
    const dispatch = jest.fn();
    const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
    const history = createMemoryHistory();
    const { getByText } = render(
      <Router history={history}>
        <UserContext.Provider value={user}>
          <DispatchContext.Provider value={dispatch}>
            <Topbar toggleSidebar={jest.fn()} />
          </DispatchContext.Provider>
        </UserContext.Provider>
      </Router>
    );

    fireEvent.click(getByText('Logout'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    expect(history.location.pathname).toBe('/login');
  });

  it('navigates to tweet search when search term provided', () => {
    const user = { isLogged: false };
    const history = createMemoryHistory({ initialEntries: ['/'] });
    const { container } = renderWithProviders(user, jest.fn(), history);
    const input = screen.getByPlaceholderText('Search...');
    fireEvent.change(input, { target: { value: 'hello' } });

    const searchIcon = container.querySelector('.search-icon');
    fireEvent.click(searchIcon);

    expect(history.location.pathname).toBe('/tweet/hello');
  });
});
