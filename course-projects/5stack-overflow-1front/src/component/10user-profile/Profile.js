import React, {useContext, useEffect, useState} from 'react';
import {Link} from 'react-router-dom';
import {AdminUsersContext} from "../../contexts/admin-users.context";
import {getInitialAdminUserState} from "../../reducers/admin-user.reducer";
import {useFetchAdminUserById} from "../../rest/useRestAdminUsers";
import {UserContext} from "../../contexts/user.context";
import {Card, CardText, CardTitle, Col, List, Row} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faBirthdayCake, faEnvelope} from '@fortawesome/free-solid-svg-icons';

function Profile(props) {
    const adminUsers = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState(getInitialAdminUserState()[0]);
    const [error, setError] = useState(null);
    const [view, setView] = useState('questions');
    const fetchAdminUserById = useFetchAdminUserById();
    const {userId} = props.match.params;
    const loggedUser = useContext(UserContext);
    const isCreator = adminUser._id === loggedUser.userId;

    useEffect(() => {
        fetchAdminUserById(userId).then(adminUser => {
            setAdminUser(adminUser);
            console.log('user: ' + adminUser);
        }).catch(error => {
            setError(`User could not be fetched: ${error.message}`);
        });
    }, [userId]);

    const calculateVotes = () => {
        const questionVotes = adminUser.questions.reduce((acc, question) => acc + question.votes, 0);
        const answerVotes = adminUser.answers.reduce((acc, answer) => acc + answer.votes, 0);
        return questionVotes + answerVotes;
    };

    const memberSince = new Date(adminUser.createdAt).toLocaleDateString();

    return (
        <div className="container container-fluid">
            <Row className="mb-0">
                <Col>
                    <h1 className="display-3">{adminUser.name}</h1>
                    <footer>
                        <Row>
                            <Col>
                                <ul className="list-inline">
                                    <li className="list-inline-item text-muted">
                                        <FontAwesomeIcon icon={faEnvelope}/> Email: {adminUser.email}
                                    </li>
                                    <li className="list-inline-item text-muted">
                                        <FontAwesomeIcon icon={faBirthdayCake}/> Member since: {memberSince}
                                    </li>
                                </ul>
                            </Col>
                        </Row>
                    </footer>
                </Col>
            </Row>
            <Row className="d-flex align-items-stretch mb-4">
                <Col sm="3">
                    <Card body className="h-100">
                        <CardTitle tag="h3">Stats</CardTitle>
                        <List type="unstyled">
                            <li><p className="text-muted mb-0 d-flex d-inline-flex">Votes:</p> {calculateVotes()}</li>
                            <li><p
                                className="text-muted mb-0 d-flex d-inline-flex">Questions:</p> {adminUser.questions.length}
                            </li>
                            <li><p
                                className="text-muted mb-0 d-flex d-inline-flex">Answers:</p> {adminUser.answers.length}
                            </li>
                        </List>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card body className="h-100">
                        <CardTitle tag="h3">About</CardTitle>
                        <CardText>{adminUser.status}</CardText>
                    </Card>
                </Col>
            </Row>
            <div className="mb-4">
                <button className="btn secondary-button mx-4" onClick={() => setView('questions')}>Questions</button>
                <button className="btn secondary-button" onClick={() => setView('answers')}>Answers</button>
            </div>
            <List type="unstyled">
                {view === 'questions' && adminUser.questions.map(question => (
                    <li key={question._id}>
                        <h3><Link to={`/view-question/${question._id}`}>{question.title}</Link></h3>
                        <p>Votes: {question.votes}</p>
                        <p>Asked on: {new Date(question.createdAt).toLocaleDateString()}</p>
                    </li>
                ))}
                {view === 'answers' && adminUser.answers.map(answer => (
                    <li key={answer._id}>
                        <h3><Link to={`/view-question/${answer.questionId}`}>{answer.content}</Link></h3>
                        <p>Votes: {answer.votes}</p>
                        <p>Answered on: {new Date(answer.createdAt).toLocaleDateString()}</p>
                    </li>
                ))}
            </List>
        </div>
    );
}

export default Profile;