import { render, screen } from '@testing-library/react';
import user from "@testing-library/user-event";
import Login from './Login';

test('renders Login component with input fields and button', () => {
    jest.mock('axios');
    render(<Login />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);
    const loginButton = screen.getByRole('button', { name: /login/i });

    expect(emailInput).toBeInTheDocument();
    expect(passwordInput).toBeInTheDocument();
    expect(loginButton).toBeInTheDocument();
});

test('allows user to type into input fields', async () => {
    render(<Login />);

    const emailInput = screen.getByPlaceholderText(/email/i);
    const passwordInput = screen.getByPlaceholderText(/password/i);

    await user.type(emailInput, 'test@example.com');
    await user.type(passwordInput, 'password123');

    expect(emailInput).toHaveValue('test@example.com');
    expect(passwordInput).toHaveValue('password123');
});

test('calls submit handler on form submission', async () => {
    const mockSubmit = jest.fn();
    render(<Login onSubmit={mockSubmit} />);

    const loginButton = screen.getByRole('button', { name: /login/i });

    await user.click(loginButton);

    expect(mockSubmit).toHaveBeenCalled();
});