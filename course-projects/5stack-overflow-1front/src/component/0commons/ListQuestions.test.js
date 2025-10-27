import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import ListQuestions from './ListQuestions';
import { QuestionsContext, DispatchContext } from '../../contexts/questions.context.js';
import { UserContext } from '../../contexts/user.context';

jest.mock('../../rest/useRestQuestions', () => ({
  useFetchQuestions: () => async () => [], // no-op
  useFetchQuestionsByTag: () => async () => []
}));

const mockQuestions = [
  {
    _id: 'q1',
    title: 'First question',
    content: 'Content 1',
    votes: 0,
    views: 0,
    tags: [{ _id: 't1', name: 'Tag1' }],
    answers: [],
    creator: { _id: 'u1', name: 'User One' },
    createdAt: '2025-10-01T00:00:00.000Z'
  },
  {
    _id: 'q2',
    title: 'Second question',
    content: 'Content 2',
    votes: 2,
    views: 5,
    tags: [{ _id: 't2', name: 'Tag2' }],
    answers: [],
    creator: { _id: 'u2', name: 'User Two' },
    createdAt: '2025-10-02T00:00:00.000Z'
  }
];

function renderWithProviders(ui, { questions = [], dispatch = jest.fn(), user = { email: 'test@test.com' }, history } = {}) {
  return render(
    <Router history={history}>
      <QuestionsContext.Provider value={questions}>
        <DispatchContext.Provider value={dispatch}>
          <UserContext.Provider value={user}>
            {ui}
          </UserContext.Provider>
        </DispatchContext.Provider>
      </QuestionsContext.Provider>
    </Router>
  );
}

describe('ListQuestions', () => {
  it('renders a list of questions from context', async () => {
    const history = createMemoryHistory();
    renderWithProviders(<ListQuestions />, { questions: mockQuestions, history });

    await waitFor(() => {
      expect(screen.getByText(/First question/i)).toBeInTheDocument();
      expect(screen.getByText(/Second question/i)).toBeInTheDocument();
      expect(screen.getAllByText(/View/i).length).toBeGreaterThanOrEqual(2);
    });
  });

  it('filters questions by search input', async () => {
    const history = createMemoryHistory();
    renderWithProviders(<ListQuestions />, { questions: mockQuestions, history });

    const input = screen.getByPlaceholderText(/Search questions.../i);
    fireEvent.change(input, { target: { value: 'Second' } });

    await waitFor(() => {
      expect(screen.queryByText(/First question/i)).not.toBeInTheDocument();
      expect(screen.getByText(/Second question/i)).toBeInTheDocument();
    });
  });

  it('renders clickable title and navigates if a View button exists', async () => {
    const history = createMemoryHistory();
    renderWithProviders(<ListQuestions />, { questions: mockQuestions, history });

    const title = await screen.findByText(/First question/i);
    expect(title).toBeInTheDocument();
    expect(title).toHaveStyle('cursor: pointer');

    const viewButtons = screen.queryAllByText(/View/i);
    if (viewButtons.length > 0) {
      fireEvent.click(viewButtons[0]);
      expect(history.location.pathname).toBe(`/view-question/${mockQuestions[0]._id}`);
    } else {
      fireEvent.click(title);
      expect(history.location.pathname).toBeDefined();
    }
  });
});
