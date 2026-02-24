import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import Comments from './Comments';
import { CommentsContext, DispatchContext } from '../../contexts/comments.context';
import { UserContext } from '../../contexts/user.context';
import { MemoryRouter } from 'react-router-dom';

// ensure API_URL is defined before components import it
process.env.API_URL = process.env.API_URL || 'http://test';

// Mock REST hooks
const mockDelete = jest.fn();
const mockLike = jest.fn();

jest.mock('../../rest/useRestComments', () => ({
  useDeleteComment: jest.fn(() => mockDelete),
  useLikeComment: jest.fn(() => mockLike),
}));

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

const sampleComment = {
  _id: 'c1',
  text: 'This is a comment',
  creator: { _id: 'u1', name: 'Alice', email: 'alice@example.com', image: 'a.png' },
  createdAt: new Date().toISOString(),
  likes: [],
};

function renderWithProviders({
  comment = sampleComment,
  user = { userId: 'u2', isLogged: false, isAdmin: false, token: null },
  comments = [],
  triggerReload = jest.fn(),
  setError = jest.fn(),
  handleEditComment = jest.fn(),
} = {}) {
  return render(
    <MemoryRouter>
      <CommentsContext.Provider value={comments}>
        <DispatchContext.Provider value={jest.fn()}>
          <UserContext.Provider value={user}>
            <Comments
              comment={comment}
              triggerReload={triggerReload}
              setError={setError}
              handleEditComment={handleEditComment}
              history={{}}
            />
          </UserContext.Provider>
        </DispatchContext.Provider>
      </CommentsContext.Provider>
    </MemoryRouter>
  );
}

test('renders comment content and like count; liking when logged in calls like and triggers reload', async () => {
  const triggerReload = jest.fn();
  mockLike.mockResolvedValueOnce({});
  const loggedInUser = { userId: 'u2', isLogged: true, token: 'tok', isAdmin: false };

  renderWithProviders({ user: loggedInUser, triggerReload });

  expect(screen.getByText('This is a comment')).toBeInTheDocument();
  // like count shows "0" initially
  const likeCountNode = screen.getByText('0');
  expect(likeCountNode).toBeInTheDocument();

  // the clickable like area is the parent element of the number
  fireEvent.click(likeCountNode.parentElement);

  await waitFor(() => {
    expect(mockLike).toHaveBeenCalledWith('c1');
    expect(triggerReload).toHaveBeenCalled();
  });
});

test('liking when not logged in sets error', async () => {
  const setError = jest.fn();
  const loggedOutUser = { isLogged: false };

  renderWithProviders({ user: loggedOutUser, setError });

  const likeCountNode = screen.getByText('0');
  fireEvent.click(likeCountNode.parentElement);

  await waitFor(() => {
    expect(setError).toHaveBeenCalledWith('You must be logged in to like a comment.');
    expect(mockLike).not.toHaveBeenCalled();
  });
});

test('creator sees edit/delete menu; edit calls handler and delete calls deleteComment then triggers reload and clears error', async () => {
  const triggerReload = jest.fn();
  const setError = jest.fn();
  const handleEditComment = jest.fn();
  mockDelete.mockResolvedValueOnce({}); // successful delete

  // user is the creator
  const creatorUser = { userId: 'u1', isLogged: true, token: 'tok', isAdmin: false };

  renderWithProviders({
    user: creatorUser,
    triggerReload,
    setError,
    handleEditComment,
  });

  // dropdown toggle renders a '⋮' span; find and click it to open menu
  const toggle = screen.getByText('⋮');
  expect(toggle).toBeInTheDocument();
  fireEvent.click(toggle);

  // click Edit
  const editItem = await screen.findByText(/Edit/i);
  fireEvent.click(editItem);
  expect(handleEditComment).toHaveBeenCalledWith('c1');

  // open menu again for Delete
  fireEvent.click(toggle);
  const deleteItem = await screen.findByText(/Delete/i);
  fireEvent.click(deleteItem);

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalledWith('c1');
    expect(triggerReload).toHaveBeenCalled();
    expect(setError).toHaveBeenCalledWith(null);
  });
});

test('delete failure sets an error message', async () => {
  const triggerReload = jest.fn();
  const setError = jest.fn();
  mockDelete.mockRejectedValueOnce(new Error('Delete failed'));

  const creatorUser = { userId: 'u1', isLogged: true, token: 'tok', isAdmin: false };

  renderWithProviders({
    user: creatorUser,
    triggerReload,
    setError,
  });

  const toggle = screen.getByText('⋮');
  fireEvent.click(toggle);
  const deleteItem = await screen.findByText(/Delete/i);
  fireEvent.click(deleteItem);

  await waitFor(() => {
    expect(mockDelete).toHaveBeenCalledWith('c1');
    expect(setError).toHaveBeenCalledWith(expect.stringContaining('Comment could not be deleted'));
    expect(triggerReload).not.toHaveBeenCalled();
  });
});

