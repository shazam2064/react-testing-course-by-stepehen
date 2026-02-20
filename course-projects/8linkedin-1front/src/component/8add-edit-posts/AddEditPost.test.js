import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditPost from './AddEditPost';
import { PostsContext, DispatchContext } from '../../contexts/posts.context';
import { UserContext } from '../../contexts/user.context';

process.env.API_URL = process.env.API_URL || 'http://test';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestPosts', () => ({
    useCreatePost: () => mockCreate,
    useUpdatePost: () => mockUpdate,
}));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

const providers = ({ ui, posts = [], dispatch = jest.fn(), user = { userId: 'u1', email: 'user@test.com', image: 'avatar.png' }, history } = {}) => {
    return render(
        <Router history={history}>
            <PostsContext.Provider value={posts}>
                <DispatchContext.Provider value={dispatch}>
                    <UserContext.Provider value={user}>
                        {ui}
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </PostsContext.Provider>
        </Router>
    );
};

describe('AddEditPost', () => {
    it('creates a post on submit (create mode)', async () => {
        mockCreate.mockResolvedValueOnce({ _id: 'p1' });
        const history = createMemoryHistory({ initialEntries: ['/posts/new'] });
        const triggerReload = jest.fn();
        const toggle = jest.fn();

        providers({
            ui: <Route path="/posts/new" render={(props) => <AddEditPost {...props} isOpen={true} toggle={toggle} triggerReload={triggerReload} />} />,
            history
        });

        // fill textarea
        fireEvent.change(screen.getByPlaceholderText(/Write your post here/i), { target: { value: 'New post content' } });

        // submit via button
        fireEvent.click(screen.getByRole('button', { name: /Add Post/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledTimes(1);
            const calledWith = mockCreate.mock.calls[0][0];
            expect(calledWith.content).toBe('New post content');
            // navigation to the created post view
            expect(history.location.pathname).toBe('/view-post/p1');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('updates an existing post in edit mode', async () => {
        mockUpdate.mockResolvedValueOnce({});
        const existing = {
            _id: 'p-edit',
            content: 'Existing post',
            image: null,
            creator: { _id: 'u1', name: 'User Test', email: 'user@test.com' }
        };
        const history = createMemoryHistory({ initialEntries: ['/posts/edit/p-edit'] });
        const triggerReload = jest.fn();
        const toggle = jest.fn();

        providers({
            ui: <Route path="/posts/edit/:postId" render={(props) => <AddEditPost {...props} postId={props.match.params.postId} isOpen={true} toggle={toggle} triggerReload={triggerReload} />} />,
            posts: [existing],
            history
        });

        // textarea should be prefilled
        const textarea = screen.getByPlaceholderText(/Write your post here/i);
        expect(textarea.value).toBe('Existing post');

        // change and submit
        fireEvent.change(textarea, { target: { value: 'Updated post text' } });
        fireEvent.click(screen.getByRole('button', { name: /Edit Post/i }));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledTimes(1);
            const calledWith = mockUpdate.mock.calls[0][0];
            expect(calledWith._id).toBe('p-edit');
            expect(calledWith.content).toBe('Updated post text');
            expect(history.location.pathname).toBe('/view-post/p-edit');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('shows validation alert when required fields missing', async () => {
        window.alert = jest.fn();
        const history = createMemoryHistory({ initialEntries: ['/posts/new'] });

        providers({
            ui: <Route path="/posts/new" render={(props) => <AddEditPost {...props} isOpen={true} toggle={jest.fn()} triggerReload={jest.fn()} />} />,
            history
        });

        // ensure textarea empty then click save
        fireEvent.click(screen.getByRole('button', { name: /Add Post/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
            expect(mockCreate).not.toHaveBeenCalled();
        });
    });

    it('displays an error alert when create fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Create failed'));
        const history = createMemoryHistory({ initialEntries: ['/posts/new'] });

        providers({
            ui: <Route path="/posts/new" render={(props) => <AddEditPost {...props} isOpen={true} toggle={jest.fn()} triggerReload={jest.fn()} />} />,
            history
        });

        fireEvent.change(screen.getByPlaceholderText(/Write your post here/i), { target: { value: 'Will fail' } });
        fireEvent.click(screen.getByRole('button', { name: /Add Post/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            // Alert in AddEditPost displays "An error occurred" heading and the error message
            expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
            expect(screen.getByText(/Post could not be created|could not be created/i)).toBeInTheDocument();
        });
    });
});

