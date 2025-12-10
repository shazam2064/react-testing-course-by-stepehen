import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditComponent from './AddEditComponent';
import { TitleContext } from '../../contexts/title.context';
import { UserContext } from '../../contexts/user.context';
import { ComponentsContext } from '../../contexts/components.context';
import { ProductsContext, DispatchContext as ProductsDispatch } from '../../contexts/products.context';
import { AdminUsersContext, DispatchContext as AdminUsersDispatch } from '../../contexts/admin-users.context';
import * as restComp from '../../rest/useRestComponent';
import * as restProducts from '../../rest/useRestProducts';
import * as restUsers from '../../rest/useRestAdminUsers';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFetchById = jest.fn();
const mockFetchProducts = jest.fn();
const mockFetchAdminUsers = jest.fn();

jest.mock('../../rest/useRestComponent', () => ({
  useCreateComponent: () => mockCreate,
  useUpdateComponent: () => mockUpdate,
  useFetchComponentById: () => mockFetchById,
}));

jest.mock('../../rest/useRestProducts', () => ({
  useFetchProducts: () => mockFetchProducts,
}));

jest.mock('../../rest/useRestAdminUsers', () => ({
  useFetchAdminUsers: () => mockFetchAdminUsers,
}));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

// render helper: supports Router+Route (history+routePath) to inject match.params, Router-only for navigation, or MemoryRouter default
const renderWithProviders = (
  ui,
  {
    user = { isAdmin: true },
    components = [],
    products = [],
    adminUsers = [],
    mockSetTitle = jest.fn(),
    productsDispatch = jest.fn(),
    adminUsersDispatch = jest.fn()
  } = {},
  history = null,
  routePath = null
) => {
  const Wrapper = ({ children }) => (
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={user}>
        <ComponentsContext.Provider value={components}>
          <ProductsContext.Provider value={products}>
            <ProductsDispatch.Provider value={productsDispatch}>
              <AdminUsersContext.Provider value={adminUsers}>
                <AdminUsersDispatch.Provider value={adminUsersDispatch}>
                  {children}
                </AdminUsersDispatch.Provider>
              </AdminUsersContext.Provider>
            </ProductsDispatch.Provider>
          </ProductsContext.Provider>
        </ComponentsContext.Provider>
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
    // Render via a Route so routeProps (including history) are injected into the component
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

describe('AddEditComponent', () => {
  it('renders form fields in add mode and sets title', async () => {
    // ensure product/user fetch hooks are available (they may be called in useEffect)
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchAdminUsers.mockResolvedValueOnce([]);
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditComponent />, { mockSetTitle });

    // basic fields
    expect(screen.getByLabelText(/Product/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Assignee/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^CC$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();

    expect(mockSetTitle).toHaveBeenCalled();
    await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());
  });

  it('shows unauthorized message when user is not admin', () => {
    renderWithProviders(<AddEditComponent />, { user: { isAdmin: false } });
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('creates component on submit and navigates on success', async () => {
    const products = [{ _id: 'prod1', name: 'Prod 1' }];
    const users = [{ _id: 'u1', name: 'User 1', email: 'u1@test' }];

    mockFetchProducts.mockResolvedValueOnce(products);
    mockFetchAdminUsers.mockResolvedValueOnce(users);
    mockCreate.mockResolvedValueOnce({});

    const history = createMemoryHistory();
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditComponent />, { products, adminUsers: users, mockSetTitle }, history);

    // wait for selects to populate
    await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
    await waitFor(() => expect(mockFetchAdminUsers).toHaveBeenCalled());

    // fill form
    fireEvent.change(screen.getByLabelText(/Product/i), { target: { value: 'prod1' } });
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Comp A' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Comp desc' } });
    fireEvent.change(screen.getByLabelText(/Assignee/i), { target: { value: 'u1' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Comp A', description: 'Comp desc' }));
      expect(history.location.pathname).toBe('/admin/components');
    });
  });

  it('shows error alert when create fails', async () => {
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchAdminUsers.mockResolvedValueOnce([]);
    mockCreate.mockRejectedValueOnce(new Error('Create failed'));

    renderWithProviders(<AddEditComponent />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Bad' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Component could not be created/i)).toBeInTheDocument();
      expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
    });
  });

  it('loads component in edit mode, updates it and navigates on success', async () => {
    const product = { _id: 'prod1', name: 'Prod 1' };
    const user = { _id: 'u1', name: 'User 1', email: 'u1@test' };
    const component = {
      _id: 'comp1',
      name: 'Existing',
      description: 'Existing desc',
      product: product,
      assignee: user,
      CC: []
    };

    mockFetchById.mockResolvedValueOnce(component);
    mockFetchProducts.mockResolvedValueOnce([product]);
    mockFetchAdminUsers.mockResolvedValueOnce([user]);
    mockUpdate.mockResolvedValueOnce({});

    const history = createMemoryHistory({ initialEntries: ['/admin/components/edit/comp1'] });
    const routePath = '/admin/components/edit/:componentId';
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditComponent />, { mockSetTitle }, history, routePath);

    // Wait for fetches to populate form
    await waitFor(() => expect(mockFetchById).toHaveBeenCalledWith('comp1'));
    await waitFor(() => expect(screen.getByLabelText(/Name:/i).value).toBe('Existing'));

    expect(screen.getByLabelText(/Description:/i).value).toBe('Existing desc');
    expect(mockSetTitle).toHaveBeenCalledWith(expect.stringContaining('Edit Component'));

    // update and submit
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Existing Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ _id: 'comp1', name: 'Existing Updated' }));
      expect(history.location.pathname).toBe('/admin/components');
    });
  });

  it('shows error when fetch in edit mode fails', async () => {
    mockFetchById.mockRejectedValueOnce(new Error('Fetch failed'));
    mockFetchProducts.mockResolvedValueOnce([]);
    mockFetchAdminUsers.mockResolvedValueOnce([]);

    const history = createMemoryHistory({ initialEntries: ['/admin/components/edit/bad'] });
    const routePath = '/admin/components/edit/:componentId';

    renderWithProviders(<AddEditComponent />, {}, history, routePath);

    await waitFor(() => {
      expect(screen.getByText(/Component could not be fetched/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });
});
