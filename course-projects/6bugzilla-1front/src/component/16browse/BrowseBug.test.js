import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import BrowseBug from './BrowseBug';
import { TitleContext } from '../../contexts/title.context';
import { ComponentsContext } from '../../contexts/components.context';
import { ProductsContext } from '../../contexts/products.context';
import { BugsContext } from '../../contexts/bugs.context';

const mockFetchComponents = jest.fn();
const mockFetchBugs = jest.fn();

jest.mock('../../rest/useRestComponent', () => ({
  useFetchComponents: () => mockFetchComponents,
}));

jest.mock('../../rest/useRestBugs', () => ({
  useFetchBugs: () => mockFetchBugs,
}));

// simple BugItem mock so tests can assert rows
jest.mock('../15search-bugs/BugItem', () => ({ bug }) => (
  <tr data-testid="bug-item">
    <td><a href={`/bugs/${bug._id}`}>{bug.summary || ''}</a></td>
  </tr>
));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const renderWithProvidersAndRoute = (
  { components = [], products = [], bugs = [] } = {},
  route = '/browse/comp1',
  routePath = '/browse/:componentId'
) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  const mockSetTitle = jest.fn();

  return {
    history,
    ...render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <ComponentsContext.Provider value={components}>
          <ProductsContext.Provider value={products}>
            <BugsContext.Provider value={bugs}>
              <Router history={history}>
                <Route path={routePath} component={BrowseBug} />
              </Router>
            </BugsContext.Provider>
          </ProductsContext.Provider>
        </ComponentsContext.Provider>
      </TitleContext.Provider>
    ),
  };
};

test('renders heading and bug rows when component/product present and bugs match', async () => {
  const components = [{ _id: 'comp1', name: 'Comp One', product: { _id: 'prod1', name: 'ProdX' } }];
  const bugs = [
    { _id: 'b1', summary: 'Bug One', component: { _id: 'comp1' } },
    { _id: 'b2', summary: 'Other Bug', component: { _id: 'other' } },
  ];

  mockFetchComponents.mockResolvedValueOnce(components);
  mockFetchBugs.mockResolvedValueOnce(bugs);

  renderWithProvidersAndRoute({ components, products: [{ _id: 'prod1', name: 'ProdX' }], bugs }, '/browse/comp1');

  // wait for fetch hooks to be called and UI to render
  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  // heading should include component and product names
  expect(screen.getByText(/Comp One/)).toBeInTheDocument();
  expect(screen.getByText(/ProdX/)).toBeInTheDocument();

  // only one matching bug row should render
  const rows = await screen.findAllByTestId('bug-item');
  expect(rows.length).toBe(1);

  // ensure the bug link targets the bug detail route
  const link = rows[0].querySelector('a');
  expect(link).toHaveAttribute('href', '/bugs/b1');
});

test('shows "No bugs found for this component." when no bugs match', async () => {
  const components = [{ _id: 'comp1', name: 'Comp One', product: { _id: 'prod1', name: 'ProdX' } }];
  mockFetchComponents.mockResolvedValueOnce(components);
  mockFetchBugs.mockResolvedValueOnce([]); // no bugs

  renderWithProvidersAndRoute({ components }, '/browse/comp1');

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(await screen.findByText(/No bugs found for this component\./i)).toBeInTheDocument();
});

test('shows "Component or Product not found" when component or product missing', async () => {
  // provide no components so selectedComponent will be undefined
  mockFetchComponents.mockResolvedValueOnce([]);
  mockFetchBugs.mockResolvedValueOnce([]);

  renderWithProvidersAndRoute({ components: [] }, '/browse/missing');

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(screen.getByText(/Component or Product not found/i)).toBeInTheDocument();
});

test('displays error alert when fetchComponents fails', async () => {
  mockFetchComponents.mockRejectedValueOnce(new Error('Components failed'));
  mockFetchBugs.mockResolvedValueOnce([]); // harmless

  renderWithProvidersAndRoute({}, '/browse/comp1');

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  expect(await screen.findByText(/An error occurred/i)).toBeInTheDocument();
  expect(screen.getByText(/Components failed/i)).toBeInTheDocument();
});

test('displays error alert when fetchBugs fails', async () => {
  const components = [{ _id: 'comp1', name: 'Comp One', product: { _id: 'prod1', name: 'ProdX' } }];
  mockFetchComponents.mockResolvedValueOnce(components);
  mockFetchBugs.mockRejectedValueOnce(new Error('Bugs failed'));

  renderWithProvidersAndRoute({ components }, '/browse/comp1');

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(await screen.findByText(/An error occurred/i)).toBeInTheDocument();
  expect(screen.getByText(/Bugs failed/i)).toBeInTheDocument();
});

