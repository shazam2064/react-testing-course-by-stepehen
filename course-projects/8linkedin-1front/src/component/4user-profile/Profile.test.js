import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter, Route } from 'react-router-dom';

// ensure API_URL won't log/complain during import-time
process.env.API_URL = process.env.API_URL || 'http://test';

// Provide safe contexts before requiring Profile
jest.doMock('../../contexts/admin-users.context', () => {
    const React = require('react');
    return {
        AdminUsersContext: React.createContext({ adminUsers: [], triggerReloadGlobal: () => {} }),
        DispatchContext: React.createContext(() => {}),
    };
});

jest.doMock('../../contexts/user.context', () => {
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

// <-- CHANGED: mock useRestPosts (not useRestTweets) -->
jest.mock('../../rest/useRestPosts', () => ({
    useFetchPosts: jest.fn(),
}));

// <-- CHANGED: mock PostItem (not TweetItem) -->
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
    jest.resetModules();
    jest.clearAllMocks();
});

test('Profile renders basic info (name and email) with mocked hooks/contexts', async () => {
    // sample admin user returned by the mocked hook - use posts/comments/jobs as Profile expects
    const sampleAdmin = {
        _id: 'admin-1',
        name: 'User Test 1',
        email: 'test1@example.com',
        createdAt: new Date().toISOString(),
        image: null,
        posts: [],
        comments: [],
        followers: [],
        following: [],
        jobs: []
    };

    // Configure the mocked hooks BEFORE requiring Profile
    const restAdmin = require('../../rest/useRestAdminUsers');
    const restPosts = require('../../rest/useRestPosts');

    restAdmin.useFetchAdminUserById.mockReturnValue(() => Promise.resolve(sampleAdmin));
    restPosts.useFetchPosts.mockReturnValue(() => Promise.resolve([]));

    // lazily require Profile so it sees the mocks above
    const Profile = require('./Profile').default;

    // Get the mocked contexts to provide values
    const { AdminUsersContext, DispatchContext } = require('../../contexts/admin-users.context');
    const { UserContext, DispatchContext: LoggedDispatch } = require('../../contexts/user.context');

    render(
        <MemoryRouter initialEntries={[`/user/${sampleAdmin._id}`]}>
            <AdminUsersContext.Provider value={{ adminUsers: [], triggerReloadGlobal: () => {} }}>
                <DispatchContext.Provider value={() => {}}>
                    <UserContext.Provider value={{ userId: 'other-user', isLogged: true, isAdmin: false }}>
                        <LoggedDispatch.Provider value={() => {}}>
                            <Route path="/user/:userId" component={Profile} />
                        </LoggedDispatch.Provider>
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </AdminUsersContext.Provider>
        </MemoryRouter>
    );

    // <-- CHANGED: target the profile heading (h2) to avoid duplicate matches -->
    await waitFor(() => expect(screen.getByRole('heading', { name: sampleAdmin.name })).toBeInTheDocument());
    expect(screen.getByText(`@${sampleAdmin.email}`)).toBeInTheDocument();
});
