import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditClassification from './AddEditClassification';
import { TitleContext } from '../../contexts/title.context';
import { UserContext } from '../../contexts/user.context';
import { MemoryRouter, Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();
const mockFetchById = jest.fn();

jest.mock('../../rest/useRestClassifications', () => ({
  useCreateClassification: () => mockCreate,
  useUpdateClassification: () => mockUpdate,
  useFetchClassificationById: () => mockFetchById,
}));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

// render helper: if history provided and routePath provided, render via Router + Route and clone element so route props (match.params) are injected.
// if history provided but no routePath, render inside Router to allow withRouter navigation assertions.
// otherwise use MemoryRouter.
const renderWithProviders = (ui, { user = { isAdmin: true }, mockSetTitle = jest.fn() } = {}, history = null, routePath = null) => {
  const Wrapper = ({ children }) => (
    <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
      <UserContext.Provider value={user}>
        {children}
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

describe('AddEditClassification', () => {
  it('renders form fields in add mode and sets title', () => {
    const mockSetTitle = jest.fn();
    renderWithProviders(<AddEditClassification />, { mockSetTitle });
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(mockSetTitle).toHaveBeenCalled(); // should set "Add Classification"
  });

  it('shows unauthorized message when user is not admin', () => {
    renderWithProviders(<AddEditClassification />, { user: { isAdmin: false } });
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('creates classification on submit and navigates on success', async () => {
    const mockPush = jest.fn();
    mockCreate.mockResolvedValueOnce({}); // succeed
    const mockSetTitle = jest.fn();

    const history = createMemoryHistory();
    renderWithProviders(<AddEditClassification />, { mockSetTitle }, history);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test Class' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Class', description: 'Desc' }));
      // navigation uses the history we provided
      expect(history.location.pathname).toBe('/admin/classifications');
    });
  });

  it('shows error alert when create fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Create failed'));

    renderWithProviders(<AddEditClassification />);

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Bad' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(screen.getByText(/Classification could not be created/i)).toBeInTheDocument();
      expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
    });
  });

  it('loads classification in edit mode, updates it and navigates on success', async () => {
    const classification = { _id: 'c1', name: 'Existing', description: 'Existing desc' };
    mockFetchById.mockResolvedValueOnce(classification);
    mockUpdate.mockResolvedValueOnce({});
    const mockPush = jest.fn();
    const mockSetTitle = jest.fn();

    const history = createMemoryHistory({ initialEntries: ['/admin/classifications/edit/c1'] });
    const routePath = '/admin/classifications/edit/:classificationId';

    renderWithProviders(<AddEditClassification />, { mockSetTitle }, history, routePath);

    // Wait for fetch to populate form
    await waitFor(() => expect(screen.getByLabelText(/Name:/i).value).toBe('Existing'));
    expect(screen.getByLabelText(/Description:/i).value).toBe('Existing desc');
    expect(mockSetTitle).toHaveBeenCalledWith(expect.stringContaining('Edit Classification'));

    // Update and submit
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Existing Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ _id: 'c1', name: 'Existing Updated' }));
      expect(history.location.pathname).toBe('/admin/classifications');
    });
  });

  it('shows error when fetch in edit mode fails', async () => {
    mockFetchById.mockRejectedValueOnce(new Error('Fetch failed'));
    const history = createMemoryHistory({ initialEntries: ['/admin/classifications/edit/bad'] });
    const routePath = '/admin/classifications/edit/:classificationId';

    renderWithProviders(<AddEditClassification />, {}, history, routePath);

    await waitFor(() => {
      expect(screen.getByText(/Classification could not be fetched/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });
});
