import React from 'react';
import { render, fireEvent, waitFor, screen } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import Topbar from './Topbar';
import { UserContext, DispatchContext } from '../../../contexts/user.context';

jest.mock('../../../rest/useRestAdminUsers', () => ({
  useDeleteAdminUser: jest.fn()
}));

const { useDeleteAdminUser } = require('../../../rest/useRestAdminUsers');

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

  it('shows email, Logout and dropdown items when logged in', () => {
    const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
    renderWithProviders(user);
    expect(screen.getByText('test@example.com')).toBeInTheDocument();
    expect(screen.getByText('Logout')).toBeInTheDocument();
    // dropdown items should be present
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Edit')).toBeInTheDocument();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  it('shows admin routes when user is admin', () => {
    const user = { isLogged: true, email: 'admin@example.com', userId: '2', isAdmin: true };
    renderWithProviders(user);
    expect(screen.getByText('Users')).toBeInTheDocument();
    expect(screen.getByText('Add User')).toBeInTheDocument();
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

  it('deletes user successfully and logs out + redirects', async () => {
    const mockDelete = jest.fn().mockResolvedValueOnce({});
    useDeleteAdminUser.mockReturnValue(mockDelete);

    const dispatch = jest.fn();
    const user = { isLogged: true, email: 'test@example.com', userId: 'u1', isAdmin: false };
    const { history } = renderWithProviders(user, dispatch);

    // Click the dropdown toggle (email) to expose delete (some renderers show items regardless)
    fireEvent.click(screen.getByText(user.email));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(user.userId);
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
      expect(history.location.pathname).toBe('/login');
    });
  });

  it('shows alert on delete failure and does not dispatch logout', async () => {
    const mockDelete = jest.fn().mockRejectedValueOnce(new Error('delete failed'));
    useDeleteAdminUser.mockReturnValue(mockDelete);

    const dispatch = jest.fn();
    const user = { isLogged: true, email: 'test@example.com', userId: 'u1', isAdmin: false };
    renderWithProviders(user, dispatch);

    const alertSpy = jest.spyOn(window, 'alert').mockImplementation(() => {});

    fireEvent.click(screen.getByText(user.email));
    fireEvent.click(screen.getByText('Delete'));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(user.userId);
      expect(alertSpy).toHaveBeenCalledWith(expect.stringContaining('User could not be deleted'));
      expect(dispatch).not.toHaveBeenCalledWith({ type: 'LOGOUT' });
    });

    alertSpy.mockRestore();
  });
});

