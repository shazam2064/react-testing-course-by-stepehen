import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import axios from 'axios';
import { UserContext, DispatchContext } from '../../contexts/user.context';
import { API_URL } from '../../rest/api.rest';

// Mock external dependencies
jest.mock('axios');
const mockedNavigate = jest.fn();
jest.mock('react-router-dom', () => ({
    ...jest.requireActual('react-router-dom'),
    useNavigate: () => mockedNavigate,
}));

// Mock the common helper function
jest.mock('../0commons/form.common', () => ({
    handleChange: jest.fn((e, setState) => {
        setState(prevState => ({ ...prevState, [e.target.name]: e.target.value }));
    }),
}));

// Mock the context providers
const mockDispatch = jest.fn();

// --- Helper function to render the component with its mocked contexts ---
const renderWithContext = (loggedUser = null) => {
    return render(
        <UserContext.Provider value={loggedUser}>
            <DispatchContext.Provider value={mockDispatch}>
                <Login />
            </DispatchContext.Provider>
        </UserContext.Provider>
    );
};

// --- Test Cases ---
describe('Login Component', () => {

    beforeEach(() => {
        // Reset all mocks before each test to ensure a clean state
        jest.clearAllMocks();
    });

    // Test case 1: Successful login
    test('successfully logs in a user and redirects to the homepage', async () => {
        // Arrange
        const mockLoginData = { token: 'mock-token', user: { id: 1, email: 'test@example.com' } };
        axios.post.mockResolvedValue({ data: mockLoginData });

        renderWithContext();

        const emailInput = screen.getByLabelText(/eMail/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Act
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'password123' } });
        fireEvent.click(loginButton);

        // Assert
        await waitFor(() => {
            // Check that the axios POST request was made with the correct data
            expect(axios.post).toHaveBeenCalledWith(
                `${API_URL}/auth/login`,
                { email: 'test@example.com', password: 'password123' }
            );
            // Check that the context dispatch was called with the correct payload
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN', payload: mockLoginData });
            // Check that the navigate function was called
            expect(mockedNavigate).toHaveBeenCalledWith('/');
        });
    });

    // Test case 2: Failed login (API error)
    test('displays an error message on failed login', async () => {
        // Arrange
        axios.post.mockRejectedValue(new Error('Invalid credentials'));

        renderWithContext();

        const emailInput = screen.getByLabelText(/eMail/i);
        const passwordInput = screen.getByLabelText(/Password/i);
        const loginButton = screen.getByRole('button', { name: /Login/i });

        // Act
        fireEvent.change(emailInput, { target: { name: 'email', value: 'test@example.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'wrongpassword' } });
        fireEvent.click(loginButton);

        // Assert
        await waitFor(() => {
            // Check that the error alert is visible
            const errorMessage = screen.getByRole('alert');
            expect(errorMessage).toBeInTheDocument();
            expect(errorMessage).toHaveTextContent('Login failed. Please try again.');
        });
        // Check that navigate was not called
        expect(mockedNavigate).not.toHaveBeenCalled();
    });

    // Test case 3: Input field changes update the component's state
    test('updates form state correctly when input changes', () => {
        // Arrange
        renderWithContext();
        const emailInput = screen.getByLabelText(/eMail/i);
        const passwordInput = screen.getByLabelText(/Password/i);

        // Act
        fireEvent.change(emailInput, { target: { name: 'email', value: 'new@email.com' } });
        fireEvent.change(passwordInput, { target: { name: 'password', value: 'newpassword' } });

        // Assert
        expect(emailInput.value).toBe('new@email.com');
        expect(passwordInput.value).toBe('newpassword');
    });
});
