import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { TweetsContext, DispatchContext } from '../../contexts/tweets.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('../../rest/useRestTweets', () => ({
  useFetchTweets: jest.fn()
}));

jest.mock('./TweetItem', () => {
  const ReactInside = require('react');
  return ({ tweet }) =>
    ReactInside.createElement(
      'div',
      { 'data-testid': 'tweet-item', 'data-id': tweet._id },
      `${tweet.text} - ${tweet.creator.name}`
    );
});

const { useFetchTweets } = require('../../rest/useRestTweets');
const ListTweets = require('./ListTweets').default;

const sampleTweets = [
  {
    _id: 't1',
    text: 'Hello World',
    creator: { _id: 'u1', name: 'Alice', email: 'alice@example.com' },
    likes: ['u2'],
    retweets: [],
    comments: [],
    createdAt: '2025-10-02T00:00:00.000Z'
  },
  {
    _id: 't2',
    text: 'Second tweet',
    creator: { _id: 'u2', name: 'Bob', email: 'bob@example.com' },
    likes: ['u1', 'u3', 'u4'],
    retweets: [],
    comments: [],
    createdAt: '2025-10-03T00:00:00.000Z'
  },
  {
    _id: 't3',
    text: 'Old tweet',
    creator: { _id: 'u3', name: 'Carol', email: 'carol@example.com' },
    likes: [],
    retweets: [],
    comments: [],
    createdAt: '2025-09-30T00:00:00.000Z'
  }
];

function renderWithProviders(ui, { tweets = [], dispatch = jest.fn(), user = { email: 'test@test.com' }, history = createMemoryHistory() } = {}) {
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

describe('ListTweets', () => {
  it('renders tweets fetched by the hook', async () => {
    useFetchTweets.mockReturnValue(() => Promise.resolve(sampleTweets));

    const history = createMemoryHistory();
    renderWithProviders(<ListTweets />, { history });

    await waitFor(() => expect(screen.getAllByTestId('tweet-item').length).toBe(3));

    expect(screen.getByText(/Hello World - Alice/i)).toBeInTheDocument();
    expect(screen.getByText(/Second tweet - Bob/i)).toBeInTheDocument();
    expect(screen.getByText(/Old tweet - Carol/i)).toBeInTheDocument();
  });

  it('applies "Popular" filter to order tweets by likes', async () => {
    useFetchTweets.mockReturnValue(() => Promise.resolve(sampleTweets));

    renderWithProviders(<ListTweets />);

    await waitFor(() => expect(screen.getAllByTestId('tweet-item').length).toBe(3));

    fireEvent.click(screen.getByText(/Popular/i));

    const items = screen.getAllByTestId('tweet-item');
    expect(items[0].getAttribute('data-id')).toBe('t2');
    expect(items[1].getAttribute('data-id')).toBe('t1');
    expect(items[2].getAttribute('data-id')).toBe('t3');
  });

  it('shows "No Tweets Found" when fetch returns empty array', async () => {
    useFetchTweets.mockReturnValue(() => Promise.resolve([]));

    renderWithProviders(<ListTweets />);

    await waitFor(() => {
      expect(screen.getByText(/No Tweets Found/i)).toBeInTheDocument();
    });
  });
});
