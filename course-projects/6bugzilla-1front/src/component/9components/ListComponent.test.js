import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import ListComponent from './ListComponent';
import { ComponentsContext, DispatchContext } from '../../contexts/components.context';
import { UserContext } from '../../contexts/user.context';
import { TitleContext } from '../../contexts/title.context';
import * as restHooks from '../../rest/useRestComponent';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';

// Defensive mock for ComponentItem to avoid rendering objects directly
jest.mock('./ComponentItem', () => ({ component, actionButtons }) => {
  const productText = component.product ? (component.product.name || component.product._id || '') : '';
  const assigneeText = component.assignee ? (component.assignee.name || component.assignee._id || '') : '';
  const commentsCount = Array.isArray(component.comments) ? component.comments.length : 0;
  return (
    <tr data-testid="component-item">
      <td>{component.name}</td>
      <td>{component.description}</td>
      <td>{productText}</td>
      <td>{assigneeText}</td>
      <td>{commentsCount}</td>
      <td>{actionButtons}</td>
    </tr>
  );
});

const mockDispatch = jest.fn();
const mockFetchComponents = jest.fn();
const mockDeleteComponent = jest.fn();

const loggedUser = { userId: 'admin-1', isAdmin: true };

function renderWithProviders(components = [], fetchImpl, deleteImpl, history = createMemoryHistory(), mockSetTitle = jest.fn()) {
  jest.spyOn(restHooks, 'useFetchComponents').mockReturnValue(fetchImpl || mockFetchComponents);
  jest.spyOn(restHooks, 'useDeleteComponent').mockReturnValue(deleteImpl || mockDeleteComponent);

  return render(
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={loggedUser}>
        <ComponentsContext.Provider value={components}>
          <DispatchContext.Provider value={mockDispatch}>
            <Router history={history}>
              <ListComponent />
            </Router>
          </DispatchContext.Provider>
        </ComponentsContext.Provider>
      </UserContext.Provider>
    </TitleContext.Provider>
  );
}

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

test('renders components and action buttons', async () => {
  const components = [
    { _id: 'c1', name: 'Comp A', description: 'Desc A', product: { name: 'P1' }, assignee: { name: 'U1' }, comments: ['x'] },
    { _id: 'c2', name: 'Comp B', description: 'Desc B', product: { name: 'P2' }, assignee: null, comments: [] }
  ];
  mockFetchComponents.mockResolvedValueOnce(components);

  renderWithProviders(components);

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());

  expect(screen.getAllByTestId('component-item').length).toBe(components.length);
  expect(screen.getAllByText('Edit')[0]).toBeInTheDocument();
  expect(screen.getAllByText('Delete')[0]).toBeInTheDocument();
});

test('shows "No components found" when list is empty', async () => {
  mockFetchComponents.mockResolvedValueOnce([]);
  renderWithProviders([]);

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());
  expect(screen.getByText(/No components found/i)).toBeInTheDocument();
});

test('shows error alert when fetch fails', async () => {
  mockFetchComponents.mockRejectedValueOnce(new Error('Fetch failed'));
  renderWithProviders([]);

  await waitFor(() => {
    expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
    expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
  });
});

test('Add Component button navigates to add page', async () => {
  mockFetchComponents.mockResolvedValueOnce([]);
  const history = createMemoryHistory();
  renderWithProviders([], undefined, undefined, history);

  await waitFor(() => expect(mockFetchComponents).toHaveBeenCalled());

  fireEvent.click(screen.getByText(/Add Component/i));
  expect(history.location.pathname).toBe('/admin/add-component');
});

test('edit button navigates to edit page', async () => {
  const components = [{ _id: 'c1', name: 'Comp A', description: 'Desc A', product: {}, assignee: null, comments: [] }];
  mockFetchComponents.mockResolvedValueOnce(components);
  const history = createMemoryHistory();
  renderWithProviders(components, undefined, undefined, history);

  await waitFor(() => {
    expect(mockFetchComponents).toHaveBeenCalled();
    expect(screen.getByText('Edit')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Edit'));
  expect(history.location.pathname).toBe('/admin/edit-component/c1');
});

test('delete button calls deleteComponent and dispatches and refreshes', async () => {
  const components = [{ _id: 'c1', name: 'Comp A', description: 'Desc A', product: {}, assignee: null, comments: [] }];
  mockFetchComponents.mockResolvedValueOnce(components);
  mockDeleteComponent.mockResolvedValueOnce();

  renderWithProviders(components);

  await waitFor(() => {
    expect(mockFetchComponents).toHaveBeenCalled();
    expect(screen.getByText('Delete')).toBeInTheDocument();
  });

  fireEvent.click(screen.getByText('Delete'));

  await waitFor(() => expect(mockDeleteComponent).toHaveBeenCalledWith('c1'));
  expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_COMPONENT', payload: { _id: 'c1' } });
});

