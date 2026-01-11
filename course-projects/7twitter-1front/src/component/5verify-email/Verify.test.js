import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import Verify from './Verify';
import axios from 'axios';
import { API_URL } from '../../rest/api.rest';

jest.mock('axios');

afterEach(() => {
  jest.resetAllMocks();
});

function renderVerify(token, mockPush = jest.fn(), mockSetTitle = jest.fn()) {
  return render(
      <Verify match={{ params: { token } }} history={{ push: mockPush }} />
  );
}

describe('Verify component', () => {
  it('shows success message and navigates to login on click', async () => {
    const token = 'valid-token';
    axios.get.mockResolvedValueOnce({ data: { message: 'ok' } });
    const mockPush = jest.fn();
    const mockSetTitle = jest.fn();

    renderVerify(token, mockPush, mockSetTitle);

    await waitFor(() =>
      expect(screen.getByText(/Email verified successfully/i)).toBeInTheDocument()
    );

    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/auth/verify/${token}`);

    const loginLink = screen.getByText(/Login/i);
    fireEvent.click(loginLink);
    expect(mockPush).toHaveBeenCalledWith('/login');
  });

  it('shows failure message when token is invalid', async () => {
    const token = 'invalid-token';
    axios.get.mockRejectedValueOnce({ response: { status: 400 } });
    const mockPush = jest.fn();
    const mockSetTitle = jest.fn();

    renderVerify(token, mockPush, mockSetTitle);

    await waitFor(() =>
      expect(screen.getByText(/Email verification failed/i)).toBeInTheDocument()
    );

    expect(screen.queryByText(/Login/i)).toBeNull();
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/auth/verify/${token}`);
  });

  it('shows failure message on network/server error', async () => {
    const token = 'network-error-token';
    axios.get.mockRejectedValueOnce(new Error('Network Error'));
    const mockPush = jest.fn();
    const spy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const mockSetTitle = jest.fn();

    renderVerify(token, mockPush, mockSetTitle);

    await waitFor(() =>
      expect(screen.getByText(/Email verification failed/i)).toBeInTheDocument()
    );

    expect(screen.queryByText(/Login/i)).toBeNull();
    expect(axios.get).toHaveBeenCalledWith(`${API_URL}/auth/verify/${token}`);

    spy.mockRestore();
  });
});
