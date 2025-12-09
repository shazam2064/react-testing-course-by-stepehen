import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditProduct from './AddEditProduct';
import { TitleContext } from '../../contexts/title.context';
import { UserContext } from '../../contexts/user.context';
import { ClassificationsContext, DispatchContext } from '../../contexts/classifications.context';
import { MemoryRouter, Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFetchById = jest.fn();
const mockFetchClassifications = jest.fn();

jest.mock('../../rest/useRestProducts', () => ({
  useCreateProduct: () => mockCreate,
  useUpdateProduct: () => mockUpdate,
  useFetchProductById: () => mockFetchById,
}));

jest.mock('../../rest/useRestClassifications', () => ({
  useFetchClassifications: () => mockFetchClassifications,
}));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

// render helper: supports Router+Route (history+routePath) to inject match.params, Router-only for navigation, or MemoryRouter default
const renderWithProviders = (
  ui,
  { user = { isAdmin: true }, classifications = [], mockSetTitle = jest.fn(), dispatch = jest.fn() } = {},
  history = null,
  routePath = null
) => {
  const Wrapper = ({ children }) => (
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={user}>
        <ClassificationsContext.Provider value={classifications}>
          <DispatchContext.Provider value={dispatch}>
            {children}
          </DispatchContext.Provider>
        </ClassificationsContext.Provider>
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
    return render(
      <Wrapper>
        <Router history={history}>{ui}</Router>
      </Wrapper>
    );
  }

  return render(
    <Wrapper>
      <MemoryRouter>{ui}</MemoryRouter>
    </Wrapper>
  );
};

describe('AddEditProduct', () => {
  it('renders form fields in add mode and sets title', () => {
    const mockSetTitle = jest.fn();
    renderWithProviders(<AddEditProduct />, { mockSetTitle });

    expect(screen.getByLabelText(/Classification/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Version:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(mockSetTitle).toHaveBeenCalled();
  });

  it('shows unauthorized message when user is not admin', () => {
    renderWithProviders(<AddEditProduct />, { user: { isAdmin: false } });
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('creates product on submit and navigates on success', async () => {
    mockFetchClassifications.mockResolvedValueOnce([]);
    mockCreate.mockResolvedValueOnce({});
    const mockSetTitle = jest.fn();
    const history = createMemoryHistory();
    renderWithProviders(<AddEditProduct />, { mockSetTitle }, history);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test Product' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Prod desc' } });
    fireEvent.change(screen.getByLabelText(/Version:/i), { target: { value: '1' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Product', description: 'Prod desc' }));
      expect(history.location.pathname).toBe('/admin/products');
    });
  });

  it('shows error alert when create fails', async () => {
    mockFetchClassifications.mockResolvedValueOnce([]);
    mockCreate.mockRejectedValueOnce(new Error('Create failed'));

    renderWithProviders(<AddEditProduct />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Bad' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Product could not be created/i)).toBeInTheDocument();
      expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
    });
  });

  it('loads product in edit mode, updates it and navigates on success', async () => {
    const product = { _id: 'p1', name: 'Existing', description: 'Existing desc', version: 2, classification: { _id: 'cl1' } };
    mockFetchById.mockResolvedValueOnce(product);
    mockFetchClassifications.mockResolvedValueOnce([{ _id: 'cl1', name: 'C1' }]);
    mockUpdate.mockResolvedValueOnce({});
    const mockSetTitle = jest.fn();

    const history = createMemoryHistory({ initialEntries: ['/admin/products/edit/p1'] });
    const routePath = '/admin/products/edit/:productId';

    renderWithProviders(<AddEditProduct />, { mockSetTitle }, history, routePath);

    // Wait for fetch to populate form
    await waitFor(() => expect(screen.getByLabelText(/Name:/i).value).toBe('Existing'));
    expect(screen.getByLabelText(/Description:/i).value).toBe('Existing desc');
    expect(screen.getByLabelText(/Version:/i).value).toBe(String(product.version));
    expect(mockSetTitle).toHaveBeenCalledWith(expect.stringContaining('Edit Product'));

    // Update and submit
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Existing Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ _id: 'p1', name: 'Existing Updated' }));
      expect(history.location.pathname).toBe('/admin/products');
    });
  });

  it('shows error when fetch in edit mode fails', async () => {
    mockFetchById.mockRejectedValueOnce(new Error('Fetch failed'));
    mockFetchClassifications.mockResolvedValueOnce([]);
    const history = createMemoryHistory({ initialEntries: ['/admin/products/edit/bad'] });
    const routePath = '/admin/products/edit/:productId';

    renderWithProviders(<AddEditProduct />, {}, history, routePath);

    await waitFor(() => {
      expect(screen.getByText(/Product could not be fetched/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });
});

