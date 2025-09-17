import React from 'react';
import { render, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import NavbarComponent from './Navbar';
import { UserContext, DispatchContext } from '../contexts/user.context';

function renderWithProviders(userValue, dispatchValue = jest.fn()) {
  const history = createMemoryHistory();
  return render(
    <Router history={history}>
      <UserContext.Provider value={userValue}>
        <DispatchContext.Provider value={dispatchValue}>
          <NavbarComponent />
        </DispatchContext.Provider>
      </UserContext.Provider>
    </Router>
  );
}

describe('Navbar', () => {
  it('shows login and signup when not logged in', () => {
    const { getByText } = renderWithProviders({ isLogged: false });
    expect(getByText('Login')).toBeInTheDocument();
    expect(getByText('Signup')).toBeInTheDocument();
  });

  it('shows logout and user dropdown when logged in', () => {
    const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
    const { getByText } = renderWithProviders(user);
    expect(getByText('Logout')).toBeInTheDocument();
    expect(getByText('test@example.com')).toBeInTheDocument();
    expect(getByText('Edit')).toBeInTheDocument();
    expect(getByText('Delete')).toBeInTheDocument();
  });

  it('shows admin links when user is admin', () => {
    const user = { isLogged: true, email: 'admin@example.com', userId: '2', isAdmin: true };
    const { getByText } = renderWithProviders(user);
    expect(getByText('Add Product')).toBeInTheDocument();
    expect(getByText('Admin Products')).toBeInTheDocument();
    expect(getByText('Users')).toBeInTheDocument();
    expect(getByText('Add User')).toBeInTheDocument();
  });

  it('calls logout dispatch and redirects on logout', () => {
    const dispatch = jest.fn();
    const user = { isLogged: true, email: 'test@example.com', userId: '1', isAdmin: false };
    const history = createMemoryHistory();
    const { getByText } = render(
      <Router history={history}>
        <UserContext.Provider value={user}>
          <DispatchContext.Provider value={dispatch}>
            <NavbarComponent />
          </DispatchContext.Provider>
        </UserContext.Provider>
      </Router>
    );
    fireEvent.click(getByText('Logout'));
    expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    expect(history.location.pathname).toBe('/login');
  });
});

