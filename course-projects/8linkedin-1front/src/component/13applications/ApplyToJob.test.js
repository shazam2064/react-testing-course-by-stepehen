import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import { JobsContext } from '../../contexts/jobs.context';

jest.mock('../../rest/useRestApplications', () => ({
  useCreateApplication: jest.fn(),
}));

const { useCreateApplication } = require('../../rest/useRestApplications');

afterEach(() => {
  jest.clearAllMocks();
});

function renderWithProviders(jobId, { jobs = [], createImpl = (() => Promise.resolve()), history } = {}) {
  useCreateApplication.mockReturnValue(createImpl);

  const ApplyToJob = require('./ApplyToJob').default;

  if (!history) history = createMemoryHistory({ initialEntries: [`/apply/${jobId}`] });

  return {
    ...render(
      <Router history={history}>
        <JobsContext.Provider value={jobs}>
          <Route path="/apply/:jobId" component={ApplyToJob} />
        </JobsContext.Provider>
      </Router>
    ),
    history,
  };
}

describe('ApplyToJob', () => {
  it('renders job details and the application form when job exists', async () => {
    const sampleJob = { _id: 'j1', title: 'Frontend Engineer', company: 'Acme', location: 'Remote', description: 'Build stuff', requirements: ['React'] };
    renderWithProviders(sampleJob._id, { jobs: [sampleJob] });

    // job header and form fields
    expect(await screen.findByText(/Frontend Engineer/i)).toBeInTheDocument();
    expect(screen.getByText(/Company:/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Resume/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Cover Letter/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Submit Application/i })).toBeInTheDocument();
  });

  it('submits application successfully and shows success message', async () => {
    const sampleJob = { _id: 'j2', title: 'Backend Engineer', company: 'Widgets', location: 'NY', description: '', requirements: [] };
    const createImpl = jest.fn().mockResolvedValue({});
    renderWithProviders(sampleJob._id, { jobs: [sampleJob], createImpl });

    // fill and submit
    userEvent.type(screen.getByLabelText(/Resume/i), 'My resume');
    userEvent.type(screen.getByLabelText(/Cover Letter/i), 'My cover letter');
    userEvent.click(screen.getByRole('button', { name: /Submit Application/i }));

    await waitFor(() => {
      expect(createImpl).toHaveBeenCalled();
      expect(screen.getByText(/Application submitted successfully!/i)).toBeInTheDocument();
    });
  });

  it('shows error when submission fails', async () => {
    const sampleJob = { _id: 'j3', title: 'DevOps', company: 'Infra', location: 'SF', description: '', requirements: [] };
    const createImpl = jest.fn().mockRejectedValue(new Error('API fail'));
    renderWithProviders(sampleJob._id, { jobs: [sampleJob], createImpl });

    userEvent.type(screen.getByLabelText(/Resume/i), 'R');
    userEvent.type(screen.getByLabelText(/Cover Letter/i), 'C');
    userEvent.click(screen.getByRole('button', { name: /Submit Application/i }));

    await waitFor(() => {
      expect(createImpl).toHaveBeenCalled();
      expect(screen.getByText(/API fail/i)).toBeInTheDocument();
    });
  });

  it('shows Job Not Found when job is not in context', async () => {
    renderWithProviders('no-such-job', { jobs: [] });

    expect(await screen.findByText(/Job Not Found/i)).toBeInTheDocument();
    expect(screen.getByText(/does not exist/i)).toBeInTheDocument();
  });
});

