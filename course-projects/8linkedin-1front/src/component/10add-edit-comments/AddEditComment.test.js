import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AddEditComment from './AddEditComment';
import { CommentsContext, DispatchContext } from '../../contexts/comments.context';
import { UserContext } from '../../contexts/user.context';

process.env.API_URL = process.env.API_URL || 'http://test';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestComments', () => ({
  useCreateComment: jest.fn(() => mockCreate),
  useUpdateComment: jest.fn(() => mockUpdate),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const sampleComment = {
  _id: 'c1',
  text: 'Original comment text',
  creator: { _id: 'u1', name: 'Alice' },
  createdAt: new Date().toISOString(),
  likes: [],
};

function renderWithProviders(props = {}, { comments = [], dispatch = jest.fn(), user = { userId: 'u1', isLogged: true } } = {}) {
  return render(
    <MemoryRouter>
      <CommentsContext.Provider value={comments}>
        <DispatchContext.Provider value={dispatch}>
          <UserContext.Provider value={user}>
            <AddEditComment {...props} />
          </UserContext.Provider>
        </DispatchContext.Provider>
      </CommentsContext.Provider>
    </MemoryRouter>
  );
}

test('renders textbox and submit button (create mode)', () => {
  renderWithProviders({ postId: 'p1', editMode: false, triggerReload: jest.fn() });

  expect(screen.getByRole('textbox')).toBeInTheDocument();
  expect(screen.getByRole('button', { name: /Add Comment/i })).toBeInTheDocument();
});

test('create mode: calls createComment and triggers reload', async () => {
  mockCreate.mockResolvedValueOnce({ _id: 'new-c' });
  const triggerReload = jest.fn();

  renderWithProviders({ postId: 'p1', editMode: false, triggerReload });

  const textbox = screen.getByRole('textbox');
  fireEvent.change(textbox, { target: { value: 'A new comment' } });

  fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

  await waitFor(() => {
    expect(mockCreate).toHaveBeenCalledTimes(1);
    expect(mockCreate).toHaveBeenCalledWith('p1', 'A new comment');
    expect(triggerReload).toHaveBeenCalled();
  });
});

test('edit mode: prefills textarea and calls updateComment on submit', async () => {
  mockUpdate.mockResolvedValueOnce({});
  const triggerReload = jest.fn();

  renderWithProviders({ comment: sampleComment, editMode: true, postId: 'p1', triggerReload });

  const textbox = screen.getByRole('textbox');
  expect(textbox.value).toBe(sampleComment.text);

  fireEvent.change(textbox, { target: { value: 'Updated comment' } });
  fireEvent.click(screen.getByRole('button', { name: /Update Comment/i }));

  await waitFor(() => {
    expect(mockUpdate).toHaveBeenCalledTimes(1);
    expect(mockUpdate).toHaveBeenCalledWith('c1', 'Updated comment');
    expect(triggerReload).toHaveBeenCalled();
  });
});

test('shows validation alert when textarea empty', async () => {
  window.alert = jest.fn();
  renderWithProviders({ postId: 'p1', editMode: false, triggerReload: jest.fn() });

  const textbox = screen.getByRole('textbox');
  fireEvent.change(textbox, { target: { value: '' } });

  fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

  await waitFor(() => {
    expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockUpdate).not.toHaveBeenCalled();
  });
});

