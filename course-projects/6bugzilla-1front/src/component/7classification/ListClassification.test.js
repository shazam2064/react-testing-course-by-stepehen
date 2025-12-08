import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ListClassification from './ListClassification';
import { ClassificationsContext, DispatchContext } from '../../contexts/classifications.context';
import { UserContext } from '../../contexts/user.context';
import { TitleContext } from '../../contexts/title.context';
import * as restHooks from '../../rest/useRestClassifications';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

jest.mock('./ClassificationItem', () => ({ classification, actionButtons }) => (
  <tr data-testid="classification-item">
    <td>{classification.name}</td>
    <td>{classification.description}</td>
    <td>{classification.products ? classification.products.length : 0}</td>
    <td>{actionButtons}</td>
  </tr>
));

const mockDispatch = jest.fn();
const mockFetchClassifications = jest.fn();
const mockDeleteClassification = jest.fn();

const loggedUser = { userId: 'admin-1', isAdmin: true };

function renderWithProviders(classifications = [], fetchImpl, deleteImpl, history = createMemoryHistory(), mockSetTitle = jest.fn()) {
  jest.spyOn(restHooks, 'useFetchClassifications').mockReturnValue(fetchImpl || mockFetchClassifications);
  jest.spyOn(restHooks, 'useDeleteClassification').mockReturnValue(deleteImpl || mockDeleteClassification);

  return render(
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={loggedUser}>
        <ClassificationsContext.Provider value={classifications}>
          <DispatchContext.Provider value={mockDispatch}>
            <Router history={history}>
              <ListClassification />
            </Router>
          </DispatchContext.Provider>
        </ClassificationsContext.Provider>
      </UserContext.Provider>
    </TitleContext.Provider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

test('renders classifications and action buttons', async () => {
  const classifications = [
    { _id: 'c1', name: 'Class A', description: 'Desc A', products: ['p1'] },
    { _id: 'c2', name: 'Class B', description: 'Desc B', products: [] }
  ];
  mockFetchClassifications.mockResolvedValueOnce(classifications);

  renderWithProviders(classifications);

  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());

  // items rendered as table rows by our mock
  expect(screen.getAllByTestId('classification-item').length).toBe(classifications.length);

  // action buttons should be present in DOM (Edit/Delete text from ListClassification)
  expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
  expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
});

test('shows "No classifications found" alert when list is empty', async () => {
  mockFetchClassifications.mockResolvedValueOnce([]);

  renderWithProviders([]);

  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());
  expect(screen.getByText(/No classifications found/i)).toBeInTheDocument();
});

test('shows error alert when fetch fails', async () => {
  mockFetchClassifications.mockRejectedValueOnce(new Error('Fetch failed'));

  renderWithProviders([]);

  await waitFor(() => {
    expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
  });
});

test('Add Classification button navigates to add page', async () => {
  mockFetchClassifications.mockResolvedValueOnce([]);
  const history = createMemoryHistory();
  renderWithProviders([], undefined, undefined, history);

  // wait until fetch called and component settles
  await waitFor(() => expect(mockFetchClassifications).toHaveBeenCalled());

  fireEvent.click(screen.getByText(/Add Classification/i));
  expect(history.location.pathname).toBe('/admin/add-classification');
});

test('edit button navigates to edit page', async () => {
  const classifications = [{ _id: 'c1', name: 'Class A', description: 'Desc A', products: [] }];
  mockFetchClassifications.mockResolvedValueOnce(classifications);
  const history = createMemoryHistory();
  renderWithProviders(classifications, undefined, undefined, history);

  await waitFor(() => {
    expect(mockFetchClassifications).toHaveBeenCalled();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Edit'));
  expect(history.location.pathname).toBe('/admin/edit-classification/c1');
});

test('delete button calls deleteClassification and dispatches and refreshes', async () => {
  const classifications = [{ _id: 'c1', name: 'Class A', description: 'Desc A', products: [] }];
  mockFetchClassifications.mockResolvedValueOnce(classifications);
  mockDeleteClassification.mockResolvedValueOnce();

  renderWithProviders(classifications);

  await waitFor(() => {
    expect(mockFetchClassifications).toHaveBeenCalled();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => expect(mockDeleteClassification).toHaveBeenCalledWith('c1'));
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_CLASSIFICATION', payload: { _id: 'c1' } });
});

