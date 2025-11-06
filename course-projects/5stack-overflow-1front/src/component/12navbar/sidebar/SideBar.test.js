import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Router } from 'react-router-dom';
import { createMemoryHistory } from 'history';
import SideBar from './SideBar';

describe('SideBar', () => {
  it('renders Home, Questions and Tags links with correct hrefs', () => {
    const history = createMemoryHistory();
    const { container } = render(
      <Router history={history}>
        <SideBar isOpen={true} toggle={jest.fn()} />
      </Router>
    );

    const homeLink = screen.getByText(/Home/i).closest('a');
    const questionsLink = screen.getByText(/Questions/i).closest('a');
    const tagsLink = screen.getByText(/Tags/i).closest('a');

    expect(homeLink).toHaveAttribute('href', '/');
    expect(questionsLink).toHaveAttribute('href', '/questions');
    expect(tagsLink).toHaveAttribute('href', '/tags');

    const sidebar = container.querySelector('.sidebar');
    expect(sidebar).toBeInTheDocument();
  });

  it('applies "is-open" class when isOpen is true and not when false', () => {
    const history = createMemoryHistory();
    const { container: c1 } = render(
      <Router history={history}>
        <SideBar isOpen={true} toggle={jest.fn()} />
      </Router>
    );
    expect(c1.querySelector('.sidebar')).toHaveClass('is-open');

    const { container: c2 } = render(
      <Router history={history}>
        <SideBar isOpen={false} toggle={jest.fn()} />
      </Router>
    );
    expect(c2.querySelector('.sidebar')).not.toHaveClass('is-open');
  });

  it('navigates when a link is clicked', async () => {
    const history = createMemoryHistory({ initialEntries: ['/'] });
    render(
      <Router history={history}>
        <SideBar isOpen={true} toggle={jest.fn()} />
      </Router>
    );

    await userEvent.click(screen.getByText(/Questions/i));
    expect(history.location.pathname).toBe('/questions');

    await userEvent.click(screen.getByText(/Tags/i));
    expect(history.location.pathname).toBe('/tags');
  });
});

