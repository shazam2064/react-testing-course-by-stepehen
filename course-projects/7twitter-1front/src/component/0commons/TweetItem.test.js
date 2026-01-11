import React from 'react';
import { render, screen, fireEvent, within } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import QuestionItem from './QuestionItem';

const sampleQuestion = {
  _id: '68ee68e62869fd5ce11a7c78',
  title: 'This is a question',
  content: 'So much content in this question',
  votes: 0,
  views: 1,
  answers: ['68efc054a0c73cb42c0d6a2c'],
  tags: [{ _id: '68f63f982eca3e875b58ad7b', name: 'New Tag' }],
  creator: { _id: '68ecfe5f977174350fab2a37', name: 'User Test 1' },
  createdAt: '2025-10-14T15:14:46.960Z'
};

describe('QuestionItem', () => {
  it('renders title, meta and tag/author elements', () => {
    const history = createMemoryHistory();
    const { container } = render(
        <Router history={history}>
          <QuestionItem question={sampleQuestion} />
        </Router>
    );

    expect(screen.getByText(/This is a question/i)).toBeInTheDocument();
    expect(screen.getByText(/So much content in this question/i)).toBeInTheDocument();

    const votesDiv = container.querySelector('.votes');
    expect(votesDiv).toBeInTheDocument();
    expect(within(votesDiv).getByText(String(sampleQuestion.votes))).toBeInTheDocument();
    expect(votesDiv).toHaveTextContent(/votes/i);

    const answersDiv = container.querySelector('.answers');
    expect(answersDiv).toBeInTheDocument();
    expect(within(answersDiv).getByText(String(sampleQuestion.answers.length))).toBeInTheDocument();
    expect(answersDiv).toHaveTextContent(/answers/i);

    const viewsDiv = container.querySelector('.views');
    expect(viewsDiv).toBeInTheDocument();
    expect(within(viewsDiv).getByText(String(sampleQuestion.views))).toBeInTheDocument();
    expect(viewsDiv).toHaveTextContent(/views/i);

    expect(screen.getByText(/New Tag/i)).toBeInTheDocument();

    const authorLink = screen.getByText(/User Test 1/i).closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${sampleQuestion.creator._id}`);
  });

  it('navigates to view-question when title is clicked', () => {
    const history = createMemoryHistory();
    render(
        <Router history={history}>
          <QuestionItem question={sampleQuestion} />
        </Router>
    );

    const title = screen.getByText(/This is a question/i);
    fireEvent.click(title);

    expect(history.location.pathname).toBe(`/view-question/${sampleQuestion._id}`);
  });

  it('renders multiple tags when present', () => {
    const history = createMemoryHistory();
    const q = {
      ...sampleQuestion,
      tags: [
        { _id: '68f63f982eca3e875b58ad7b', name: 'New Tag' },
        { _id: 't2', name: 'Tag2' }
      ]
    };

    render(
        <Router history={history}>
          <QuestionItem question={q} />
        </Router>
    );

    expect(screen.getByText(/New Tag/i)).toBeInTheDocument();
    expect(screen.getByText(/Tag2/i)).toBeInTheDocument();
  });
});
