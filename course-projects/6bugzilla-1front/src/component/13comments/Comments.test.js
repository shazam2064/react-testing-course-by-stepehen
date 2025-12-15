import React from 'react';
import { render, screen } from '@testing-library/react';
import Comments from './Comments';
import { MemoryRouter } from 'react-router-dom';

afterEach(() => {
  jest.clearAllMocks();
});

test('renders comment author link, date and text', () => {
  const comment = {
    creator: { _id: 'u1', name: 'Alice' },
    createdAt: '2023-01-01T12:00:00Z',
    text: 'This is a comment'
  };

  render(
    <MemoryRouter>
      <Comments comment={comment} />
    </MemoryRouter>
  );

  // author name is rendered as a link to profile
  const authorLink = screen.getByText(/Alice/);
  expect(authorLink).toBeInTheDocument();
  expect(authorLink.closest('a')).toHaveAttribute('href', '/profile/u1');

  // date rendered (loose check for year to avoid locale differences)
  expect(screen.getByText(/2023/)).toBeInTheDocument();

  // comment text
  expect(screen.getByText(/This is a comment/)).toBeInTheDocument();
});

test('renders edited info when updatedBy is present', () => {
  const comment = {
    creator: { _id: 'u2', name: 'Bob' },
    createdAt: '2023-06-10T12:00:00Z',
    text: 'Original text',
    updatedBy: { name: 'Editor' },
    updatedAt: '2023-06-11T12:00:00Z'
  };

  render(
    <MemoryRouter>
      <Comments comment={comment} />
    </MemoryRouter>
  );

  // original content
  expect(screen.getByText(/Original text/)).toBeInTheDocument();

  // edited by info
  expect(screen.getByText(/Edited by Editor/i)).toBeInTheDocument();
  // updatedAt loose check
  expect(screen.getByText(/2023/)).toBeInTheDocument();
});
