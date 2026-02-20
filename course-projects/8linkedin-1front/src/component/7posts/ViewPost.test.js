import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { PostsContext, DispatchContext } from '../../contexts/posts.context';
import { UserContext } from '../../contexts/user.context';

// mock rest hooks used by ViewPost
jest.mock('../../rest/useRestPosts', () => ({
  useFetchPosts: jest.fn(),
  useDeletePost: jest.fn(),
  useLikePost: jest.fn(),
  useFetchPost: jest.fn(),
}));

// mock delete comment hook so component can call it
jest.mock('../../rest/useRestComments', () => ({
  useDeleteComment: jest.fn(() => jest.fn()),
}));

// mocked child components to keep tests focused
jest.mock('../0commons/PostItem', () => {
  const React = require('react');
  return ({ post }) => React.createElement('div', { 'data-testid': 'post-item' }, post?._id || 'post-noop');
});
jest.mock('../10add-edit-comments/AddEditComment', () => {
  const React = require('react');
  return () => React.createElement('div', { 'data-testid': 'add-edit-comment' }, 'add-edit-comment');
});
jest.mock('../9comments/Comments', () => {
  const React = require('react');
  return ({ comment }) => React.createElement('div', { 'data-testid': 'comment-item' }, comment?.text || comment?._id || 'comment-noop');
});
jest.mock('../0commons/ErrorModal', () => {
  const React = require('react');
  return ({ error }) => error ? React.createElement('div', { 'data-testid': 'error-modal' }, error) : null;
});

afterEach(() => {
  jest.resetAllMocks();
});

describe('ViewPost', () => {
  const rest = require('../../rest/useRestPosts');

  function renderWithRoute(postId, { postsCtx = [], dispatch = jest.fn(), user = { isAdmin: false, userId: 'u1' }, initialEntries } = {}) {
    const entries = initialEntries || [`/view-post/${postId}`];
    const ViewPost = require('./ViewPost').default;
    return render(
      <MemoryRouter initialEntries={entries}>
        <PostsContext.Provider value={postsCtx}>
          <DispatchContext.Provider value={dispatch}>
            <UserContext.Provider value={user}>
              <Route path="/view-post/:postId" component={ViewPost} />
            </UserContext.Provider>
          </DispatchContext.Provider>
        </PostsContext.Provider>
      </MemoryRouter>
    );
  }

  it('shows "No post found" when fetch returns posts without requested id', async () => {
    rest.useFetchPosts.mockReturnValue(() => Promise.resolve([{ _id: 'other', comments: [] }]));

    renderWithRoute('target-id');

    await waitFor(() => {
      expect(screen.getByText(/No post found/i)).toBeInTheDocument();
    });
  });

  it('renders PostItem and comments when post is found', async () => {
    const samplePost = {
      _id: 'p-1',
      content: 'Hello',
      comments: [{ _id: 'c1', text: 'First' }, { _id: 'c2', text: 'Second' }],
    };
    rest.useFetchPosts.mockReturnValue(() => Promise.resolve([samplePost]));

    renderWithRoute('p-1');

    await waitFor(() => expect(screen.getByTestId('post-item')).toBeInTheDocument());

    expect(screen.getByText(/2 Comments/i)).toBeInTheDocument();

    const comments = screen.getAllByTestId('comment-item');
    expect(comments).toHaveLength(2);

    expect(screen.getByTestId('add-edit-comment')).toBeInTheDocument();
  });

  it('dispatches LOGOUT when fetch throws Unauthorized error', async () => {
    rest.useFetchPosts.mockReturnValue(() => Promise.reject(new Error('Unauthorized')));
    const dispatch = jest.fn();

    renderWithRoute('any-id', { dispatch });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    });
  });

  it('shows error modal when fetch fails', async () => {
    rest.useFetchPosts.mockReturnValue(() => Promise.reject(new Error('DB fail')));

    renderWithRoute('any-id');

    await waitFor(() => {
      expect(screen.getByTestId('error-modal')).toBeInTheDocument();
      expect(screen.getByTestId('error-modal')).toHaveTextContent(/DB fail/i);
    });
  });
});

