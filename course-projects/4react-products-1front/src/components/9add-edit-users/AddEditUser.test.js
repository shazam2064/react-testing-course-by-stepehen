import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditUser from './AddEditUser';

const mockAdminUsers = [];
const mockUser = { isAdmin: true };

jest.mock('../../rest/useRestAdminUsers', () => ({
  useCreateAdminUser: () => jest.fn(() => Promise.resolve()),
  useUpdateAdminUser: () => jest.fn(() => Promise.resolve()),
  useFetchAdminUserById: () => jest.fn(() => Promise.resolve({
    name: 'John Doe',
    email: 'john@example.com',
    password: '',
    status: 'active',
    isAdmin: true
  })),
}));

jest.mock('../../contexts/admin-users.context', () => ({
  AdminUsersContext: React.createContext([]),
}));
jest.mock('../../contexts/user.context', () => ({
  UserContext: React.createContext({ isAdmin: true }),
}));

function renderWithRouter(ui, { route = '/admin/users/add', user = mockUser } = {}) {
  const history = createMemoryHistory({ initialEntries: [route] });
  return render(
    <Router history={history}>
      <AddEditUser
        match={{ params: route.includes('edit') ? { adminUserId: '1' } : {} }}
        history={history}
      />
    </Router>
  );
}

describe('AddEditUser', () => {
  it('renders Add User form for admin', () => {
    renderWithRouter(<AddEditUser />);
    expect(screen.getByText(/Add User/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Status/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Admin/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add User/i })).toBeInTheDocument();
  });

  it('renders Edit User form for admin', async () => {
    renderWithRouter(<AddEditUser />, { route: '/admin/users/edit/1' });
    await waitFor(() => expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument());
    expect(screen.getByText(/Edit User/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update User/i })).toBeInTheDocument();
  });

  it('shows unauthorized message for non-admin', () => {
    jest.spyOn(React, 'useContext').mockImplementation((ctx) => {
      if (ctx.displayName === 'UserContext') return { isAdmin: false };
      return [];
    });
    renderWithRouter(<AddEditUser />);
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('submits the form', async () => {
    renderWithRouter(<AddEditUser />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'Jane' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'jane@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'pass123' } });
    fireEvent.change(screen.getByLabelText(/Status/i), { target: { value: 'active' } });
    fireEvent.click(screen.getByLabelText(/Admin/i));
    fireEvent.click(screen.getByRole('button', { name: /Add User/i }));
    await waitFor(() => {
      expect(window.location.pathname).toMatch(/admin\/users/);
    });
  });
});

