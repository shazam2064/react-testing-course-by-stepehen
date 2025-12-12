import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditBug from './AddEditBug';
import { TitleContext } from '../../contexts/title.context';
import { UserContext } from '../../contexts/user.context';
import * as restBugs from '../../rest/useRestBugs';
import * as restProducts from '../../rest/useRestProducts';
import * as restComponents from '../../rest/useRestComponent';
import * as restUsers from '../../rest/useRestAdminUsers';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFetchById = jest.fn();
const mockFetchProducts = jest.fn();
const mockFetchComponents = jest.fn();
const mockFetchUsers = jest.fn();
const mockFetchBugs = jest.fn().mockResolvedValue([]);

jest.mock('../../rest/useRestBugs', () => ({
  useCreateBug: () => mockCreate,
  useUpdateBug: () => mockUpdate,
  useFetchBugById: () => mockFetchById,
  useFetchBugs: () => mockFetchBugs,
}));

jest.mock('../../rest/useRestProducts', () => ({
  useFetchProducts: () => mockFetchProducts,
}));

jest.mock('../../rest/useRestComponent', () => ({
  useFetchComponents: () => mockFetchComponents,
}));

jest.mock('../../rest/useRestAdminUsers', () => ({
  useFetchAdminUsers: () => mockFetchUsers,
}));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

// render helper: supports Router+Route (history+routePath) to inject match.params, Router-only for navigation, or default render
const renderWithProviders = (
  ui,
  { user = { isAdmin: true }, mockSetTitle = jest.fn() } = {},
  history = null,
  routePath = null
) => {
  const Wrapper = ({ children }) => (
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={user}>
        {children}
      </UserContext.Provider>
    </TitleContext.Provider>
  );

  if (history && routePath) {
    return render(
      <Wrapper>
        <Router history={history}>
          <Route path={routePath} render={(routeProps) => React.cloneElement(ui, routeProps)} />
        </Router>
      </Wrapper>
    );
  }

  if (history) {
    // ensure component gets history prop via route render
    return render(
      <Wrapper>
        <Router history={history}>
          <Route path="/" render={(routeProps) => React.cloneElement(ui, routeProps)} />
        </Router>
      </Wrapper>
    );
  }

  return render(
    <Wrapper>
      {ui}
    </Wrapper>
  );
};

describe('AddEditBug', () => {
  it('renders form fields in add mode and sets title', async () => {
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchComponents.mockResolvedValueOnce([]);
    mockFetchUsers.mockResolvedValueOnce([]);

    const mockSetTitle = jest.fn();
    renderWithProviders(<AddEditBug />, { mockSetTitle });

    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(screen.getByLabelText(/Summary/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(mockSetTitle).toHaveBeenCalled();
    await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchUsers).toHaveBeenCalled());
  });

  it('shows unauthorized message when user is not admin', () => {
    renderWithProviders(<AddEditBug />, { user: { isAdmin: false } });
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('creates bug on submit and navigates on success', async () => {
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchComponents.mockResolvedValueOnce([]);
    mockFetchUsers.mockResolvedValueOnce([]);
    mockCreate.mockResolvedValueOnce({});

    const history = createMemoryHistory();
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditBug />, { mockSetTitle }, history);

    fireEvent.change(screen.getByLabelText(/Summary/i), { target: { value: 'Test Bug' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Bug description' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ summary: 'Test Bug', description: 'Bug description' }));
      expect(history.location.pathname).toBe('/admin/bugs');
    });
  });

  it('shows error alert when create fails', async () => {
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchComponents.mockResolvedValueOnce([]);
    mockFetchUsers.mockResolvedValueOnce([]);
    mockCreate.mockRejectedValueOnce(new Error('Create failed'));

    renderWithProviders(<AddEditBug />);

    fireEvent.change(screen.getByLabelText(/Summary/i), { target: { value: 'Bad' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Will fail' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/could not be created/i)).toBeInTheDocument();
      expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
    });
  });

  it('loads bug in edit mode, updates it and navigates on success', async () => {
    const bug = { _id: 'b1', summary: 'Existing', description: 'Existing desc' };
    mockFetchById.mockResolvedValueOnce(bug);
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchComponents.mockResolvedValueOnce([]);
    mockFetchUsers.mockResolvedValueOnce([]);
    mockUpdate.mockResolvedValueOnce({});

    const history = createMemoryHistory({ initialEntries: ['/admin/bugs/edit/b1'] });
    const routePath = '/admin/bugs/edit/:bugId';
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditBug />, { mockSetTitle }, history, routePath);

    await waitFor(() => expect(screen.getByLabelText(/Summary/i).value).toBe('Existing'));
    expect(screen.getByLabelText(/Description/i).value).toBe('Existing desc');
    expect(mockSetTitle).toHaveBeenCalledWith(expect.stringContaining('Edit'));

    fireEvent.change(screen.getByLabelText(/Summary/i), { target: { value: 'Existing Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ _id: 'b1', summary: 'Existing Updated' }));
      expect(history.location.pathname).toBe('/admin/bugs');
    });
  });

  it('shows error when fetch in edit mode fails', async () => {
    mockFetchById.mockRejectedValueOnce(new Error('Fetch failed'));
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchComponents.mockResolvedValueOnce([]);
    mockFetchUsers.mockResolvedValueOnce([]);

    const history = createMemoryHistory({ initialEntries: ['/admin/bugs/edit/bad'] });
    const routePath = '/admin/bugs/edit/:bugId';

    renderWithProviders(<AddEditBug />, {}, history, routePath);

    await waitFor(() => {
      expect(screen.getByText(/could not be fetched/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });
});
