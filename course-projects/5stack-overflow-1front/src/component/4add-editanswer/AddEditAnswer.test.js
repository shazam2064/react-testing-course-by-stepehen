import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import AddEditAnswer from './AddEditAnswer';
import { AnswersContext, DispatchContext } from '../../contexts/answers.context';
import { UserContext } from '../../contexts/user.context';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestAnswers', () => ({
    useCreateAnswer: () => mockCreate,
    useUpdateAnswer: () => mockUpdate
}));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

const renderWithProviders = (ui, { user = { _id: 'u1', name: 'User Test' } } = {}) => {
    return render(
        <UserContext.Provider value={user}>
            <AnswersContext.Provider value={[]}>
                <DispatchContext.Provider value={jest.fn()}>
                    {ui}
                </DispatchContext.Provider>
            </AnswersContext.Provider>
        </UserContext.Provider>
    );
};

describe('AddEditAnswer', () => {
    it('creates an answer on submit (create mode)', async () => {
        const triggerReload = jest.fn();
        mockCreate.mockResolvedValueOnce({});

        renderWithProviders(
            <AddEditAnswer questionId="q1" editMode={false} triggerReloadVote={triggerReload} />
        );

        const textarea = screen.getByLabelText(/Your Answer/i);
        fireEvent.change(textarea, { target: { value: 'New answer content' } });

        fireEvent.click(screen.getByRole('button', { name: /Post Your Answer/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalledWith('q1', 'New answer content');
        });

        expect(triggerReload).toHaveBeenCalled();
        expect(textarea.value).toBe(''); // reset after submit
    });

    it('updates an existing answer in edit mode', async () => {
        const triggerReload = jest.fn();
        const answer = { _id: 'a1', content: 'Existing content' };
        mockUpdate.mockResolvedValueOnce({});

        renderWithProviders(
            <AddEditAnswer answer={answer} questionId="q1" editMode={true} triggerReloadVote={triggerReload} />
        );

        const textarea = screen.getByLabelText(/Your Answer/i);
        expect(textarea.value).toBe('Existing content');

        fireEvent.change(textarea, { target: { value: 'Updated content' } });
        fireEvent.click(screen.getByRole('button', { name: /Update Your Answer/i }));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalledWith('a1', 'Updated content');
            expect(triggerReload).toHaveBeenCalled();
        });
    });

    it('shows validation alert when content is empty', async () => {
        window.alert = jest.fn();

        renderWithProviders(
            <AddEditAnswer questionId="q1" editMode={false} triggerReloadVote={jest.fn()} />
        );

        // submit with empty textarea
        fireEvent.click(screen.getByRole('button', { name: /Post Your Answer/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
        });
    });

    it('displays an error alert when create fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Create failed'));

        renderWithProviders(
            <AddEditAnswer questionId="q1" editMode={false} triggerReloadVote={jest.fn()} />
        );

        const textarea = screen.getByLabelText(/Your Answer/i);
        fireEvent.change(textarea, { target: { value: 'Will fail' } });
        fireEvent.click(screen.getByRole('button', { name: /Post Your Answer/i }));

        await waitFor(() => {
            expect(screen.getByText(/Create failed/i)).toBeInTheDocument();
        });
    });

    it('displays an error alert when update fails', async () => {
        const answer = { _id: 'a2', content: 'Existing' };
        mockUpdate.mockRejectedValueOnce(new Error('Update failed'));

        renderWithProviders(
            <AddEditAnswer answer={answer} questionId="q1" editMode={true} triggerReloadVote={jest.fn()} />
        );

        const textarea = screen.getByLabelText(/Your Answer/i);
        fireEvent.change(textarea, { target: { value: 'Attempt update' } });
        fireEvent.click(screen.getByRole('button', { name: /Update Your Answer/i }));

        await waitFor(() => {
            expect(screen.getByText(/Update failed/i)).toBeInTheDocument();
        });
    });
});
