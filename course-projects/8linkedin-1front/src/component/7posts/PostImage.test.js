import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import PostImage from './PostImage';

describe('PostImage', () => {
  const imageUrl = 'http://example.com/image.jpg';

  it('renders the image and shows collapsed state initially', () => {
    render(<PostImage imageUrl={imageUrl} />);

    const img = screen.getByAltText('Post');
    expect(img).toBeInTheDocument();
    expect(img).toHaveAttribute('src', imageUrl);

    // container that controls height is the image's parent element
    const container = img.parentElement;
    expect(container).toBeTruthy();
    // initial collapsed height should be "200px"
    expect(container.style.height).toBe('200px');

    // overlay (fade) exists when collapsed
    const overlay = container.querySelector('div[style*="linear-gradient"]');
    expect(overlay).toBeTruthy();

    // button shows "See More"
    expect(screen.getByRole('button', { name: /See More/i })).toBeInTheDocument();
  });

  it('toggles expanded/collapsed state when clicking the button', () => {
    render(<PostImage imageUrl={imageUrl} />);

    const img = screen.getByAltText('Post');
    const container = img.parentElement;
    const button = screen.getByRole('button', { name: /See More/i });

    // expand
    fireEvent.click(button);
    expect(container.style.height).toBe('auto');
    expect(screen.getByRole('button', { name: /See Less/i })).toBeInTheDocument();
    // overlay should be removed when expanded
    const overlayAfterExpand = container.querySelector('div[style*="linear-gradient"]');
    expect(overlayAfterExpand).toBeNull();

    // collapse again
    fireEvent.click(screen.getByRole('button', { name: /See Less/i }));
    expect(container.style.height).toBe('200px');
    expect(screen.getByRole('button', { name: /See More/i })).toBeInTheDocument();
    const overlayAfterCollapse = container.querySelector('div[style*="linear-gradient"]');
    expect(overlayAfterCollapse).toBeTruthy();
  });
});

