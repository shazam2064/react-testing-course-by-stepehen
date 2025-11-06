import React from 'react';
import { render, screen, fireEvent, waitFor, cleanup } from '@testing-library/react';
import { Router, Route } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import AddEditQuestion from './AddEditQuestion';
import { QuestionsContext } from '../../contexts/questions.context';
import { TagsContext } from '../../contexts/tags.context';
import { UserContext } from '../../contexts/user.context';

const mockCreate = jest.fn();
const mockUpdate = jest.fn();

jest.mock('../../rest/useRestQuestions', () => ({
    useCreateQuestion: () => mockCreate,
    useUpdateQuestion: () => mockUpdate
}));

afterEach(() => {
    jest.resetAllMocks();
    cleanup();
});

const providers = ({ ui, questions = [], tags = [], user = { _id: 'u1', name: 'User Test' }, history }) => {
    return render(
        <Router history={history}>
            <QuestionsContext.Provider value={questions}>
                <TagsContext.Provider value={tags}>
                    <UserContext.Provider value={user}>
                        {ui}
                    </UserContext.Provider>
                </TagsContext.Provider>
            </QuestionsContext.Provider>
        </Router>
    );
};

describe('AddEditQuestion', () => {
    it('creates a question on submit (create mode)', async () => {
        mockCreate.mockResolvedValueOnce({});
        const history = createMemoryHistory({ initialEntries: ['/questions/new'] });

        providers({
            ui: <Route path="/questions/new" render={(props) => <AddEditQuestion {...props} />} />,
            tags: [{ _id: 't1', name: 'Tag1' }],
            history
        });

        // fill form
        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'New Q' } });
        fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'Question content' } });

        // select tag
        fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 't1' } });

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            const calledWith = mockCreate.mock.calls[0][0];
            expect(calledWith.title).toBe('New Q');
            expect(calledWith.content).toBe('Question content');
            expect(calledWith.tags).toEqual(expect.arrayContaining(['t1']));
            expect(history.location.pathname).toBe('/questions');
        });
    });

    it('updates an existing question in edit mode', async () => {
        mockUpdate.mockResolvedValueOnce({});
        const existing = {
            _id: 'q1',
            title: 'Existing Q',
            content: 'Existing content',
            tags: []
        };
        const history = createMemoryHistory({ initialEntries: ['/questions/edit/q1'] });

        providers({
            ui: <Route path="/questions/edit/:questionId" render={(props) => <AddEditQuestion {...props} />} />,
            questions: [existing],
            tags: [{ _id: 't1', name: 'Tag1' }],
            history
        });

        // initial values populated
        const titleInput = screen.getByLabelText(/Title/i);
        const contentInput = screen.getByLabelText(/Content/i);
        expect(titleInput.value).toBe('Existing Q');
        expect(contentInput.value).toBe('Existing content');

        // change values and add tag
        fireEvent.change(titleInput, { target: { value: 'Updated Q' } });
        fireEvent.change(contentInput, { target: { value: 'Updated content' } });
        fireEvent.change(screen.getByLabelText(/Tags/i), { target: { value: 't1' } });

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(mockUpdate).toHaveBeenCalled();
            const calledWith = mockUpdate.mock.calls[0][0];
            expect(calledWith._id).toBe('q1');
            expect(calledWith.title).toBe('Updated Q');
            expect(calledWith.content).toBe('Updated content');
            expect(calledWith.tags).toEqual(expect.arrayContaining(['t1']));
            expect(history.location.pathname).toBe('/questions');
        });
    });

    it('shows validation alert when required fields missing', async () => {
        window.alert = jest.fn();
        const history = createMemoryHistory({ initialEntries: ['/questions/new'] });

        providers({
            ui: <Route path="/questions/new" render={(props) => <AddEditQuestion {...props} />} />,
            history
        });

        // leave empty and submit
        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(window.alert).toHaveBeenCalledWith('Please fill in the missing fields');
            expect(mockCreate).not.toHaveBeenCalled();
        });
    });

    it('displays an error alert when create fails', async () => {
        mockCreate.mockRejectedValueOnce(new Error('Create failed'));
        const history = createMemoryHistory({ initialEntries: ['/questions/new'] });

        providers({
            ui: <Route path="/questions/new" render={(props) => <AddEditQuestion {...props} />} />,
            history
        });

        fireEvent.change(screen.getByLabelText(/Title/i), { target: { value: 'Fail Q' } });
        fireEvent.change(screen.getByLabelText(/Content/i), { target: { value: 'Will fail' } });

        fireEvent.click(screen.getByRole('button', { name: /Save/i }));

        await waitFor(() => {
            expect(mockCreate).toHaveBeenCalled();
            expect(screen.getByText(/could not be created/i)).toBeInTheDocument();
        });
    });
});

