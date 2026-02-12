import React from 'react';
import {render, screen, waitFor} from '@testing-library/react';
import Profile from './Profile';
import {AdminUsersContext, DispatchContext} from '../../contexts/admin-users.context';
import {UserContext} from '../../contexts/user.context';
import {MemoryRouter, Route} from 'react-router-dom';

jest.mock('../../rest/useRestAdminUsers', () => ({
    useFetchAdminUserById: jest.fn(),
    useDeleteAdminUser: jest.fn().mockReturnValue(jest.fn(() => Promise.resolve())),
    useFollowAdminUser: jest.fn().mockReturnValue(jest.fn(() => Promise.resolve()))
}));
const {useFetchAdminUserById} = require('../../rest/useRestAdminUsers');

jest.mock('../0commons/TweetItem', () => {
    const React = require('react');
    return ({ tweet }) => React.createElement('div', { 'data-testid': `tweet-${tweet?._id || 'noop'}` }, tweet?._id || 'tweet-noop');
});

jest.mock('../../rest/useRestTweets', () => ({
    useFetchTweets: jest.fn().mockReturnValue(() => Promise.resolve([]))
}));

const sampleAdmin = {
    _id: '68ecfe5f977174350fab2a37',
    name: 'User Test 1',
    email: 'admin1@test.com',
    createdAt: '2025-10-13T13:27:59.043Z',
    status: 'I am new!',
    tweets: [],
    comments: [],
    followers: [{ _id: 'f1', name: 'Follower 1' }],
    following: [{ _id: 'f2', name: 'Following 1' }]
};

const renderWithProviders = (ui, { adminUsers = [], user = { userId: 'u-x', isLogged: false, isAdmin: false }, route = '/' } = {}) => {
    return render(
        <MemoryRouter initialEntries={[route]}>
            <AdminUsersContext.Provider value={{ adminUsers }}>
                <DispatchContext.Provider value={jest.fn()}>
                    <UserContext.Provider value={user}>
                        <Route path="/profile/:userId" render={(routeProps) => React.cloneElement(ui, {...routeProps})} />
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
        useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));

        renderWithProviders(<Profile />, {
            adminUsers: [],
            user: { userId: sampleAdmin._id, isLogged: true, isAdmin: false },
            route: `/profile/${sampleAdmin._id}`
        });

        await waitFor(() => expect(screen.getByText(sampleAdmin.name)).toBeInTheDocument());

        expect(screen.getByText(`@${sampleAdmin.email}`)).toBeInTheDocument();

        const followersBtn = screen.getByText(/Followers:/i);
        const followingBtn = screen.getByText(/Following:/i);
        expect(followersBtn).toBeInTheDocument();
        expect(followingBtn).toBeInTheDocument();

        expect(followersBtn.querySelector('strong').textContent.trim()).toBe(String(sampleAdmin.followers.length));
        expect(followingBtn.querySelector('strong').textContent.trim()).toBe(String(sampleAdmin.following.length));
    });

    it('calls fetch hook with userId and handles rejection without crashing', async () => {
        const fetchMock = jest.fn(() => Promise.reject(new Error('DB fail')));
        useFetchAdminUserById.mockReturnValue(fetchMock);

        const spy = jest.spyOn(console, 'error').mockImplementation(() => {});

        renderWithProviders(<Profile />, {
            adminUsers: [],
            user: { userId: 'someone' },
            route: `/profile/${sampleAdmin._id}`
        });

        await waitFor(() => {
            expect(fetchMock).toHaveBeenCalledWith(sampleAdmin._id);
        });

        spy.mockRestore();
    });
});

