import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { TweetsContext, DispatchContext } from '../../contexts/tweets.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('../../hooks/useTweetActions', () => ({
  useTweetActions: jest.fn(() => ({ showActionButtons: () => null }))
}));

jest.mock('../../rest/useRestTweets', () => ({
  useDeleteTweet: jest.fn().mockReturnValue(() => Promise.resolve())
}));

jest.mock('../8add-edit-tweets/AddEditTweet', () => {
  const ReactInside = require('react');
  return (props) => ReactInside.createElement('div', { 'data-testid': 'add-edit-tweet', 'data-open': props.isOpen ? '1' : '0' }, 'AddEditTweet');
});

const { useDeleteTweet } = require('../../rest/useRestTweets');
const TweetItem = require('./TweetItem').default;

const sampleTweet = {
  _id: 'tweet-1',
  text: 'This is a test tweet',
  creator: { _id: 'user-1', name: 'Alice', email: 'alice@example.com', image: 'alice.png' },
  image: 'tweetimg.png',
  likes: [],
  retweets: [],
  comments: [],
  createdAt: '2025-10-02T00:00:00.000Z'
};

function renderWithProviders(ui, { user = { isLogged: false, userId: null, isAdmin: false }, tweets = [], dispatch = jest.fn(), history = createMemoryHistory() } = {}) {
  return render(
    <Router history={history}>
      <TweetsContext.Provider value={tweets}>
        <DispatchContext.Provider value={dispatch}>
          <UserContext.Provider value={user}>
            {ui}
          </UserContext.Provider>
        </DispatchContext.Provider>
      </TweetsContext.Provider>
    </Router>
  );
}

afterEach(() => {
  jest.resetAllMocks();
});

describe('TweetItem', () => {
  it('renders tweet details: author link, email, text and profile image', () => {
    const history = createMemoryHistory();
    renderWithProviders(<TweetItem tweet={sampleTweet} history={history} triggerReload={jest.fn()} setError={jest.fn()} />, {
      user: { isLogged: false, userId: null },
      history
    });

    // author link/name
    const authorLink = screen.getByText(sampleTweet.creator.name).closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${sampleTweet.creator._id}`);

    // email displayed with @
    expect(screen.getByText(`@${sampleTweet.creator.email}`)).toBeInTheDocument();

    // tweet text
    expect(screen.getByText(sampleTweet.text)).toBeInTheDocument();

    // profile image present
    const img = screen.getAllByAltText('Profile')[0];
    expect(img).toBeInTheDocument();
  });

  it('shows edit/delete dropdown for creator and not for other users', async () => {
    const history = createMemoryHistory();

    // when logged as creator
    renderWithProviders(<TweetItem tweet={sampleTweet} history={history} triggerReload={jest.fn()} setError={jest.fn()} />, {
      user: { isLogged: true, userId: sampleTweet.creator._id, isAdmin: false },
      history
    });

    // dropdown toggle shown (⋮)
    expect(screen.getByText('⋮')).toBeInTheDocument();

    // open dropdown and assert menu items
    fireEvent.click(screen.getByText('⋮'));
    expect(await screen.findByText(/Edit/i)).toBeInTheDocument();
    expect(await screen.findByText(/Delete/i)).toBeInTheDocument();

    // cleanup and render as non-creator
    jest.clearAllMocks();
    const history2 = createMemoryHistory();
    renderWithProviders(<TweetItem tweet={sampleTweet} history={history2} triggerReload={jest.fn()} setError={jest.fn()} />, {
      user: { isLogged: true, userId: 'other-user', isAdmin: false },
      history: history2
    });

    // dropdown toggle should not be present for non-creator/non-admin
    expect(screen.queryByText('⋮')).toBeNull();
  });

  it('calls delete hook, dispatches DELETE_TWEET and navigates home when Delete clicked', async () => {
    const history = createMemoryHistory();
    const mockDispatch = jest.fn();
    const mockDelete = jest.fn(() => Promise.resolve());
    useDeleteTweet.mockReturnValue(mockDelete);

    renderWithProviders(<TweetItem tweet={sampleTweet} history={history} triggerReload={jest.fn()} setError={jest.fn()} />, {
      user: { isLogged: true, userId: sampleTweet.creator._id, isAdmin: false },
      dispatch: mockDispatch,
      history
    });

    // open dropdown
    fireEvent.click(screen.getByText('⋮'));

    // click Delete
    fireEvent.click(await screen.findByText(/Delete/i));

    await waitFor(() => {
      expect(mockDelete).toHaveBeenCalledWith(sampleTweet._id);
    });

    await waitFor(() => {
      expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_TWEET', payload: { _id: sampleTweet._id } });
      expect(history.location.pathname).toBe('/');
    });
  });
});
