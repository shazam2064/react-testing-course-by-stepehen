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
    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('renders signup form', () => {
        renderSignup();
        expect(screen.getByRole('heading', {name: /signup/i})).toBeInTheDocument();
        expect(screen.getByLabelText(/name/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/eMail/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/password/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/confirm password/i)).toBeInTheDocument();
        expect(screen.getByRole('button', {name: /signup/i})).toBeInTheDocument();
    });

});


