import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import ListHistory from './ListHistory';
import { BugsContext } from '../../contexts/bugs.context';
import * as restHooks from '../../rest/useRestBugs';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';

const mockFetchBugs = jest.fn();

jest.mock('../../rest/useRestBugs', () => ({
  useFetchBugs: () => mockFetchBugs,
}));

const renderWithRouter = (ui, { route = '/', routePath = '/' } = {}) => {
  const history = createMemoryHistory({ initialEntries: [route] });
  return {
    ...render(
      <Router history={history}>
        <Route path={routePath} render={(props) => React.cloneElement(ui, props)} />
      </Router>
    ),
    history
  };
};

afterEach(() => {
  jest.clearAllMocks();
  cleanup();
});

test('renders bug history entries with old/new values (arrays and scalars)', async () => {
  const bug = {
    _id: 'b1',
    history: [
      {
        _id: 'h1',
        changedBy: 'Alice',
        changedAt: '2023-01-01T12:00:00Z',
        fields: ['Status', 'CC'],
        oldValues: ['Open', ['u1']],
        newValues: ['Closed', ['u1', 'u2']],
      },
      {
        _id: 'h2',
        changedBy: 'Bob',
        changedAt: '2023-02-02T15:30:00Z',
        fields: ['Summary'],
        oldValues: ['Old summary'],
        newValues: ['New summary'],
      },
    ],
  };

  mockFetchBugs.mockResolvedValueOnce([bug]);

  renderWithRouter(<ListHistory />, { route: '/bugs/history/b1', routePath: '/bugs/history/:bugId' });

  await waitFor(() => expect(screen.getByText(/Alice/)).toBeInTheDocument());

  expect(screen.getByText(/Status, CC/)).toBeInTheDocument();
  expect(screen.getByText(/Open/)).toBeInTheDocument();
  expect(screen.getByText(/Closed/)).toBeInTheDocument();

  const u1Matches = screen.getAllByText(/u1/);
  expect(u1Matches.length).toBeGreaterThanOrEqual(1);
  expect(u1Matches.some(node => node.textContent.includes('Removed'))).toBeTruthy();
  expect(screen.getByText(/u1, u2/)).toBeInTheDocument();

  expect(screen.getByText(/Bob/)).toBeInTheDocument();
  expect(screen.getByText(/Old summary/)).toBeInTheDocument();
  expect(screen.getByText(/New summary/)).toBeInTheDocument();

  expect(screen.getByText(/Bug History/i)).toBeInTheDocument();
});

test('shows Loading... when no matching bug exists', async () => {
  const otherBug = { _id: 'b-other', history: [] };
  mockFetchBugs.mockResolvedValueOnce([otherBug]);

  renderWithRouter(<ListHistory />, { route: '/bugs/history/missing', routePath: '/bugs/history/:bugId' });

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});

test('shows Loading... when fetch fails', async () => {
  mockFetchBugs.mockRejectedValueOnce(new Error('Fetch failed'));

  renderWithRouter(<ListHistory />, { route: '/bugs/history/b1', routePath: '/bugs/history/:bugId' });

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});
