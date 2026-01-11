import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Login from './Login';
import axios from 'axios';
import { UserContext, DispatchContext } from '../../contexts/user.context';

let TitleContext;
try {
    const mod = require('../../contexts/title.context');
    TitleContext = mod && (mod.TitleContext || mod.default || mod);
} catch (err) {
    TitleContext = React.createContext({ setTitle: () => {} });
}

jest.mock('axios');

const mockHistory = { push: jest.fn() };

function renderLogin(mockDispatch = jest.fn(), mockSetTitle = jest.fn()) {
    return render(
        <UserContext.Provider value={null}>
            <TitleContext.Provider value={{ setTitle: mockSetTitle }}>
                <DispatchContext.Provider value={mockDispatch}>
                    <Login history={mockHistory} />
                </DispatchContext.Provider>
            </TitleContext.Provider>
        </UserContext.Provider>
    );
}

describe('Login smoke test', () => {
    it('runs a basic assertion', () => {
        expect(true).toBe(true);
    });
});

describe('Login Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sends correct payload to API on submit', async () => {
        axios.post.mockResolvedValueOnce({ data: { token: 't', user: { id: '1' } } });
        renderLogin();

        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'secret' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(axios.post).toHaveBeenCalledTimes(1);
        });

        expect(axios.post).toHaveBeenCalledWith(
            expect.stringContaining('/auth/login'),
            { email: 'test@example.com', password: 'secret' }
        );
    });

    test('dispatches LOGIN and redirects on success', async () => {
        const mockDispatch = jest.fn();
        const responseData = { token: 'tkn', user: { id: 'u1' } };
        axios.post.mockResolvedValueOnce({ data: responseData });

        renderLogin(mockDispatch);

        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'admin1@test.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'adminpw' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(mockDispatch).toHaveBeenCalledWith({ type: 'LOGIN', payload: responseData });
            expect(mockHistory.push).toHaveBeenCalledWith('/');
        });
    });

    test('displays error message when login fails', async () => {
        axios.post.mockRejectedValueOnce(new Error('Network error'));
        renderLogin();

        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'fail@example.com' } });
        fireEvent.change(screen.getByLabelText(/password/i), { target: { value: 'badpw' } });

        fireEvent.click(screen.getByRole('button', { name: /login/i }));

        await waitFor(() => {
            expect(screen.getByText(/login failed\. please try again\./i)).toBeInTheDocument();
            expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
        });
    });
});
