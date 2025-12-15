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

  // wait for fetch to complete and the entry to render
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  // key pieces from the first history entry should be visible
  expect(screen.getByText(/Alice/)).toBeInTheDocument();
  expect(screen.getByText(/Status/)).toBeInTheDocument();
  expect(screen.getByText(/Open/)).toBeInTheDocument();
  expect(screen.getByText(/Closed/)).toBeInTheDocument();

  // array handling for CC: removed and added values should be rendered as comma-separated
  expect(screen.getByText(/u1/)).toBeInTheDocument();
  expect(screen.getByText(/u2/)).toBeInTheDocument();

  // second entry summary change should be visible
  expect(screen.getByText(/Bob/)).toBeInTheDocument();
  expect(screen.getByText(/Old summary/)).toBeInTheDocument();
  expect(screen.getByText(/New summary/)).toBeInTheDocument();

  // page heading
  expect(screen.getByText(/Bug History/i)).toBeInTheDocument();
});

test('shows Loading... when no matching bug exists', async () => {
  const otherBug = { _id: 'b-other', history: [] };
  mockFetchBugs.mockResolvedValueOnce([otherBug]);

  renderWithRouter(<ListHistory />, { route: '/bugs/history/missing', routePath: '/bugs/history/:bugId' });

  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  // component currently returns "Loading..." while bug is null / not found
  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});

test('shows Loading... when fetch fails', async () => {
  mockFetchBugs.mockRejectedValueOnce(new Error('Fetch failed'));

  renderWithRouter(<ListHistory />, { route: '/bugs/history/b1', routePath: '/bugs/history/:bugId' });

  // wait for fetch to have been invoked
  await waitFor(() => expect(mockFetchBugs).toHaveBeenCalled());

  // component shows Loading... (no explicit error UI in current implementation)
  expect(screen.getByText(/Loading\.\.\./i)).toBeInTheDocument();
});

