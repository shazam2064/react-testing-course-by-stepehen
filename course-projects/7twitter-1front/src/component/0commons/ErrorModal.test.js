import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ErrorModal from './ErrorModal';

describe('ErrorModal', () => {
  it('does not render error content when error is null or undefined', () => {
    const { queryByText } = render(<ErrorModal error={null} />);
    expect(queryByText(/Error/i)).toBeNull();
    expect(queryByText(/Close/i)).toBeNull();
  });

  it('shows the modal with the provided error and closes on clicking Close', async () => {
    render(<ErrorModal error="Something went wrong" />);

    // header and error message should be visible
    expect(screen.getByText(/Error/i)).toBeInTheDocument();
    expect(screen.getByText('Something went wrong')).toBeInTheDocument();

    const closeBtn = screen.getByRole('button', { name: /Close/i });
    expect(closeBtn).toBeInTheDocument();

    fireEvent.click(closeBtn);

    // wait for modal to close (internal state change)
    await waitFor(() => {
      expect(screen.queryByText('Something went wrong')).toBeNull();
    });
  });

  it('opens when error prop updates from null to a value', async () => {
    const { rerender } = render(<ErrorModal error={null} />);
    expect(screen.queryByText('Dynamic error')).toBeNull();

    rerender(<ErrorModal error="Dynamic error" />);

    await waitFor(() => {
      expect(screen.getByText('Dynamic error')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Close/i })).toBeInTheDocument();
    });
  });
});

