import React, { useState, useContext, useEffect } from 'react';
import { handleChange } from '../0commons/form.common';
import { UserContext, DispatchContext } from '../../contexts/user.context';
import axios from "axios";
import { API_URL } from '../../rest/api.rest';
import { Alert, Button, Form, FormGroup } from "reactstrap";
import { useNavigate } from 'react-router-dom';

function Login() {
    const [user, setUser] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const [visible, setVisible] = useState(true);
    const navigate = useNavigate();

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        console.log('Current loggedUser:', loggedUser);
    }, [loggedUser]);

    const loginUser = async () => {
        try {
            const response = await axios.post(`${API_URL}/auth/login`, user);
            loggedDispatch({ type: 'LOGIN', payload: response.data });
            navigate('/');
        } catch (err) {
            setError('Login failed. Please try again.');
        }
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        loginUser();
    };

    return (
        <div className="container p-s5 my-4 col-4 offset-4">
            <h1 className="mb-3 text-center display-3">Login</h1>
            <main>
                {error ?
                    <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">An error occurred</h4>
                        {error}
                    </Alert> : null}
                <Form action="/login" method="POST" onSubmit={handleSubmit}>
                    <FormGroup>
                        <label htmlFor="email">eMail</label>
                        <input
                            type="email"
                            name="email"
                            id="email"
                            className="form-control"
                            onChange={(e) => handleChange(e, setUser)}
                            value={user.email}
                        />
                    </FormGroup>
                    <FormGroup>
                        <label htmlFor="password">Password</label>
                        <input
                            type="password"
                            name="password"
                            id="password"
                            className="form-control"
                            onChange={(e) => handleChange(e, setUser)}
                            value={user.password}
                        />
                    </FormGroup>
                    <div className="d-flex align-items-center justify-content-center">
                        <button className="btn btn-outline-success mb-3 " type="submit">Login</button>
                    </div>
                </Form>
            </main>
        </div>
    );
}

export default Login;