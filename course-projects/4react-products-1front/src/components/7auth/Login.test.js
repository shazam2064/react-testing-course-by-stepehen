// course-projects/4react-products-1front/src/components/7auth/Login.test.js
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import { UserContext, DispatchContext } from '../../contexts/user.context';
import { createServer } from '../../test/server';

const mockDispatch = jest.fn();
const mockHistory = { push: jest.fn() };

const renderWithContext = (loggedUser = null) => {
    return render(
        <UserContext.Provider value={loggedUser}>
            <DispatchContext.Provider value={mockDispatch}>
                <Login history={mockHistory} />
            </DispatchContext.Provider>
        </UserContext.Provider>
    );
};

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders login form', () => {
        renderWithContext();
        expect(screen.getByRole('heading', { name: /login/i })).toBeInTheDocument();
        expect(screen.getByLabelText(/eMail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /login/i })).toBeInTheDocument();
    });

    test('logs in successfully and redirects', async () => {
        createServer([
            {
                method: 'post',
                path: '/auth/login',
                res: () => ({ token: 'mock-token', user: { id: 1, email: 'test@example.com' } }),
            },
        ]);

        renderWithContext();

        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'password123' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({
                type: 'LOGIN',
                payload: { token: 'mock-token', user: { id: 1, email: 'test@example.com' } },
            });
            expect(mockHistory.push).toHaveBeenCalledWith('/');
        });
    });

    test('shows error on failed login', async () => {
        createServer([
            {
                method: 'post',
                path: '/auth/login',
                res: () => { throw new Error('Invalid credentials'); },
            },
        ]);

        renderWithContext();

        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'fail@example.com' } });
        fireEvent.change(screen.getByLabelText(/Password/i), { target: { value: 'wrongpass' } });
        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/login failed\. please try again\./i)).toBeInTheDocument();
            expect(screen.getByRole('alert')).toBeInTheDocument();
        });
    });
});
