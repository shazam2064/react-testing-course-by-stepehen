import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { API_URL } from '../../rest/api.rest';
import { Alert } from 'reactstrap';

const Verify = (props) => {
    const { token } = props.match.params;
    const [message, setMessage] = useState('');
    const [success, setSuccess] = useState(false);

    const verifyEmail = async () => {
        try {
            const response = await axios.get(`${API_URL}/auth/verify/${token}`);
            setMessage('Email verified successfully! You can now log in.');
            console.log('Email verification response:', response);
            setSuccess(true);
        } catch (error) {
            setMessage('Email verification failed. The token is invalid or has expired.');
            console.error('Email verification error:', error);
            setSuccess(false);
        }
    };

    useEffect(() => {
        verifyEmail();
    }, [token]);

    return (
        <div className="container">
            <Alert color={success ? 'success' : 'danger'}>
                <h2 className="alert-heading">Email Verification</h2>
                {message}
                <hr/>
                {success &&
                <p className="mb-0">
                    Go to <a
                    className="alert-link"
                    onClick={() => props.history.push('/login')}>
                    Login
                </a>.
                </p> }
            </Alert>
        </div>
    );
};

export default Verify;