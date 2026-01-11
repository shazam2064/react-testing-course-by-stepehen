import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import Comments from './Comments';
import { UserContext } from '../../contexts/user.context';
import { CommentsContext, DispatchContext } from '../../contexts/comments.context';

jest.mock('reactstrap', () => {
    const React = require('react');
    const Passthrough = ({ children, ...props }) => React.createElement('div', props, children);
    return {
        Card: Passthrough,
        CardBody: Passthrough,
        CardText: Passthrough,
        Row: Passthrough,
        Col: Passthrough,
        Dropdown: Passthrough,
        DropdownToggle: ({ children, ...props }) => React.createElement('button', props, children),
        DropdownMenu: Passthrough,
        DropdownItem: ({ children, ...props }) => React.createElement('button', props, children)
    };
});

// mock comment rest hooks
const mockLike = jest.fn();
const mockDelete = jest.fn();
jest.mock('../../rest/useRestComments', () => ({
    useLikeComment: () => mockLike,
    useDeleteComment: () => mockDelete
}));

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('Comments component', () => {
    const sampleComment = {
        _id: 'c1',
        text: 'This is a comment text',
        likes: [],
        creator: { _id: 'u1', name: 'Alice', email: 'alice@example.com', image: 'alice.png' },
        createdAt: '2025-10-15T15:40:04.461Z'
    };

    function renderWithProviders(props = {}, { user = { userId: 'u2', token: 'tok', isLogged: true } } = {}) {
        return render(
            <MemoryRouter>
                <UserContext.Provider value={user}>
                    <DispatchContext.Provider value={jest.fn()}>
                        <CommentsContext.Provider value={[]}>
                            <Comments comment={sampleComment} triggerReload={jest.fn()} setError={jest.fn()} {...props} />
                        </CommentsContext.Provider>
                    </DispatchContext.Provider>
                </UserContext.Provider>
            </MemoryRouter>
        );
    }

    it('renders comment content, author link and date and likes count', () => {
        renderWithProviders();

        expect(screen.getByText(/This is a comment text/i)).toBeInTheDocument();

        // author link
        const authorLink = screen.getByText(/Alice/i).closest('a');
        expect(authorLink).toHaveAttribute('href', `/profile/${sampleComment.creator._id}`);

        // date/meta container contains year
        const meta = authorLink.parentElement;
        expect(meta).toBeInTheDocument();
        expect(meta.textContent).toMatch(/2025/);

        // likes count renders (initially 0)
        expect(screen.getByText('0')).toBeInTheDocument();
    });

    it('calls useLikeComment on like and triggers reload on success', async () => {
        const triggerReload = jest.fn();
        // make like resolve
        mockLike.mockResolvedValueOnce({});
        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userId: 'u2', token: 'tok', isLogged: true }}>
                    <DispatchContext.Provider value={jest.fn()}>
                        <CommentsContext.Provider value={[]}>
                            <Comments comment={sampleComment} triggerReload={triggerReload} setError={jest.fn()} />
                        </CommentsContext.Provider>
                    </DispatchContext.Provider>
                </UserContext.Provider>
            </MemoryRouter>
        );

        // click likes area (the number text node)
        fireEvent.click(screen.getByText('0'));

        await waitFor(() => {
            expect(mockLike).toHaveBeenCalledWith(sampleComment._id);
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('sets error and does not trigger reload when like fails', async () => {
        const triggerReload = jest.fn();
        const setError = jest.fn();
        mockLike.mockRejectedValueOnce(new Error('Like failed'));

        render(
            <MemoryRouter>
                <UserContext.Provider value={{ userId: 'u2', token: 'tok', isLogged: true }}>
                    <DispatchContext.Provider value={jest.fn()}>
                        <CommentsContext.Provider value={[]}>
                            <Comments comment={sampleComment} triggerReload={triggerReload} setError={setError} />
                        </CommentsContext.Provider>
                    </DispatchContext.Provider>
                </UserContext.Provider>
            </MemoryRouter>
        );

        fireEvent.click(screen.getByText('0'));

        await waitFor(() => {
            expect(mockLike).toHaveBeenCalledWith(sampleComment._id);
            expect(triggerReload).not.toHaveBeenCalled();
            expect(setError).toHaveBeenCalledWith(expect.stringContaining('comment could not be liked'));
        });
    });
});
