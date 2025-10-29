import React from 'react';
import { render, screen, waitFor, cleanup } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import ViewQuestion from './ViewQuestion';
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

afterEach(() => {
    jest.clearAllMocks();
    cleanup();
});

describe('ViewQuestion', () => {
    it('shows "Question not found" when fetchQuestion returns null', async () => {
        mockFetchQuestion.mockResolvedValueOnce(null);

        render(
            <QuestionsContext.Provider value={[]}>
                <DispatchContext.Provider value={jest.fn()}>
                    <UserContext.Provider value={{ userId: 'u1', isAdmin: false }}>
                        <MemoryRouter>
                            <ViewQuestion match={{ params: { questionId: 'nonexistent' } }} />
                        </MemoryRouter>
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </QuestionsContext.Provider>
        );

        const notFound = await screen.findByText(/Question not found/i);
        expect(notFound).toBeInTheDocument();
        expect(mockFetchQuestion).toHaveBeenCalledWith('nonexistent');
    });

    it('renders question details when fetchQuestion returns a question', async () => {
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

        render(
            <QuestionsContext.Provider value={[mockQuestion]}>
                <DispatchContext.Provider value={jest.fn()}>
                    <UserContext.Provider value={{ userId: mockQuestion.creator._id, isAdmin: true }}>
                        <MemoryRouter>
                            <ViewQuestion match={{ params: { questionId: mockQuestion._id } }} />
                        </MemoryRouter>
                    </UserContext.Provider>
                </DispatchContext.Provider>
            </QuestionsContext.Provider>
        );

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

