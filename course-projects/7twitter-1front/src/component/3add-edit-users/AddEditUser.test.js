import React from 'react';
import { render, fireEvent, screen, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditUser from './AddEditUser';
import { AdminUsersContext } from '../../contexts/admin-users.context';
import { UserContext } from '../../contexts/user.context';

// Mock rest hooks used by AddEditUser so submits/fetches don't throw
jest.mock('../../rest/useRestAdminUsers', () => ({
  useCreateAdminUser: () => jest.fn().mockResolvedValue({ _id: 'created-id' }),
  useUpdateAdminUser: () => jest.fn().mockResolvedValue({}),
  useFetchAdminUserById: () => jest.fn().mockResolvedValue({}),
}));

const adminUsersValue = { triggerReload: jest.fn() };
const userValue = { isAdmin: true, userId: '1', isLogged: true };

const defaultProps = {
  match: { params: {} }
};

function renderWithProviders(props = {}, history) {
  const usedHistory = history || createMemoryHistory();
  return render(
    <Router history={usedHistory}>
      <AdminUsersContext.Provider value={adminUsersValue}>
        <UserContext.Provider value={userValue}>
          <AddEditUser {...defaultProps} {...props} />
        </UserContext.Provider>
      </AdminUsersContext.Provider>
    </Router>
  );
}

describe('AddEditUser', () => {
  it('renders form fields', () => {
    renderWithProviders();
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Email/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button')).toBeInTheDocument();
  });

  it('submits form and navigates', async () => {
    const history = createMemoryHistory();
    renderWithProviders({}, history);
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'John' } });
    fireEvent.change(screen.getByLabelText(/Email/i), { target: { value: 'john@example.com' } });
    fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
    fireEvent.click(screen.getByRole('button'));

    await waitFor(() => {
      expect(history.location.pathname).toBe('/profile/created-id');
    });
  });
});
