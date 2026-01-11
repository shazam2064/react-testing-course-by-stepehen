import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';
import { DispatchContext, TweetsContext } from '../../contexts/tweets.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('../../rest/useRestTweets', () => ({
  useFetchTweets: jest.fn()
}));
jest.mock('../../rest/useRestComments', () => ({
  useDeleteComment: jest.fn()
}));

jest.mock('../0commons/TweetItem', () => (props) => {
  const { tweet } = props;
  return React.createElement('div', { 'data-testid': `tweet-${tweet?._id || 'noop'}` }, tweet?._id || 'tweet-noop');
});
jest.mock('../10add-edit-comments/AddEditComment', () => (props) =>
  React.createElement('div', { 'data-testid': `add-edit-comment-${props.tweetId || 'noop'}` }, 'AddEditComment')
);
jest.mock('../9comments/Comments', () => (props) =>
  React.createElement('div', { 'data-testid': `comment-${props.comment?._id || 'noop'}` }, props.comment?._id || 'comment-noop')
);
jest.mock('../0commons/ErrorModal', () => (props) =>
  React.createElement('div', { 'data-testid': 'error-modal' }, props.error || 'error')
);

const { useFetchTweets } = require('../../rest/useRestTweets');
const ViewTweet = require('./ViewTweet').default;

afterEach(() => {
  jest.resetAllMocks();
});

function renderWithProviders(tweetId, { dispatch = jest.fn(), tweetsCtx = [], user = { isAdmin: false, userId: 'u1' } } = {}) {
  return render(
    <MemoryRouter initialEntries={[`/tweet/${tweetId}`]}>
      <DispatchContext.Provider value={dispatch}>
        <TweetsContext.Provider value={tweetsCtx}>
          <UserContext.Provider value={user}>
            <Route path="/tweet/:tweetId">
              <ViewTweet />
            </Route>
          </UserContext.Provider>
        </TweetsContext.Provider>
      </DispatchContext.Provider>
    </MemoryRouter>
  );
}

describe('ViewTweet component', () => {
  it('renders the tweet and shows comments count when fetch succeeds', async () => {
    const sampleTweet = { _id: 't1', text: 'hello', comments: [{ _id: 'c1' }, { _id: 'c2' }] };
    useFetchTweets.mockReturnValue(() => Promise.resolve([sampleTweet]));

    const dispatch = jest.fn();
    renderWithProviders(sampleTweet._id, { dispatch });

    await waitFor(() => expect(screen.getByTestId(`tweet-${sampleTweet._id}`)).toBeInTheDocument());

    expect(screen.getByText(`${sampleTweet.comments.length} Comments`)).toBeInTheDocument();

    expect(dispatch).toHaveBeenCalled();
    expect(dispatch.mock.calls.some(call => call[0] && call[0].type === 'SET_TWEETS')).toBeTruthy();
  });

  it('dispatches LOGOUT when fetch throws Unauthorized error', async () => {
    const tweetId = 't-unauth';
    useFetchTweets.mockReturnValue(() => Promise.reject(new Error('Unauthorized')));

    const dispatch = jest.fn();
    renderWithProviders(tweetId, { dispatch });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    });
  });

  it('handles fetch error by clearing tweets and showing error modal', async () => {
    const tweetId = 't-error';
    useFetchTweets.mockReturnValue(() => Promise.reject(new Error('DB fail')));

    const dispatch = jest.fn();
    renderWithProviders(tweetId, { dispatch });

    await waitFor(() => {
      expect(dispatch.mock.calls.some(call => call[0] && call[0].type === 'SET_TWEETS' && Array.isArray(call[0].tweets))).toBeTruthy();
      expect(screen.getByTestId('error-modal')).toBeInTheDocument();
    });
  });
});

