import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditClassification from './AddEditClassification';
import { TitleContext } from '../../contexts/title.context';
import { UserContext } from '../../contexts/user.context';
import { MemoryRouter } from 'react-router-dom'; // added

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

const renderWithProviders = (ui, { user = { isAdmin: true }, mockSetTitle = jest.fn() } = {}) => {
  return render(
    <MemoryRouter>
      <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
        <UserContext.Provider value={user}>
          {ui}
        </UserContext.Provider>
      </TitleContext.Provider>
    </MemoryRouter>
  );
};

describe('AddEditClassification', () => {
  it('renders form fields in add mode and sets title', () => {
    const mockSetTitle = jest.fn();
    renderWithProviders(<AddEditClassification match={{ params: {} }} history={{ push: jest.fn() }} />, { mockSetTitle });
    expect(screen.getByLabelText(/Name:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Description:/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /save/i })).toBeInTheDocument();
    expect(mockSetTitle).toHaveBeenCalled(); // should set "Add Classification"
  });

  it('shows unauthorized message when user is not admin', () => {
    renderWithProviders(<AddEditClassification match={{ params: {} }} history={{ push: jest.fn() }} />, { user: { isAdmin: false } });
    expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
    expect(screen.getByText(/not authorized/i)).toBeInTheDocument();
  });

  it('creates classification on submit and navigates on success', async () => {
    const mockPush = jest.fn();
    mockCreate.mockResolvedValueOnce({}); // succeed
    const mockSetTitle = jest.fn();

    renderWithProviders(<AddEditClassification match={{ params: {} }} history={{ push: mockPush }} />, { mockSetTitle });

    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Test Class' } });
    fireEvent.change(screen.getByLabelText(/Description:/i), { target: { value: 'Desc' } });

    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockCreate).toHaveBeenCalledWith(expect.objectContaining({ name: 'Test Class', description: 'Desc' }));
      expect(mockPush).toHaveBeenCalledWith('/admin/classifications');
    });
  });

  it('shows error alert when create fails', async () => {
    mockCreate.mockRejectedValueOnce(new Error('Create failed'));

    renderWithProviders(<AddEditClassification match={{ params: {} }} history={{ push: jest.fn() }} />);

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

    renderWithProviders(<AddEditClassification match={{ params: { classificationId: 'c1' } }} history={{ push: mockPush }} />, { mockSetTitle });

    // Wait for fetch to populate form
    await waitFor(() => expect(screen.getByLabelText(/Name:/i).value).toBe('Existing'));
    expect(screen.getByLabelText(/Description:/i).value).toBe('Existing desc');
    expect(mockSetTitle).toHaveBeenCalledWith(expect.stringContaining('Edit Classification'));

    // Update and submit
    fireEvent.change(screen.getByLabelText(/Name:/i), { target: { value: 'Existing Updated' } });
    fireEvent.click(screen.getByRole('button', { name: /save/i }));

    await waitFor(() => {
      expect(mockUpdate).toHaveBeenCalledWith(expect.objectContaining({ _id: 'c1', name: 'Existing Updated' }));
      expect(mockPush).toHaveBeenCalledWith('/admin/classifications');
    });
  });

  it('shows error when fetch in edit mode fails', async () => {
    mockFetchById.mockRejectedValueOnce(new Error('Fetch failed'));
    renderWithProviders(<AddEditClassification match={{ params: { classificationId: 'bad' } }} history={{ push: jest.fn() }} />);

    await waitFor(() => {
      expect(screen.getByText(/Classification could not be fetched/i)).toBeInTheDocument();
      expect(screen.getByText(/Fetch failed/i)).toBeInTheDocument();
    });
  });
});
