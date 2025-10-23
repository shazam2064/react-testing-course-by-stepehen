import React from 'react';
import { render, fireEvent, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddEditUser from './AddEditUser';
import { AdminUsersContext } from '../../contexts/admin-users.context';
import { UserContext } from '../../contexts/user.context';

const adminUsersValue = [];
const userValue = { isAdmin: true };

const defaultProps = {
  match: { params: {} },
  history: { push: jest.fn() }
};

function renderWithProviders(ui, props = {}) {
  return render(
      <MemoryRouter>
        <AdminUsersContext.Provider value={adminUsersValue}>
          <UserContext.Provider value={userValue}>
            <AddEditUser {...defaultProps} {...props} />
          </UserContext.Provider>
        </AdminUsersContext.Provider>
      </MemoryRouter>
  );
}

describe('AddEditUser', () => {
  it('renders form fields', () => {
    renderWithProviders(<AddEditUser />);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('submits form', () => {
    renderWithProviders(<AddEditUser />);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button'));
  });
});

