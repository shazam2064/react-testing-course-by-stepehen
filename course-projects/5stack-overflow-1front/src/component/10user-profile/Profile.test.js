import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import Profile from './Profile';
import {AdminUsersContext} from '../../contexts/admin-users.context';
import {UserContext} from '../../contexts/user.context';
import {MemoryRouter} from 'react-router-dom';

jest.mock('../../rest/useRestAdminUsers', () => ({
    useFetchAdminUserById: jest.fn()
}));
const {useFetchAdminUserById} = require('../../rest/useRestAdminUsers');

const sampleAdmin = {
    _id: '68ecfe5f977174350fab2a37',
    name: 'User Test 1',
    email: 'admin1@test.com',
    createdAt: '2025-10-13T13:27:59.043Z',
    status: 'I am new!',
    questions: [
        {
            _id: '68ee68e62869fd5ce11a7c78',
            title: 'This is a question',
            content: 'So much content in this question',
            votes: 0,
            views: 1,
            createdAt: '2025-10-14T15:14:46.960Z'
        }
    ],
    answers: [
        {
            _id: '68efc054a0c73cb42c0d6a2c',
            content: 'This is the content of the new answer',
            votes: 0,
            questionId: '68ee68e62869fd5ce11a7c78',
            createdAt: '2025-10-15T15:40:04.461Z'
        }
    ]
};

const renderWithProviders = (ui, { adminUsers = [], user = { userId: 'u-x' } } = {}) => {
    return render(
        <MemoryRouter>
            <AdminUsersContext.Provider value={adminUsers}>
                <UserContext.Provider value={user}>
                    {ui}
                </UserContext.Provider>
            </AdminUsersContext.Provider>
        </MemoryRouter>
    );
};

afterEach(() => {
    jest.resetAllMocks();
});

describe('Profile component', () => {
    it('renders profile details and toggles questions/answers', async () => {
        useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));

        renderWithProviders(<Profile match={{params: { userId: sampleAdmin._id } }} />, {
            adminUsers: [],
            user: { userId: sampleAdmin._id }
        });

        await waitFor(() => expect(screen.getByText(sampleAdmin.name)).toBeInTheDocument());

        // email and status present
        expect(screen.getByText(/Email:/i)).toHaveTextContent(sampleAdmin.email);
        expect(screen.getByText(sampleAdmin.status)).toBeInTheDocument();

        // question title renders as a link to view-question/:id
        const qTitle = screen.getByText(sampleAdmin.questions[0].title);
        const qLink = qTitle.closest('a');
        expect(qLink).toHaveAttribute('href', `/view-question/${sampleAdmin.questions[0]._id}`);

        // toggle to Answers view and check answer content and link
        fireEvent.click(screen.getByText('Answers'));
        await waitFor(() => expect(screen.getByText(sampleAdmin.answers[0].content)).toBeInTheDocument());
        const aLink = screen.getByText(sampleAdmin.answers[0].content).closest('a');
        expect(aLink).toHaveAttribute('href', `/view-question/${sampleAdmin.answers[0].questionId}`);
    });

    it('calls fetch hook with userId and handles rejection without crashing', async () => {
        const fetchMock = jest.fn(() => Promise.reject(new Error('DB fail')));
        useFetchAdminUserById.mockReturnValue(fetchMock);

        // suppress console.error noise from rejected promise
        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderWithProviders(<Profile match={{params: { userId: sampleAdmin._id } }} />, {
            adminUsers: [],
            user: { userId: 'someone' }
        });

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(sampleAdmin._id);
        });

        spy.mockRestore();
    });
});

