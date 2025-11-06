import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import ViewQuestion from './ViewQuestion';
import { MemoryRouter, Route } from 'react-router-dom';
import { QuestionsContext, DispatchContext } from '../../contexts/questions.context';
import { UserContext } from '../../contexts/user.context';

jest.mock('../3answers/Answers', () => () => <div data-testid="answers-mock" />);
jest.mock('../4add-editanswer/AddEditAnswer', () => () => <div data-testid="add-edit-answer-mock" />);

const mockFetchQuestion = jest.fn();
const mockFetchQuestions = jest.fn();
const mockVoteQuestion = jest.fn();
const mockDeleteQuestion = jest.fn();

jest.mock('../../rest/useRestQuestions', () => ({
    useFetchQuestion: () => mockFetchQuestion,
    useFetchQuestions: () => mockFetchQuestions,
    useVoteQuestion: () => mockVoteQuestion,
    useDeleteQuestion: () => mockDeleteQuestion
}));

const mockDeleteAnswer = jest.fn();
jest.mock('../../rest/useRestAnswers', () => ({
    useDeleteAnswer: () => mockDeleteAnswer
}));

jest.mock('../../rest/api.rest', () => ({
    API_URL: 'http://mock-api'
}));

jest.mock('reactstrap', () => {
    const React = require('react');
    const Passthrough = ({ children, ...props }) => React.createElement('div', props, children);
    return {
        Alert: ({ children, ...props }) => React.createElement('div', { role: 'alert', ...props, timeout: 0 }, children),
        Row: Passthrough,
        Col: Passthrough,
        Button: ({ children, ...props }) => React.createElement('button', props, children),
        Badge: ({ children, ...props }) => React.createElement('span', props, children),
        Card: Passthrough,
        CardBody: Passthrough,
        CardFooter: Passthrough,
        CardText: ({ children, ...props }) => React.createElement('p', props, children),
        CardTitle: ({ children, ...props }) => React.createElement('h3', props, children),
        Nav: Passthrough,
        NavItem: Passthrough,
        NavLink: ({ children, ...props }) => React.createElement('a', props, children),
    };
});

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

const renderWithProviders = (ui, { questions = [], questionId = '1', user = { userId: 'u1', isAdmin: false } } = {}) => {
    return render(
        <QuestionsContext.Provider value={questions}>
            <DispatchContext.Provider value={jest.fn()}>
                <UserContext.Provider value={user}>
                    <MemoryRouter initialEntries={[`/questions/${questionId}`]}>
                        <Route path="/questions/:questionId">
                            {(routeProps) => React.cloneElement(ui, routeProps)}
                        </Route>
                    </MemoryRouter>
                </UserContext.Provider>
            </DispatchContext.Provider>
        </QuestionsContext.Provider>
    );
};

describe('ViewQuestion', () => {
    it('shows "Question not found" when question is not found', async () => {
        mockFetchQuestion.mockResolvedValueOnce(null);

        renderWithProviders(<ViewQuestion />, { questions: [], questionId: 'notfound' });

        expect(await screen.findByText(/Question not found/i)).toBeInTheDocument();
        expect(mockFetchQuestion).toHaveBeenCalledWith('notfound');
    });

    it('renders question details when question is found', async () => {
        const mockQuestion = {
            _id: '68ee68e62869fd5ce11a7c78',
            title: 'This is a question',
            content: 'So much content in this question',
            votes: 0,
            views: 1,
            tags: [{ _id: '68f63f982eca3e875b58ad7b', name: 'New Tag' }],
            answers: [
                {
                    _id: '68efc054a0c73cb42c0d6a2c',
                    content: 'This is the content of the new answer',
                    votes: 0,
                    questionId: '68ee68e62869fd5ce11a7c78',
                    creator: { _id: '68ecfe5f977174350fab2a37', email: 'admin1@test.com', name: 'User Test 1' },
                    voters: [],
                    createdAt: '2025-10-15T15:40:04.461Z',
                    updatedAt: '2025-10-15T15:40:04.461Z',
                    __v: 0
                }
            ],
            creator: { _id: '68ecfe5f977174350fab2a37', name: 'User Test 1' },
            voters: [],
            createdAt: '2025-10-14T15:14:46.960Z',
            updatedAt: '2025-10-27T15:26:38.538Z',
            __v: 1
        };

        mockFetchQuestion.mockResolvedValueOnce(mockQuestion);
        mockFetchQuestions.mockResolvedValueOnce([mockQuestion]);

        renderWithProviders(<ViewQuestion />, { questions: [mockQuestion], questionId: mockQuestion._id, user: { userId: mockQuestion.creator._id, isAdmin: true } });

        expect(await screen.findByText(/This is a question/i)).toBeInTheDocument();
        expect(screen.getByText(/So much content in this question/i)).toBeInTheDocument();
        expect(screen.getByText(/New Tag/i)).toBeInTheDocument();

        const authorLink = screen.getByText(/User Test 1/i).closest('a');
        expect(authorLink).toHaveAttribute('href', `/profile/${mockQuestion.creator._id}`);

        expect(screen.getByTestId('answers-mock')).toBeInTheDocument();
        expect(screen.getByTestId('add-edit-answer-mock')).toBeInTheDocument();

        await waitFor(() => {
            expect(mockFetchQuestion).toHaveBeenCalledWith(mockQuestion._id);
        });
    });
});
