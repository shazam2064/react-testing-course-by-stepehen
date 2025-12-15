import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditComment from './AddEditComment';
import { CommentsContext, DispatchContext } from '../../contexts/comments.context';
import { UserContext } from '../../contexts/user.context';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestComments', () => ({
  useCreateComment: () => mockCreate,
  useUpdateComment: () => mockUpdate,
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const renderWithProviders = (ui, { user = { userId: 'u1', name: 'Tester' }, comments = [], dispatch = jest.fn() } = {}) => {
  return render(
    <UserContext.Provider value={user}>
      <CommentsContext.Provider value={comments}>
        <DispatchContext.Provider value={dispatch}>
          {ui}
        </DispatchContext.Provider>
      </CommentsContext.Provider>
    </UserContext.Provider>
  );
};

test('renders form in add mode and creates comment on submit', async () => {
  const triggerReload = jest.fn();
  mockCreate.mockResolvedValueOnce({});
  renderWithProviders(<AddEditComment bugId="b1" editMode={false} triggerReload={triggerReload} />);

  const textarea = screen.getByLabelText(/Your Comment/i);
  fireEvent.change(textarea, { target: { value: 'New comment' } });

  await waitFor(() => expect(textarea.value).toBe('New comment'));

  fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

  await waitFor(() => {
    expect(mockCreate).toHaveBeenCalledWith('b1', 'New comment');
    expect(triggerReload).toHaveBeenCalled();
  });
});

test('renders form in edit mode and updates comment on submit', async () => {
  const triggerReload = jest.fn();
  const comment = { _id: 'c1', text: 'Existing' };
  mockUpdate.mockResolvedValueOnce({});
  renderWithProviders(<AddEditComment comment={comment} bugId="b1" editMode={true} triggerReload={triggerReload} />);

  const textarea = screen.getByLabelText(/Your Comment/i);
  expect(textarea.value).toBe('Existing');

  fireEvent.change(textarea, { target: { value: 'Updated comment' } });

  await waitFor(() => expect(textarea.value).toBe('Updated comment'));

  fireEvent.click(screen.getByRole('button', { name: /Update Comment/i }));

  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalledWith('c1', 'Updated comment');
    expect(triggerReload).toHaveBeenCalled();
  });
});

test('shows validation alert when content is empty', async () => {
  window.alert = jest.fn();
  renderWithProviders(<AddEditComment bugId="b1" editMode={false} triggerReload={jest.fn()} />);

  fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
  });
});

test('displays error when create fails', async () => {
  mockCreate.mockRejectedValueOnce(new Error('Create failed'));
  renderWithProviders(<AddEditComment bugId="b1" editMode={false} triggerReload={jest.fn()} />);

  const textarea = screen.getByLabelText(/Your Comment/i);
  fireEvent.change(textarea, { target: { value: 'Will fail' } });

  await waitFor(() => expect(textarea.value).toBe('Will fail'));

  fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

  await waitFor(() => {
    expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
  });
});

test('displays error when update fails', async () => {
  const comment = { _id: 'c2', text: 'Existing' };
  mockUpdate.mockRejectedValueOnce(new Error('Update failed'));
  renderWithProviders(<AddEditComment comment={comment} bugId="b1" editMode={true} triggerReload={jest.fn()} />);

  const textarea = screen.getByLabelText(/Your Comment/i);
  fireEvent.change(textarea, { target: { value: 'Attempt update' } });

  await waitFor(() => expect(textarea.value).toBe('Attempt update'));

  fireEvent.click(screen.getByRole('button', { name: /Update Comment/i }));

  await waitFor(() => {
    expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
  });
});

