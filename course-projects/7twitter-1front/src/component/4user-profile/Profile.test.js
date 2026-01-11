import React from 'react';
import {render, screen, waitFor, fireEvent} from '@testing-library/react';
import Profile from './Profile';
import {AdminUsersContext, DispatchContext} from '../../contexts/admin-users.context';
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
    tweets: [
        { _id: 't1', content: 'First tweet', likes: [], retweets: [] }
    ],
    comments: [
        { _id: 'c1', tweet: { _id: 't1' }, content: 'A comment' }
    ],
    followers: [{ _id: 'f1', name: 'Follower 1' }],
    following: [{ _id: 'f2', name: 'Following 1' }]
};

const renderWithProviders = (ui, { adminUsers = [], user = { userId: 'u-x' } } = {}) => {
    return render(
        <MemoryRouter>
            {/* AdminUsersContext value must be an object with adminUsers property */}
            <AdminUsersContext.Provider value={{ adminUsers }}>
                {/* provide dispatch because Profile reads DispatchContext */}
                <DispatchContext.Provider value={jest.fn()}>
                    <UserContext.Provider value={user}>
                        {ui}
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </AdminUsersContext.Provider>
        </MemoryRouter>
    );
};

afterEach(() => {
    jest.resetAllMocks();
});

describe('Profile component', () => {
    it('renders profile details and shows followers/following buttons', async () => {
        // make the hook return a function that resolves to the sample admin
        useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));

        renderWithProviders(<Profile match={{params: { userId: sampleAdmin._id } }} />, {
            adminUsers: [],
            user: { userId: sampleAdmin._id, isLogged: true }
        });

        await waitFor(() => expect(screen.getByText(sampleAdmin.name)).toBeInTheDocument());

        // email is rendered prefixed with @
        expect(screen.getByText(`@${sampleAdmin.email}`)).toBeInTheDocument();

        // Followers and Following buttons should be present with counts
        const followersBtn = screen.getByText(/Followers:/i);
        const followingBtn = screen.getByText(/Following:/i);
        expect(followersBtn).toBeInTheDocument();
        expect(followingBtn).toBeInTheDocument();

        // ensure counts rendered (strong elements contain the numbers)
        expect(followersBtn.querySelector('strong').textContent).toBe(String(sampleAdmin.followers.length));
        expect(followingBtn.querySelector('strong').textContent).toBe(String(sampleAdmin.following.length));
    });

    it('calls fetch hook with userId and handles rejection without crashing', async () => {
        const fetchMock = jest.fn(() => Promise.reject(new Error('DB fail')));
        useFetchAdminUserById.mockReturnValue(fetchMock);

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
