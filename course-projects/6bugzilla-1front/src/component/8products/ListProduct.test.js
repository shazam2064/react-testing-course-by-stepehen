import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ListProduct from './ListProduct';
import { ProductsContext, DispatchContext } from '../../contexts/products.context';
import { UserContext } from '../../contexts/user.context';
import { TitleContext } from '../../contexts/title.context';
import * as restHooks from '../../rest/useRestProducts';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

jest.mock('./ProductItem', () => ({ product, actionButtons }) => (
  <tr data-testid="product-item">
    <td>{product.name}</td>
    <td>{product.description}</td>
    <td>{product.version}</td>
    <td>{product.classification ? product.classification.name || product.classification : ''}</td>
    <td>{product.components ? product.components.length : 0}</td>
    <td>{actionButtons}</td>
  </tr>
));

const mockDispatch = jest.fn();
const mockFetchProducts = jest.fn();
const mockDeleteProduct = jest.fn();

const loggedUser = { userId: 'admin-1', isAdmin: true };

function renderWithProviders(products = [], fetchImpl, deleteImpl, history = createMemoryHistory(), mockSetTitle = jest.fn()) {
  jest.spyOn(restHooks, 'useFetchProducts').mockReturnValue(fetchImpl || mockFetchProducts);
  jest.spyOn(restHooks, 'useDeleteProduct').mockReturnValue(deleteImpl || mockDeleteProduct);

  return render(
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={loggedUser}>
        <ProductsContext.Provider value={products}>
          <DispatchContext.Provider value={mockDispatch}>
            <Router history={history}>
              <ListProduct />
            </Router>
          </DispatchContext.Provider>
        </ProductsContext.Provider>
      </UserContext.Provider>
    </TitleContext.Provider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

test('renders products and action buttons', async () => {
  const products = [
    { _id: 'p1', name: 'Product A', description: 'Desc A', version: 1, classification: { name: 'C1' }, components: ['c1'] },
    { _id: 'p2', name: 'Product B', description: 'Desc B', version: 2, classification: { name: 'C2' }, components: [] }
  ];
  mockFetchProducts.mockResolvedValueOnce(products);

  renderWithProviders(products);

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());

  expect(screen.getAllByTestId('product-item').length).toBe(products.length);
  expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
  expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
});

test('shows "No products found" when list is empty', async () => {
  mockFetchProducts.mockResolvedValueOnce([]);
  renderWithProviders([]);

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
  expect(screen.getByText(/No products found/i)).toBeInTheDocument();
});

test('shows error alert when fetch fails', async () => {
  mockFetchProducts.mockRejectedValueOnce(new Error('Fetch failed'));
  renderWithProviders([]);

  await waitFor(() => {
    expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
  });
});

test('Add Product button navigates to add page', async () => {
  mockFetchProducts.mockResolvedValueOnce([]);
  const history = createMemoryHistory();
  renderWithProviders([], undefined, undefined, history);

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());

  fireEvent.click(screen.getByText(/Add Product/i));
  expect(history.location.pathname).toBe('/admin/add-product');
});

test('edit button navigates to edit page', async () => {
  const products = [{ _id: 'p1', name: 'Product A', description: 'Desc A', version: 1, classification: {}, components: [] }];
  mockFetchProducts.mockResolvedValueOnce(products);
  const history = createMemoryHistory();
  renderWithProviders(products, undefined, undefined, history);

  await waitFor(() => {
    expect(mockFetchProducts).toHaveBeenCalled();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Edit'));
  expect(history.location.pathname).toBe('/admin/edit-product/p1');
});

test('delete button calls deleteProduct and dispatches and refreshes', async () => {
  const products = [{ _id: 'p1', name: 'Product A', description: 'Desc A', version: 1, classification: {}, components: [] }];
  mockFetchProducts.mockResolvedValueOnce(products);
  mockDeleteProduct.mockResolvedValueOnce();

  renderWithProviders(products);

  await waitFor(() => {
    expect(mockFetchProducts).toHaveBeenCalled();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => expect(mockDeleteProduct).toHaveBeenCalledWith('p1'));
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_PRODUCT', payload: { _id: 'p1' } });
});

