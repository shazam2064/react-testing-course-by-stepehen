import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import SearchBug from './SearchBug';
import { BugsContext, DispatchContext } from '../../contexts/bugs.context';
import { TitleContext } from '../../contexts/title.context';

const mockFetchBugs = jest.fn();

jest.mock('../../rest/useRestBugs', () => ({
  useFetchBugs: () => mockFetchBugs,
}));

// Simple mock for BugItem to expose summary text and a predictable link for assertions
jest.mock('./BugItem', () => ({ bug }) => (
  <tr data-testid="bug-item">
    <td>
      <a href={`/bugs/${bug._id}`}>{bug.summary}</a>
    </td>
  </tr>
));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

const renderWithProvidersAndRoute = (route, routePath = '/search-bug/:query') => {
  const history = createMemoryHistory({ initialEntries: [route] });
  const mockDispatch = jest.fn();
  const mockSetTitle = jest.fn();

  render(
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <BugsContext.Provider value={[]}>
        <DispatchContext.Provider value={mockDispatch}>
          <Router history={history}>
            <Route path={routePath} component={SearchBug} />
          </Router>
        </DispatchContext.Provider>
      </BugsContext.Provider>
    </TitleContext.Provider>
  );

  return { history, mockDispatch, mockSetTitle };
};

test('when query present and fetch resolves, shows bug rows and links', async () => {
  const bugs = [
    { _id: 'b1', summary: 'First bug', product: { name: 'P' }, component: { name: 'C' }, assignee: { name: '' }, reporter: { email: '' }, status: '', severity: '', priority: '', hardware: '', os: '', description: '' },
    { _id: 'b2', summary: 'Second bug', product: { name: 'P' }, component: { name: 'C' }, assignee: { name: '' }, reporter: { email: '' }, status: '', severity: '', priority: '', hardware: '', os: '', description: '' }
  ];
  mockFetchBugs.mockResolvedValueOnce(bugs);

  renderWithProvidersAndRoute('/search-bug/First');

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  // two mocked BugItem rows
  const items = screen.getAllByTestId('bug-item');
  expect(items.length).toBe(2);

  // link for first bug points to /bugs/b1
  const link = screen.getByText('First bug').closest('a');
  expect(link).toHaveAttribute('href', '/bugs/b1');
});

test('when query present and fetch resolves empty, shows "No bugs found."', async () => {
  mockFetchBugs.mockResolvedValueOnce([]);

  renderWithProvidersAndRoute('/search-bug/nomatch');

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(screen.getByText(/No bugs found\./i)).toBeInTheDocument();
});

test('when fetch rejects, shows error alert with message', async () => {
  mockFetchBugs.mockRejectedValueOnce(new Error('Fetch failed'));

  renderWithProvidersAndRoute('/search-bug/errorcase');

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
  expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

test('clicking search with non-empty input navigates to /search-bug/<term>', async () => {
  // Start at search page without query
  const { history } = renderWithProvidersAndRoute('/search-bug/');

  // find input and button (SearchBug uses span with onClick)
  const input = screen.getByPlaceholderText(/Search bugs.../i);
  fireEvent.change(input, { target: { value: 'findme' } });

  const btn = screen.getByText(/Search Bugs/i);
  fireEvent.click(btn);

  // expect navigation to new route
  await waitFor(() => {
    expect(history.location.pathname).toBe('/search-bug/findme');
  });
});

test('clicking search with empty input does not navigate', async () => {
  const { history } = renderWithProvidersAndRoute('/search-bug/');

  const input = screen.getByPlaceholderText(/Search bugs.../i);
  fireEvent.change(input, { target: { value: '' } });

  const btn = screen.getByText(/Search Bugs/i);
  fireEvent.click(btn);

  // small wait to allow any push (there should be none)
  await waitFor(() => {
    expect(history.location.pathname).toBe('/search-bug/');
  });
});

