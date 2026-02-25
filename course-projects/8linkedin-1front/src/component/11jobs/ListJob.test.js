import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JobsContext, DispatchContext } from '../../contexts/jobs.context';
import { UserContext } from '../../contexts/user.context';

// mock rest hooks
jest.mock('../../rest/useRestJobs', () => ({
  useFetchJobs: jest.fn(),
  useDeleteJob: jest.fn(),
}));

// lightweight JobItem mock that renders title and the passed admin/action buttons
jest.mock('./JobItem', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: ({ job, adminButtons, actionButtons }) =>
      React.createElement('div', { 'data-testid': 'job-item' },
        React.createElement('span', {}, job.title),
        React.createElement('div', { 'data-testid': 'admin-buttons' }, adminButtons),
        React.createElement('div', { 'data-testid': 'action-buttons' }, actionButtons)
      )
  };
});

const { useFetchJobs, useDeleteJob } = require('../../rest/useRestJobs');

afterEach(() => {
  jest.clearAllMocks();
});

function renderWithProviders({ fetchImpl, deleteImpl, user = { userId: 'u-x', isLogged: false, isAdmin: false }, dispatch = jest.fn(), history } = {}) {
  useFetchJobs.mockReturnValue(fetchImpl || (() => Promise.resolve([])));
  useDeleteJob.mockReturnValue(deleteImpl || (() => Promise.resolve()));

  // require after mocks
  const ListJobs = require('./ListJobs').default;

  if (!history) history = createMemoryHistory({ initialEntries: ['/jobs'] });

  return {
    ...render(
      <Router history={history}>
        <JobsContext.Provider value={[]}>
          <DispatchContext.Provider value={dispatch}>
            <UserContext.Provider value={user}>
              <ListJobs history={history} />
            </UserContext.Provider>
          </DispatchContext.Provider>
        </JobsContext.Provider>
      </Router>
    ),
    history,
    dispatch,
  };
}

describe('ListJobs', () => {
  it('renders fetched jobs and filters via search', async () => {
    const jobs = [
      { _id: 'a1', title: 'Frontend Engineer', company: 'Acme', location: 'Remote', description: 'X', requirements: [], creator: { _id: 'u1' } },
      { _id: 'a2', title: 'Backend Engineer', company: 'Widgets', location: 'NY', description: 'Y', requirements: [], creator: { _id: 'u2' } },
    ];
    const fetchImpl = jest.fn().mockResolvedValue(jobs);

    renderWithProviders({ fetchImpl });

    // wait for both job items to render
    await waitFor(() => expect(screen.getAllByTestId('job-item').length).toBe(2));

    expect(screen.getByText(/Frontend Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Backend Engineer/i)).toBeInTheDocument();

    // type a search that filters to one job
    await userEvent.type(screen.getByPlaceholderText(/Search jobs.../i), 'Backend');

    // only backend left
    await waitFor(() => {
      const items = screen.getAllByTestId('job-item');
      expect(items.length).toBe(1);
      expect(screen.getByText(/Backend Engineer/i)).toBeInTheDocument();
    });
  });

  it('shows Add Job for admin and delete calls delete hook + dispatch', async () => {
    const sampleJob = { _id: 'j1', title: 'DevOps', company: 'Infra', location: 'SF', description: '', requirements: [], creator: { _id: 'u2' } };
    const fetchImpl = jest.fn().mockResolvedValue([sampleJob]);
    const deleteImpl = jest.fn().mockResolvedValue();
    const dispatch = jest.fn();
    const user = { userId: 'admin-1', isLogged: true, isAdmin: true };

    renderWithProviders({ fetchImpl, deleteImpl, user, dispatch });

    // admin Add Job button should be visible
    await waitFor(() => expect(screen.getByRole('button', { name: /Add Job/i })).toBeInTheDocument());

    // job item rendered
    await waitFor(() => expect(screen.getByText(sampleJob.title)).toBeInTheDocument());

    // the mocked JobItem includes adminButtons content; find the Delete button inside it
    const deleteButton = screen.getByRole('button', { name: /Delete/i });
    userEvent.click(deleteButton);

    await waitFor(() => {
      expect(deleteImpl).toHaveBeenCalledWith(sampleJob._id);
      expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_JOB', payload: { _id: sampleJob._id } });
    });
  });
});

