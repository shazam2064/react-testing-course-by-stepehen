import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import QuestionItem from './QuestionItem';

const sampleQuestion = {
  _id: 'q1',
  title: 'First question',
  content: 'This is the content for the first question used in tests.',
  votes: 2,
  views: 5,
  answers: [],
  tags: [{ _id: 't1', name: 'Tag1' }],
  creator: { _id: 'u1', name: 'User One' },
  createdAt: '2025-10-01T00:00:00.000Z'
};

describe('QuestionItem', () => {
  it('renders title, meta and tag/author elements', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <QuestionItem question={sampleQuestion} />
      </Router>
    );

    expect(screen.getByText(/First question/i)).toBeInTheDocument();
    expect(screen.getByText(/This is the content for the first question/i)).toBeInTheDocument();

    expect(screen.getByText(/2\s+votes/i)).toBeInTheDocument();
    expect(screen.getByText(/0\s+answers/i)).toBeInTheDocument();
    expect(screen.getByText(/5\s+views/i)).toBeInTheDocument();

    expect(screen.getByText(/Tag1/i)).toBeInTheDocument();

    const authorLink = screen.getByText(/User One/i).closest('a');
    expect(authorLink).toHaveAttribute('href', `/profile/${sampleQuestion.creator._id}`);
  });

  it('navigates to view-question when title is clicked', () => {
    const history = createMemoryHistory();
    render(
      <Router history={history}>
        <QuestionItem question={sampleQuestion} />
      </Router>
    );

    const title = screen.getByText(/First question/i);
    fireEvent.click(title);

    expect(history.location.pathname).toBe(`/view-question/${sampleQuestion._id}`);
  });

  it('renders multiple tags when present', () => {
    const history = createMemoryHistory();
    const q = {
      ...sampleQuestion,
      tags: [
        { _id: 't1', name: 'Tag1' },
        { _id: 't2', name: 'Tag2' }
      ]
    };

    render(
      <Router history={history}>
        <QuestionItem question={q} />
      </Router>
    );

    expect(screen.getByText(/Tag1/i)).toBeInTheDocument();
    expect(screen.getByText(/Tag2/i)).toBeInTheDocument();
  });
});

