import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Signup from './Signup';
import axios from 'axios';

jest.mock('axios');

const mockHistory = { push: jest.fn() };

const renderSignup = () => {
    return render(<Signup history={mockHistory} />);
};

describe('Signup Component', () => {
    test('renders signup form', () => {
        renderSignup();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/eMail/i)).toBeInTheDocument();
        expect(screen.getByLabelText('Password')).toBeInTheDocument();
        expect(screen.getByLabelText('Confirm Password')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /signup/i })).toBeInTheDocument();
    });
});


