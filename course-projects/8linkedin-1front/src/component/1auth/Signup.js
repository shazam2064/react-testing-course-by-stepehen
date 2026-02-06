import React, {useState} from 'react';
import {handleChange} from '../0commons/form.common';
import axios from "axios";
import {API_URL} from "../../rest/api.rest";
import {Alert, Card, Form, FormGroup} from "reactstrap";

function Signup(props) {
    const [user, setUser] = useState({name: '', email: '', password: ''});
    const [error, setError] = useState('');
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    const signupUser = async () => {
        try {
            const response = await axios.put(`${API_URL}/auth/signup`, user);
            console.log('Signup response:', response);
            props.history.push('/login');
        } catch (err) {
            const errorMessage = err.response?.data?.message || 'Signup failed. Please try again.';
            setError(errorMessage);
        }
    }

    const handleSubmit = (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        signupUser();
    }

    return (
        <Card className="container p-5 my-4 mx-auto col-4 border rounded">
            <h1 className="mb-3 text-center display-3">Signup</h1>
            <main>
                {error && (
                    <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">An error occurred</h4>
                        {error}
                    </Alert>
                )}

                <Form action="/signup" method="POST"
                      onSubmit={handleSubmit}
                >
                    <FormGroup>
                        <label htmlFor="name">Name</label>
                        <input type="text" name="name" id="name" className="form-control"
                               onChange={(e) => {
                                   handleChange(e, setUser)
                               }}
                               value={user.name}
                        />
                    </FormGroup>

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

                    <FormGroup>
                        <label htmlFor="confirmPassword">Confirm Password</label>
                        <input type="password" name="confirmPassword" id="confirmPassword" className="form-control"/>
                    </FormGroup>

                    <input type="hidden" name="_csrf" value="<%= csrfToken %>"/>
                    <div className="d-flex align-items-center justify-content-center mb-2">
                        <button className="btn btn-outline-secondary btn-outline" type="submit">Signup</button>
                    </div>
                    <div className="text-center pb-3 text-muted fs-6 fst-italic">
                        <p>Make sure to check your email and verify it, before logging in.</p>
                    </div>
                </Form>
            </main>
        </Card>
    );
}

export default Signup;