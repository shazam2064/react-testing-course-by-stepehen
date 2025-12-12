import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ViewBug from './ViewBug';
import { BugsContext, DispatchContext } from '../../contexts/bugs.context';
import { UserContext } from '../../contexts/user.context';
import * as restBugs from '../../rest/useRestBugs';
import * as restComments from '../../rest/useRestComments';

// Mock child components to keep tests focused
jest.mock('../14add-edit-comments/AddEditComment', () => (props) => <div data-testid="add-edit-comment" />);
jest.mock('../13comments/Comments', () => (props) => <div data-testid="comment-display">{props.comment ? props.comment.content : ''}</div>);

// Mocks for hooks
const mockFetchBugs = jest.fn();
jest.spyOn(restBugs, 'useFetchBugs').mockImplementation(() => mockFetchBugs);

const mockDeleteComment = jest.fn();
jest.spyOn(restComments, 'useDeleteComment').mockImplementation(() => mockDeleteComment);

const mockDispatch = jest.fn();

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

const renderWithProviders = (ui, { bugs = [], user = { userId: 'admin-1', isAdmin: true } } = {}, history = null, routePath = null) => {
    const Wrapper = ({ children }) => (
        <UserContext.Provider value={user}>
            <BugsContext.Provider value={bugs}>
                <DispatchContext.Provider value={mockDispatch}>
                    {children}
                </DispatchContext.Provider>
            </BugsContext.Provider>
        </UserContext.Provider>
    );

    if (history && routePath) {
        return render(
            <Wrapper>
                <Router history={history}>
                    <Route path={routePath} render={(routeProps) => React.cloneElement(ui, routeProps)} />
                </Router>
            </Wrapper>
        );
    }

    if (history) {
        return render(
            <Wrapper>
                <Router history={history}>{ui}</Router>
            </Wrapper>
        );
    }

    return render(
        <Wrapper>
            {ui}
        </Wrapper>
    );
};

describe('ViewBug', () => {
    it('renders bug details, dependencies, CC and comments and navigates when dependency clicked', async () => {
        const bug = {
            _id: 'b1',
            summary: 'Bug Summary',
            status: 'Open',
            resolution: '',
            product: { name: 'Prod1' },
            component: { name: 'Comp1' },
            version: '1.0',
            hardware: 'PC',
            os: 'Windows',
            severity: 'Major',
            priority: 'High',
            deadline: '2025-12-31T00:00:00.000Z',
            assignee: { name: 'Assignee' },
            dependencies: [{ _id: 'd1', summary: 'Dep1' }],
            reporter: { _id: 'u1', name: 'Reporter' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            CC: [{ _id: 'cc1', email: 'cc1@example.com' }],
            attachment: null,
            comments: [{ _id: 'cm1', creator: { _id: 'u2', name: 'Commenter' }, content: 'Nice comment' }]
        };

        mockFetchBugs.mockResolvedValueOnce([bug]);

        const history = createMemoryHistory({ initialEntries: ['/view-bug/b1'] });
        const routePath = '/view-bug/:bugId';

        renderWithProviders(<ViewBug />, {}, history, routePath);

        // wait for the UI to update with fetched bug data
        await waitFor(() => expect(screen.getByText(/Bug Summary/i)).toBeInTheDocument());

        expect(screen.getByText(/Prod1/i)).toBeInTheDocument();
        expect(screen.getByText(/Comp1/i)).toBeInTheDocument();
        expect(screen.getByText(/Dep1/i)).toBeInTheDocument();
        expect(screen.getByText(/cc1@example.com/i)).toBeInTheDocument();
        expect(screen.getByText(/1 Comments/i)).toBeInTheDocument();

        // clicking dependency should navigate to that bug view
        fireEvent.click(screen.getByText(/Dep1/i));
        expect(history.location.pathname).toBe('/view-bug/d1');
    });

    it('shows "Bug not found..." when no matching bug exists', async () => {
        mockFetchBugs.mockResolvedValueOnce([]); // fetch returns empty
        const history = createMemoryHistory({ initialEntries: ['/view-bug/missing'] });
        const routePath = '/view-bug/:bugId';

        renderWithProviders(<ViewBug />, {}, history, routePath);

        // wait for UI to reflect not-found state
        await waitFor(() => expect(screen.getByText(/Bug not found/i)).toBeInTheDocument());
    });

    it('shows error when fetch fails', async () => {
        mockFetchBugs.mockRejectedValueOnce(new Error('Fetch failed'));
        const history = createMemoryHistory({ initialEntries: ['/view-bug/err'] });
        const routePath = '/view-bug/:bugId';

        renderWithProviders(<ViewBug />, {}, history, routePath);

        await waitFor(() => {
            expect(screen.getByText(/Questions could not be retrieved/i)).toBeInTheDocument();
        });
    });

    it('delete comment calls deleteComment and dispatches delete action', async () => {
        const bug = {
            _id: 'b2',
            summary: 'Bug Two',
            status: 'Open',
            product: { name: 'P' },
            component: { name: 'C' },
            version: '1',
            hardware: '',
            os: '',
            severity: '',
            priority: '',
            deadline: null,
            assignee: { name: '' },
            dependencies: [],
            reporter: { _id: 'u1', name: 'Reporter' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            CC: [],
            attachment: null,
            comments: [{ _id: 'cm2', creator: { _id: 'admin-1', name: 'Admin' }, content: 'To be deleted' }]
        };

        mockFetchBugs.mockResolvedValueOnce([bug]);
        mockDeleteComment.mockResolvedValueOnce();

        const history = createMemoryHistory({ initialEntries: ['/view-bug/b2'] });
        const routePath = '/view-bug/:bugId';

        renderWithProviders(<ViewBug />, {}, history, routePath);

        // wait for comment to be rendered
        await waitFor(() => expect(screen.getByText(/To be deleted/i)).toBeInTheDocument());

        // Delete button exists (rendered because user is admin)
        const deleteBtn = screen.getByText(/Delete/i);
        fireEvent.click(deleteBtn);

        await waitFor(() => {
            expect(mockDeleteComment).toHaveBeenCalledWith('cm2');
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'DELETE_ANSWER', payload: { _id: 'cm2' } });
        });
    });

    it('edit button navigates to edit-bug page', async () => {
        const bug = {
            _id: 'b3',
            summary: 'Bug Three',
            status: 'Open',
            product: { name: 'P' },
            component: { name: 'C' },
            version: '1',
            hardware: '',
            os: '',
            severity: '',
            priority: '',
            deadline: null,
            assignee: { name: '' },
            dependencies: [],
            reporter: { _id: 'u1', name: 'Reporter' },
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            CC: [],
            attachment: null,
            comments: []
        };

        mockFetchBugs.mockResolvedValueOnce([bug]);

        const history = createMemoryHistory({ initialEntries: ['/view-bug/b3'] });
        const routePath = '/view-bug/:bugId';

        renderWithProviders(<ViewBug />, {}, history, routePath);

        await waitFor(() => expect(screen.getByText(/Bug Three/i)).toBeInTheDocument());

        const editBtn = screen.getByText(/Edit Bug/i);
        fireEvent.click(editBtn);
        expect(history.location.pathname).toBe('/edit-bug/b3');
    });
});
