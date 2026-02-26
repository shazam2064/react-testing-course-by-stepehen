import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Route } from 'react-router-dom';
import { JobsContext } from '../../contexts/jobs.context';
import { AdminUsersContext } from '../../contexts/admin-users.context';

// mock rest hooks (each hook returns a function when invoked)
jest.mock('../../rest/useRestApplications', () => ({
  useFetchApplications: jest.fn(),
  useUpdateApplication: jest.fn(),
}));

// safe ApplicationModal mock (require React inside factory)
jest.mock('../13applications/ApplicationModal', () => {
  const React = require('react');
  return ({ isOpen, application }) =>
    React.createElement('div', {
      'data-testid': 'application-modal',
      'data-open': isOpen ? '1' : '0',
      'data-app-id': application?._id || '',
    }, application?._id || '');
});

const { useFetchApplications, useUpdateApplication } = require('../../rest/useRestApplications');

afterEach(() => {
  jest.clearAllMocks();
});

function renderWithProviders(jobId, { fetchApplicationsFn, updateApplicationFn, jobs = [], adminCtx = {} } = {}) {
  // each hook should return a function (the actual fetch/update implementation)
  useFetchApplications.mockReturnValue(fetchApplicationsFn || (() => Promise.resolve([])));
  useUpdateApplication.mockReturnValue(updateApplicationFn || (() => Promise.resolve()));

  const ReviewApplications = require('./ReviewApplications').default;

  return render(
    <MemoryRouter initialEntries={[`/admin/review-applications/${jobId}`]}>
      <JobsContext.Provider value={jobs}>
        <AdminUsersContext.Provider value={adminCtx}>
          <Route path="/admin/review-applications/:jobId" component={ReviewApplications} />
        </AdminUsersContext.Provider>
      </JobsContext.Provider>
    </MemoryRouter>
  );
}

describe('ReviewApplications', () => {
  it('shows "No applications found" when there are none for the job', async () => {
    const job = { _id: 'job-1', title: 'X' };
    const fetchApplicationsFn = jest.fn().mockResolvedValue([]);
    renderWithProviders(job._id, { fetchApplicationsFn, jobs: [job], adminCtx: { triggerReloadGlobal: jest.fn() } });

    expect(await screen.findByText(/No applications found for this job/i)).toBeInTheDocument();
  });

  it('renders applications and handles view/approve/reject actions', async () => {
    const job = { _id: 'job-2', title: 'Backend Role' };
    const applications = [
      { _id: 'a1', applicant: { name: 'Alice' }, status: 'pending', job: { _id: job._id } },
      { _id: 'a2', applicant: { name: 'Bob' }, status: 'pending', job: { _id: job._id } },
    ];

    const fetchApplicationsFn = jest.fn().mockResolvedValue(applications);
    const updateApplicationFn = jest.fn().mockResolvedValue({});
    const adminCtx = { triggerReloadGlobal: jest.fn() };

    renderWithProviders(job._id, { fetchApplicationsFn, updateApplicationFn, jobs: [job], adminCtx });

    // wait for the list to render
    await waitFor(() => expect(screen.getByText(/Applicant: Alice/i)).toBeInTheDocument());

    // open modal for first application
    const viewButtons = screen.getAllByRole('button', { name: /View Details/i });
    expect(viewButtons.length).toBeGreaterThan(0);
    userEvent.click(viewButtons[0]);

    await waitFor(() => {
      const modal = screen.getByTestId('application-modal');
      expect(modal).toHaveAttribute('data-open', '1');
      expect(modal).toHaveAttribute('data-app-id', 'a1');
    });

    // approve first application
    const approveButtons = screen.getAllByRole('button', { name: /Approve/i });
    expect(approveButtons.length).toBeGreaterThan(0);
    userEvent.click(approveButtons[0]);

    await waitFor(() => {
      expect(updateApplicationFn).toHaveBeenCalledWith('a1', 'accepted');
    });

    // reject second application
    const rejectButtons = screen.getAllByRole('button', { name: /Reject/i });
    expect(rejectButtons.length).toBeGreaterThanOrEqual(2);
    userEvent.click(rejectButtons[1]);

    await waitFor(() => {
      expect(updateApplicationFn).toHaveBeenCalledWith('a2', 'rejected');
    });
  });
});
