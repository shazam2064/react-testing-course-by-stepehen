import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';

// ensure API_URL won't log/complain during import-time
process.env.API_URL = process.env.API_URL || 'http://test';

// Provide stable React Context objects so useContext() in Profile never receives null
jest.mock('../../contexts/admin-users.context', () => {
    const React = require('react');
    return {
        AdminUsersContext: React.createContext({ adminUsers: [], triggerReloadGlobal: () => {} }),
        DispatchContext: React.createContext(() => {}),
    };
});
jest.mock('../../contexts/user.context', () => {
    const React = require('react');
    return {
        UserContext: React.createContext({ userId: 'u-x', isLogged: false, isAdmin: false }),
        DispatchContext: React.createContext(() => {}),
    };
});

// Mock rest hooks used by Profile
jest.mock('../../rest/useRestAdminUsers', () => ({
    useFetchAdminUserById: jest.fn(),
    useDeleteAdminUser: jest.fn(() => jest.fn()),
    useFollowAdminUser: jest.fn(() => jest.fn()),
}));
jest.mock('../../rest/useRestPosts', () => ({
    useFetchPosts: jest.fn(),
}));
jest.mock('../../rest/useRestConnections', () => ({
    useCreateConnection: jest.fn(() => jest.fn()),
}));

// Lightweight child component mocks to avoid duplication of the user's name
jest.mock('../0commons/PostItem', () => {
    const React = require('react');
    return ({ post }) => React.createElement('div', { 'data-testid': 'post-item' }, post?._id || 'post-noop');
});
jest.mock('./ProfileTabs', () => {
    const React = require('react');
    return () => React.createElement('div', { 'data-testid': 'profile-tabs' }, 'profile-tabs');
});
jest.mock('./ProfileModal', () => {
    const React = require('react');
    return ({ isOpen }) => React.createElement('div', { 'data-testid': 'profile-modal' }, isOpen ? 'open' : 'closed');
});
jest.mock('../0commons/ErrorModal', () => {
    const React = require('react');
    return ({ error }) => (error ? React.createElement('div', { 'data-testid': 'error-modal' }, error) : null);
});

afterEach(() => {
    jest.clearAllMocks();
});

// Use the (mocked) context objects exported by the jest.mock above
const { AdminUsersContext, DispatchContext } = require('../../contexts/admin-users.context');
const { UserContext, DispatchContext: LoggedDispatchContext } = require('../../contexts/user.context');

test('renders profile heading and email from mocked fetch', async () => {
    const sampleAdmin = {
        _id: 'admin-1',
        name: 'User Test 1',
        email: 'test1@example.com',
        image: null,
        posts: [],
        comments: [],
        followers: [],
        following: [],
        jobs: []
    };

    // Configure mocked hooks before requiring Profile
    const restAdmin = require('../../rest/useRestAdminUsers');
    const restPosts = require('../../rest/useRestPosts');

    restAdmin.useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));
    restPosts.useFetchPosts.mockReturnValue(() => Promise.resolve([]));

    const Profile = require('./Profile').default;

    render(
        <MemoryRouter initialEntries={[`/user/${sampleAdmin._id}`]}>
            <AdminUsersContext.Provider value={{ adminUsers: [], triggerReloadGlobal: () => {} }}>
                <DispatchContext.Provider value={() => {}}>
                    <UserContext.Provider value={{ userId: 'other-user', isLogged: true, isAdmin: false }}>
                        <LoggedDispatchContext.Provider value={() => {}}>
                            <Route path="/user/:userId" component={Profile} />
                        </LoggedDispatchContext.Provider>
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </AdminUsersContext.Provider>
        </MemoryRouter>
    );

    // specifically target the heading to avoid duplicate-name matches
    await waitFor(() => expect(screen.getByRole('heading', { name: sampleAdmin.name })).toBeInTheDocument());
    expect(screen.getByText(`@${sampleAdmin.email}`)).toBeInTheDocument();
});

test('clicking Followers button opens the profile modal', async () => {
    const sampleAdmin = {
        _id: 'admin-2',
        name: 'User Test 2',
        email: 'test2@example.com',
        image: null,
        posts: [],
        comments: [],
        followers: [{ _id: 'f1' }, { _id: 'f2' }],
        following: [],
        jobs: []
    };

    const restAdmin = require('../../rest/useRestAdminUsers');
    const restPosts = require('../../rest/useRestPosts');

    restAdmin.useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));
    restPosts.useFetchPosts.mockReturnValue(() => Promise.resolve([]));

    const Profile = require('./Profile').default;

    render(
        <MemoryRouter initialEntries={[`/user/${sampleAdmin._id}`]}>
            <AdminUsersContext.Provider value={{ adminUsers: [], triggerReloadGlobal: () => {} }}>
                <DispatchContext.Provider value={() => {}}>
                    <UserContext.Provider value={{ userId: 'other-user', isLogged: true, isAdmin: false }}>
                        <LoggedDispatchContext.Provider value={() => {}}>
                            <Route path="/user/:userId" component={Profile} />
                        </LoggedDispatchContext.Provider>
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </AdminUsersContext.Provider>
        </MemoryRouter>
    );

    await waitFor(() => expect(screen.getByRole('heading', { name: sampleAdmin.name })).toBeInTheDocument());

    // ensure followers count is visible and click opens modal
    expect(screen.getByText(/Followers:/)).toBeInTheDocument();
    fireEvent.click(screen.getByText(/Followers:/));

    await waitFor(() => expect(screen.getByTestId('profile-modal')).toHaveTextContent('open'));
});
