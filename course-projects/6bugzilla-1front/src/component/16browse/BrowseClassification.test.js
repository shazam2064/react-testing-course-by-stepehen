import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import BrowseClassification from './BrowseClassification';
import { TitleContext } from '../../contexts/title.context';
import { ClassificationsContext, DispatchContext } from '../../contexts/classifications.context';

const mockFetchClassifications = jest.fn();

jest.mock('../../rest/useRestClassifications', () => ({
  useFetchClassifications: () => mockFetchClassifications,
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const renderWithRouterAndProviders = (classifications = [], history = createMemoryHistory({ initialEntries: ['/browse-classifications'] })) => {
  const mockSetTitle = jest.fn();
  const mockDispatch = jest.fn();

  return {
    history,
    ...render(
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <ClassificationsContext.Provider value={classifications}>
          <DispatchContext.Provider value={mockDispatch}>
            <Router history={history}>
              <Route path="/browse-classifications" render={(props) => React.cloneElement(<BrowseClassification />, props)} />
            </Router>
          </DispatchContext.Provider>
        </ClassificationsContext.Provider>
      </TitleContext.Provider>
    ),
    mockDispatch,
    mockSetTitle
  };
};

test('renders classifications and navigates when product clicked', async () => {
  const classifications = [
    {
      _id: 'cl1',
      name: 'Category 1',
      description: 'Desc 1',
      products: [{ _id: 'p1', name: 'Prod 1', description: 'Pdesc' }]
    }
  ];
  mockFetchClassifications.mockResolvedValueOnce(classifications);

  const { history, mockDispatch, mockSetTitle } = renderWithRouterAndProviders(classifications);

  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());
  // title set
  expect(mockSetTitle).toHaveBeenCalled();

  // product link present
  expect(screen.getByText(/Prod 1/)).toBeInTheDocument();

  // click product link navigates to /browse-prod/p1
  fireEvent.click(screen.getByText(/Prod 1/));
  await waitFor(() => expect(history.location.pathname).toBe('/browse-prod/p1'));

  // dispatch should have been called by effect
  expect(typeof mockDispatch).toBe('function');
  expect(mockDispatch).toHaveBeenCalled();
});

test('shows "No classifications found." when none returned', async () => {
  mockFetchClassifications.mockResolvedValueOnce([]);
  renderWithRouterAndProviders([]);

  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());
  expect(screen.getByText(/No classifications found\./i)).toBeInTheDocument();
});

test('displays error alert when fetch fails', async () => {
  mockFetchClassifications.mockRejectedValueOnce(new Error('Fetch failed'));
  renderWithRouterAndProviders([]);

  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());
  expect(await screen.findByText(/An error occurred/i)).toBeInTheDocument();
  expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
});

