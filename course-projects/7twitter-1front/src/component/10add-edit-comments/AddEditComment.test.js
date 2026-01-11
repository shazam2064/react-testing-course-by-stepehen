import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditComment from './AddEditComment';
import { CommentsContext, DispatchContext } from '../../contexts/comments.context';
import { UserContext } from '../../contexts/user.context';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestComments', () => ({
    useCreateComment: () => mockCreate,
    useUpdateComment: () => mockUpdate
}));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

const renderWithProviders = (ui, { user = { userId: 'u1', token: 'tok', isLogged: true }, comments = [], dispatch = jest.fn() } = {}) => {
    return render(
        <UserContext.Provider value={user}>
            <CommentsContext.Provider value={comments}>
                <DispatchContext.Provider value={dispatch}>
                    {ui}
                </DispatchContext.Provider>
            </CommentsContext.Provider>
        </UserContext.Provider>
    );
};

describe('AddEditComment', () => {
    it('creates a comment on submit (create mode)', async () => {
        const triggerReload = jest.fn();
        mockCreate.mockResolvedValueOnce({});

        renderWithProviders(
            <AddEditComment tweetId="t1" editMode={false} triggerReload={triggerReload} />
        );

        const textarea = screen.getByPlaceholderText(/Add a comment/i);
        fireEvent.change(textarea, { target: { value: 'New comment content' } });

        await waitFor(() => {
            expect(textarea.value).toBe('New comment content');
        });

        fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith('t1', 'New comment content');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('updates an existing comment in edit mode', async () => {
        const triggerReload = jest.fn();
        const comment = { _id: 'c1', text: 'Existing comment' };
        mockUpdate.mockResolvedValueOnce({});

        renderWithProviders(
            <AddEditComment comment={comment} tweetId="t1" editMode={true} triggerReload={triggerReload} />
        );

        const textarea = screen.getByPlaceholderText(/Add a comment/i);
        expect(textarea.value).toBe('Existing comment');

        fireEvent.change(textarea, { target: { value: 'Updated comment text' } });

        await waitFor(() => {
            expect(textarea.value).toBe('Updated comment text');
        });

        fireEvent.click(screen.getByRole('button', { name: /Update Comment/i }));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('c1', 'Updated comment text');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('shows validation alert when content is empty', async () => {
        window.alert = jest.fn();

        renderWithProviders(
            <AddEditComment tweetId="t1" editMode={false} triggerReload={jest.fn()} />
        );

        fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
        });
    });

    it('displays an error alert when create fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Create failed'));

        renderWithProviders(
            <AddEditComment tweetId="t1" editMode={false} triggerReload={jest.fn()} />
        );

        const textarea = screen.getByPlaceholderText(/Add a comment/i);
        fireEvent.change(textarea, { target: { value: 'Will fail' } });

        await waitFor(() => {
            expect(textarea.value).toBe('Will fail');
        });

        fireEvent.click(screen.getByRole('button', { name: /Add Comment/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
            expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
        });
    });

    it('displays an error alert when update fails', async () => {
        const comment = { _id: 'c2', text: 'Existing' };
        mockUpdate.mockRejectedValueOnce(new Error('Update failed'));

        renderWithProviders(
            <AddEditComment comment={comment} tweetId="t1" editMode={true} triggerReload={jest.fn()} />
        );

        const textarea = screen.getByPlaceholderText(/Add a comment/i);
        fireEvent.change(textarea, { target: { value: 'Attempt update' } });

        await waitFor(() => {
            expect(textarea.value).toBe('Attempt update');
        });

        fireEvent.click(screen.getByRole('button', { name: /Update Comment/i }));

        await waitFor(() => {
            expect(screen.getByText(/An error occurred/i)).toBeInTheDocument();
            expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
        });
    });
});
