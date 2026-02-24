import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditJob from './AddEditJob';
import { JobsContext } from '../../contexts/jobs.context';
import { UserContext } from '../../contexts/user.context';

process.env.API_URL = process.env.API_URL || 'http://test';

// mocks for REST hooks
const mockCreateJob = jest.fn();
const mockFetchJob = jest.fn();
const mockUpdateJob = jest.fn();

jest.mock('../../rest/useRestJobs', () => ({
  useCreateJob: jest.fn(() => mockCreateJob),
  useFetchJob: jest.fn(() => mockFetchJob),
  useUpdateJob: jest.fn(() => mockUpdateJob),
}));

afterEach(() => {
  jest.resetAllMocks();
  cleanup();
});

const adminUser = { userId: 'admin1', isAdmin: true };
const regularUser = { userId: 'user1', isAdmin: false };

function providers(ui, { history = createMemoryHistory(), jobs = [], user = adminUser } = {}) {
  return render(
    <Router history={history}>
      <JobsContext.Provider value={jobs}>
        <UserContext.Provider value={user}>
          {ui}
        </UserContext.Provider>
      </JobsContext.Provider>
    </Router>
  );
}

test('creates a job on submit (create mode)', async () => {
  mockCreateJob.mockResolvedValueOnce({ _id: 'job-1' });
  const history = createMemoryHistory({ initialEntries: ['/jobs/new'] });
  const triggerReload = jest.fn();

  providers(
    <Route path="/jobs/new" render={(props) => <AddEditJob {...props} triggerReload={triggerReload} />} />,
    { history }
  );

  // fill form fields
  fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'Software Engineer' } });
  fireEvent.change(screen.getByLabelText(/Description/i), { target: { value: 'Build stuff' } });
  fireEvent.change(screen.getByLabelText(/Location/i), { target: { value: 'Remote' } });
  fireEvent.change(screen.getByLabelText(/Company/i), { target: { value: 'Acme' } });

  // add a requirement via Enter on the requirement input
  const reqInput = screen.getByPlaceholderText(/Add a requirement/i);
  fireEvent.change(reqInput, { target: { value: 'JS' } });
  fireEvent.keyDown(reqInput, { key: 'Enter', code: 'Enter' });

  // submit
  fireEvent.click(screen.getByRole('button', { name: /Add Job/i }));

  await waitFor(() => {
    expect(mockCreateJob).toHaveBeenCalledTimes(1);
    const calledWith = mockCreateJob.mock.calls[0][0];
    expect(calledWith.title).toBe('Software Engineer');
    expect(calledWith.company).toBe('Acme');
    expect(Array.isArray(calledWith.requirements)).toBe(true);
    expect(calledWith.requirements).toContain('JS');
    expect(history.location.pathname).toBe('/view-job/job-1');
    expect(triggerReload).toBeDefined();
  });
});

test('shows validation error when required fields missing', async () => {
  const history = createMemoryHistory({ initialEntries: ['/jobs/new'] });
  providers(
    <Route path="/jobs/new" render={(props) => <AddEditJob {...props} triggerReload={jest.fn()} />} />,
    { history }
  );

  // submit without filling required fields
  fireEvent.click(screen.getByRole('button', { name: /Add Job/i }));

  await waitFor(() => {
    expect(screen.getByText(/All fields are required/i)).toBeInTheDocument();
    expect(mockCreateJob).not.toHaveBeenCalled();
  });
});

test('updates an existing job in edit mode', async () => {
  const existingJob = {
    _id: 'j-edit',
    title: 'Old Title',
    description: 'Old Desc',
    location: 'Old Loc',
    company: 'Old Co',
    requirements: ['Req1'],
    newReq: '',
  };
  mockFetchJob.mockResolvedValueOnce(existingJob);
  mockUpdateJob.mockResolvedValueOnce({});

  const history = createMemoryHistory({ initialEntries: ['/jobs/edit/j-edit'] });
  const triggerReload = jest.fn();

  providers(
    <Route path="/jobs/edit/:jobId" render={(props) => <AddEditJob {...props} triggerReload={triggerReload} />} />,
    { history }
  );

  // wait for fetchJob to populate the form
  await waitFor(() => {
    expect(screen.getByLabelText(/Job Title/i).value).toBe('Old Title');
  });

  // change and submit
  fireEvent.change(screen.getByLabelText(/Job Title/i), { target: { value: 'New Title' } });
  fireEvent.click(screen.getByRole('button', { name: /Update Job/i }));

  await waitFor(() => {
    expect(mockUpdateJob).toHaveBeenCalledTimes(1);
    const calledWith = mockUpdateJob.mock.calls[0][0];
    expect(calledWith._id).toBe('j-edit');
    expect(calledWith.title).toBe('New Title');
    expect(history.location.pathname).toBe('/view-job/j-edit');
  });
});

test('shows unauthorized message for non-admin users', () => {
  const history = createMemoryHistory({ initialEntries: ['/jobs/new'] });
  providers(
    <Route path="/jobs/new" render={(props) => <AddEditJob {...props} triggerReload={jest.fn()} />} />,
    { history, user: regularUser }
  );

  expect(screen.getByText(/Unauthorized!/i)).toBeInTheDocument();
  expect(screen.getByText(/you are not authorized/i)).toBeInTheDocument();
});

