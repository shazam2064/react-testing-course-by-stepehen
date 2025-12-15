import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import BrowseProduct from './BrowseProduct';
import { TitleContext } from '../../contexts/title.context';
import { ProductsContext } from '../../contexts/products.context';
import { UserContext } from '../../contexts/user.context';

const mockFetchProducts = jest.fn();
jest.mock('../../rest/useRestProducts', () => ({
  useFetchProducts: () => mockFetchProducts,
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const renderWithProviders = (
  { products = [], productDispatch = jest.fn(), user = { userId: 'u1', isAdmin: false } } = {},
  route = '/browse-prod/prod1',
  routePath = '/browse-prod/:productId'
) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  const mockSetTitle = jest.fn();

  const ProductsDispatchContext = require('../../contexts/products.context').DispatchContext;

  return {
    history,
    ...render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <ProductsContext.Provider value={products}>
          <ProductsDispatchContext.Provider value={productDispatch}>
            <UserContext.Provider value={user}>
              <Router history={history}>
                <Route path={routePath} component={BrowseProduct} />
              </Router>
            </UserContext.Provider>
          </ProductsDispatchContext.Provider>
        </ProductsContext.Provider>
      </TitleContext.Provider>
    ),
    mockSetTitle
  };
};

test('renders product, components and navigates when links clicked', async () => {
  const product = {
    _id: 'prod1',
    name: 'Product One',
    description: 'Prod desc',
    components: [
      { _id: 'compA', name: 'Comp A', description: 'C desc', assignee: { _id: 'userA', name: 'Alice' } },
      { _id: 'compB', name: 'Comp B', description: 'C2 desc', assignee: { _id: 'userB', name: 'Bob' } }
    ]
  };

  mockFetchProducts.mockResolvedValueOnce([product]);

  const { history } = renderWithProviders({ products: [product] }, '/browse-prod/prod1');

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());

  // product heading and description
  expect(screen.getByText(/Product One/i)).toBeInTheDocument();
  expect(screen.getByText(/Prod desc/i)).toBeInTheDocument();

  // component and assignee links present
  expect(screen.getByText('Comp A')).toBeInTheDocument();
  expect(screen.getByText('Alice')).toBeInTheDocument();

  // clicking component link navigates to bug-browse/:componentId
  fireEvent.click(screen.getByText('Comp A'));
  await waitFor(() => expect(history.location.pathname).toBe('/bug-browse/compA'));

  // go back and click assignee link
  history.push('/browse-prod/prod1');
  await waitFor(() => expect(history.location.pathname).toBe('/browse-prod/prod1'));

  fireEvent.click(screen.getByText('Alice'));
  await waitFor(() => expect(history.location.pathname).toBe('/profile/userA'));
});

test('shows "Product not found" when product missing', async () => {
  // fetch returns no products
  mockFetchProducts.mockResolvedValueOnce([]);
  const { history } = renderWithProviders({ products: [] }, '/browse-prod/missing');

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
  expect(screen.getByText(/Product not found/i)).toBeInTheDocument();
});

test('displays error alert when fetchProducts fails', async () => {
  mockFetchProducts.mockRejectedValueOnce(new Error('Fetch failed'));
  renderWithProviders({ products: [] }, '/browse-prod/prod1');

  await waitFor(() => expect(mockFetchProducts).toHaveBeenCalled());
  expect(await screen.findByText(/An error occurred/i)).toBeInTheDocument();
  expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

