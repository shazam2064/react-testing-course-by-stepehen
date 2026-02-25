import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { DispatchContext } from '../../contexts/jobs.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('../../rest/useRestJobs', () => ({
  useFetchJob: jest.fn(),
  useDeleteJob: jest.fn(),
}));

// lightweight Card children don't need real implementation
jest.mock('react-router-dom', () => {
  const actual = jest.requireActual('react-router-dom');
  return {
    ...actual,
  };
});

const { useFetchJob, useDeleteJob } = require('../../rest/useRestJobs');

afterEach(() => {
  jest.resetAllMocks();
  jest.resetModules();
});

function renderWithRouter(jobId, { fetchImpl, deleteImpl, user = { isAdmin: false, isLogged: true }, dispatch = jest.fn(), history } = {}) {
  // assign implementations into mocked hooks before requiring component
  useFetchJob.mockReturnValue(fetchImpl || (() => Promise.resolve(null)));
  useDeleteJob.mockReturnValue(deleteImpl || (() => Promise.resolve()));

  // require after mocks to ensure module reads our mocks
  const ViewJob = require('./ViewJob').default;

  if (!history) history = createMemoryHistory({ initialEntries: [`/view-job/${jobId}`] });

  return {
    ...render(
      <Router history={history}>
        <DispatchContext.Provider value={dispatch}>
          <UserContext.Provider value={user}>
            <Route path="/view-job/:jobId">
              <ViewJob />
            </Route>
          </UserContext.Provider>
        </DispatchContext.Provider>
      </Router>
    ),
    history,
    dispatch,
  };
}

describe('ViewJob component', () => {
  it('renders job details when fetch succeeds', async () => {
    const sampleJob = {
      _id: 'j1',
      title: 'Frontend Engineer',
      location: 'Remote',
      company: 'Acme Inc',
      description: 'Build things',
      requirements: ['React', 'JS'],
      applicants: [{}, {}],
      updatedAt: new Date().toISOString(),
      creator: { _id: 'u1', name: 'Alice', email: 'alice@example.com', image: 'a.png' },
    };

    const fetchImpl = jest.fn().mockResolvedValue(sampleJob);
    const { dispatch } = renderWithRouter(sampleJob._id, { fetchImpl });

    await waitFor(() => expect(screen.getByText(/Frontend Engineer/i)).toBeInTheDocument());

    expect(screen.getByText(sampleJob.company)).toBeInTheDocument();
    expect(screen.getByText(/About the job/i)).toBeInTheDocument();
    expect(screen.getByText(/Requirements/i)).toBeInTheDocument();
    // applicants count text appears in the header
    expect(screen.getByText(/people clicked apply/i)).toBeInTheDocument();

    // creator info and link
    expect(screen.getByText(sampleJob.creator.name)).toBeInTheDocument();
    expect(screen.getByText(`@${sampleJob.creator.email}`)).toBeInTheDocument();

    // dispatch shouldn't be called with LOGOUT in success case
    expect(dispatch).not.toHaveBeenCalledWith({ type: 'LOGOUT' });
  });

  it('dispatches LOGOUT when fetch throws Unauthorized error', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('Unauthorized'));
    const dispatch = jest.fn();
    renderWithRouter('j-unauth', { fetchImpl, dispatch });

    await waitFor(() => {
      expect(dispatch).toHaveBeenCalledWith({ type: 'LOGOUT' });
    });
  });

  it('deletes job when admin clicks Delete and navigates to /jobs', async () => {
    const sampleJob = {
      _id: 'j2',
      title: 'Backend Engineer',
      location: 'NY',
      company: 'Widgets Co',
      description: 'Server-side',
      requirements: ['Node'],
      applicants: [],
      updatedAt: new Date().toISOString(),
      creator: { _id: 'u2', name: 'Bob', email: 'bob@example.com', image: 'b.png' },
    };

    const fetchImpl = jest.fn().mockResolvedValue(sampleJob);
    const deleteImpl = jest.fn().mockResolvedValue();
    const dispatch = jest.fn();
    const user = { isAdmin: true, isLogged: true };

    const { history } = renderWithRouter(sampleJob._id, { fetchImpl, deleteImpl, user, dispatch });

    // wait for job to render and Delete button to appear
    await waitFor(() => expect(screen.getByRole('button', { name: /Delete/i })).toBeInTheDocument());

    userEvent.click(screen.getByRole('button', { name: /Delete/i }));

    await waitFor(() => {
      // delete hook should be called with job id
      expect(deleteImpl).toHaveBeenCalledWith(sampleJob._id);
      // dispatch DELETE_JOB
      expect(dispatch).toHaveBeenCalledWith({ type: 'DELETE_JOB', payload: { _id: sampleJob._id } });
      // navigation to /jobs
      expect(history.location.pathname).toBe('/jobs');
    });
  });

  it('shows error message when fetch fails with general error', async () => {
    const fetchImpl = jest.fn().mockRejectedValue(new Error('DB fail'));
    const { dispatch } = renderWithRouter('j-error', { fetchImpl });

    await waitFor(() => {
      expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
      expect(screen.getByText(/DB fail/i)).toBeInTheDocument();
      // ensure SET not called with data
      expect(dispatch.mock.calls.some(c => c[0] && c[0].type === 'DELETE_JOB')).toBeFalsy();
    });
  });
});

