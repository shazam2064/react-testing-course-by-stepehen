import React from 'react';
import { render, fireEvent, screen, waitFor, within } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditProduct from './AddEditProduct';
import { ProductsContext, DispatchContext } from '../../contexts/products.context';
import { UserContext } from '../../contexts/user.context';

// Mock hooks
jest.mock('../../rest/useRestProducts', () => ({
  useCreateProduct: () => jest.fn(() => Promise.resolve()),
  useUpdateProduct: () => jest.fn(() => Promise.resolve())
}));

const mockProducts = [
  {
    _id: '1',
    name: 'Test Product',
    price: 10,
    description: 'Test Description',
    imageUrl: 'images/test.jpg'
  }
];

const renderWithProviders = (
  ui,
  {
    products = [],
    dispatch = jest.fn(),
    user = { isAdmin: true },
    route = '/admin/add-product',
    prodId = null
  } = {}
) => {
  const history = createMemoryHistory();
  history.push(route);
  const match = { params: prodId ? { prodId } : {} };

  return render(
    <UserContext.Provider value={user}>
      <ProductsContext.Provider value={products}>
        <DispatchContext.Provider value={dispatch}>
          <Router history={history}>
            <AddEditProduct match={match} history={history} />
          </Router>
        </DispatchContext.Provider>
      </ProductsContext.Provider>
    </UserContext.Provider>
  );
};

beforeEach(() => {
  jest.resetModules();
  window.alert = jest.fn();
});

describe('AddEditProduct', () => {
  it('renders Add Product form for admin', () => {
    renderWithProviders(<AddEditProduct />, { products: [], user: { isAdmin: true } });
    // There are two "Add Product" texts (heading and button)
    expect(screen.getAllByText(/Add Product/i)).toHaveLength(2);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Add Product/i })).toBeInTheDocument();
  });

  it('renders Edit Product form for admin', () => {
    renderWithProviders(<AddEditProduct />, {
      products: mockProducts,
      user: { isAdmin: true },
      route: '/admin/edit-product/1',
      prodId: '1'
    });
    // Heading and button both display "Edit Product" in edit mode
    expect(screen.getAllByText(/Edit Product/i)).toHaveLength(2);
    expect(screen.getByLabelText(/Name/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Price/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Image/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Edit Product/i })).toBeInTheDocument();
  });

  it('shows access denied for non-admin', () => {
    renderWithProviders(<AddEditProduct />, { user: { isAdmin: false } });
    expect(screen.getByText(/Access denied/i)).toBeInTheDocument();
  });

  it('validates form and shows alert on missing fields', async () => {
    window.alert = jest.fn();
    renderWithProviders(<AddEditProduct />, { products: [], user: { isAdmin: true } });
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: '' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '0' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: '' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
    });
  });

  it('submits form and redirects on success', async () => {
    const history = createMemoryHistory();
    history.push('/admin/add-product');
    window.alert = jest.fn();
    render(
      <UserContext.Provider value={{ isAdmin: true }}>
        <ProductsContext.Provider value={[]}>
          <DispatchContext.Provider value={jest.fn()}>
            <Router history={history}>
              <AddEditProduct match={{ params: {} }} history={history} />
            </Router>
          </DispatchContext.Provider>
        </ProductsContext.Provider>
      </UserContext.Provider>
    );
    fireEvent.change(screen.getByLabelText(/Name/i), { target: { value: 'New Product' } });
    fireEvent.change(screen.getByLabelText(/Price/i), { target: { value: '20' } });
    fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'A new product' } });
    fireEvent.click(screen.getByRole('button', { name: /Add Product/i }));
    await waitFor(() => {
      expect(history.location.pathname).toBe('/admin/admin-products');
    });
  });
});
