import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TweetImage from './TweetImage';

describe('TweetImage component', () => {
  const sampleUrl = 'https://example.com/image.jpg';

  it('renders the image and shows "See More" initially with overlay', () => {
    const { container } = render(<TweetImage imageUrl={sampleUrl} />);

    const img = screen.getByAltText('Tweet');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', sampleUrl);

    const btn = screen.getByRole('button', { name: /see more/i });
    expect(btn).toBeInTheDocument();

    const overlay = container.querySelector('[style*="linear-gradient"]');
    expect(overlay).toBeTruthy();
  });

  it('toggles expanded state: See More -> See Less and overlay visibility changes', () => {
    const { container } = render(<TweetImage imageUrl={sampleUrl} />);

    const toggleBtn = screen.getByRole('button', { name: /see more/i });
    fireEvent.click(toggleBtn);

    expect(screen.getByRole('button', { name: /see less/i })).toBeInTheDocument();

    const overlayAfterExpand = container.querySelector('[style*="linear-gradient"]');
    expect(overlayAfterExpand).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: /see less/i }));
    expect(screen.getByRole('button', { name: /see more/i })).toBeInTheDocument();

    const overlayAfterCollapse = container.querySelector('[style*="linear-gradient"]');
    expect(overlayAfterCollapse).toBeTruthy();
  });
});

