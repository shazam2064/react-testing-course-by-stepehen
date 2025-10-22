import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';
import axios from 'axios';

jest.mock('axios');

const mockHistory = { push: jest.fn() };
const renderSignup = () => render(<Signup history={mockHistory} />);

describe('Signup Component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('sends correct payload to API on submit', async () => {
        axios.put.mockResolvedValueOnce({ data: { success: true } });
        renderSignup();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Test User' } });
        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'test@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'password123' } });

        fireEvent.click(screen.getByRole('button', { name: /signup/i }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledTimes(1);
        });

        expect(axios.put).toHaveBeenCalledWith(
            expect.stringContaining('/auth/signup'),
            { name: 'Test User', email: 'test@example.com', password: 'password123' }
        );
    });

    test('does not include confirmPassword in request payload', async () => {
        axios.put.mockResolvedValueOnce({ data: { success: true } });
        renderSignup();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'A' } });
        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'a@b.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'pw' } });
        fireEvent.change(screen.getByLabelText(/confirm password/i), { target: { value: 'pw' } });

        fireEvent.click(screen.getByRole('button', { name: /signup/i }));

        await waitFor(() => {
            expect(axios.put).toHaveBeenCalledTimes(1);
        });

        const sentPayload = axios.put.mock.calls[0][1];
        expect(sentPayload).not.toHaveProperty('confirmPassword');
    });

    test('displays error message when signup fails', async () => {
        axios.put.mockRejectedValueOnce(new Error('Network error'));
        renderSignup();

        fireEvent.change(screen.getByLabelText(/name/i), { target: { value: 'Fail User' } });
        fireEvent.change(screen.getByLabelText(/eMail/i), { target: { value: 'fail@example.com' } });
        fireEvent.change(screen.getByLabelText('Password'), { target: { value: 'badpw' } });

        fireEvent.click(screen.getByRole('button', { name: /signup/i }));

        await waitFor(() => {
            expect(screen.getByText(/signup failed\. please try again\./i)).toBeInTheDocument();
            expect(screen.getByText(/an error occurred/i)).toBeInTheDocument();
        });
    });
});
