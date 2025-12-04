import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminUsersContext } from "../../contexts/admin-users.context";
import { getInitialAdminUserState } from "../../reducers/admin-user.reducer";
import { useFetchAdminUserById } from "../../rest/useRestAdminUsers";
import { UserContext } from "../../contexts/user.context";
import {TitleContext} from "../../contexts/title.context";
import {Card, CardTitle, Col, List, Row} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';

function Profile(props) {
    const adminUsers = useContext(AdminUsersContext);
    const initialState = getInitialAdminUserState();
    const safeInitial = (initialState && initialState[0]) ? initialState[0] : {
        _id: '',
        name: '',
        email: '',
        createdAt: new Date().toISOString(),
        status: '',
        reportedBugs: [],
        bugsAssigned: [],
        questions: [],
        answers: []
    };
    const [adminUser, setAdminUser] = useState(safeInitial);
    const [error, setError] = useState(null);
    const [view, setView] = useState('bugsAssigned');
    const fetchAdminUserById = useFetchAdminUserById();
    const { userId } = props.match.params;
    const loggedUser = useContext(UserContext);
    const isCreator = adminUser._id === loggedUser.userId;

    // Guard TitleContext so tests without provider won't crash
    const titleCtx = useContext(TitleContext) || {};
    const setTitle = typeof titleCtx.setTitle === 'function' ? titleCtx.setTitle : () => {};

    useEffect(() => {
        fetchAdminUserById(userId).then(adminUser => {
            setAdminUser(adminUser);
            console.log('user: ' + adminUser);
        }).catch(error => {
            setError(`User could not be fetched: ${error.message}`);
        });

        setTitle('User Profile');
    }, [userId, setTitle]);

    const memberSince = new Date(adminUser.createdAt || Date.now()).toLocaleDateString();

    // Feature-detect whether this adminUser is in QA shape (questions/answers) or bug shape
    const hasQA = Array.isArray(adminUser.questions) || Array.isArray(adminUser.answers);
    const reportedBugs = Array.isArray(adminUser.reportedBugs) ? adminUser.reportedBugs : [];
    const bugsAssigned = Array.isArray(adminUser.bugsAssigned) ? adminUser.bugsAssigned : [];
    const questions = Array.isArray(adminUser.questions) ? adminUser.questions : [];
    const answers = Array.isArray(adminUser.answers) ? adminUser.answers : [];

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded">
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
                    <Card body>
                        <CardTitle tag="h3">Stats</CardTitle>
                        <List type="unstyled">
                            <li>
                                <p className="text-muted mb-0 d-flex d-inline-flex">Reported Bugs:</p>
                                {reportedBugs.length}
                            </li>
                            <li>
                                <p className="text-muted mb-0 d-flex d-inline-flex">Bugs Assigned:</p>
                                {bugsAssigned.length}
                            </li>
                        </List>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card body className="h-100">
                        <CardTitle tag="h3">
                            {hasQA ? (
                                <div className="mb-4">
                                    <button
                                        className={`btn btn-outline-secondary mx-4 ${view === 'questions' ? 'active' : ''}`}
                                        onClick={() => setView('questions')}>Questions
                                    </button>
                                    <button
                                        className={`btn btn-outline-secondary ${view === 'answers' ? 'active' : ''}`}
                                        onClick={() => setView('answers')}>Answers
                                    </button>
                                </div>
                            ) : (
                                <div className="mb-4">
                                    <button
                                        className={`btn btn-outline-secondary mx-4 ${view === 'reportedBugs' ? 'active' : ''}`}
                                        onClick={() => setView('reportedBugs')}>Reported Bugs
                                    </button>
                                    <button
                                        className={`btn btn-outline-secondary ${view === 'bugsAssigned' ? 'active' : ''}`}
                                        onClick={() => setView('bugsAssigned')}>Bugs Assigned
                                    </button>
                                </div>
                            )}
                        </CardTitle>
                        {/* avoid using CardText (renders <p>) so we don't place a <ul> inside a <p> */}
                        <div className="card-text">
                            <List type="unstyled">
                                {hasQA ? (
                                    <>
                                        {view === 'questions' && questions.map(q => (
                                            <li key={q._id}>
                                                <h3><Link to={`/view-question/${q._id}`}>{q.title}</Link></h3>
                                                <p>{q.content}</p>
                                                <p>Posted: {new Date(q.createdAt).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                        {view === 'answers' && answers.map(a => (
                                            <li key={a._id}>
                                                <h3><Link to={`/view-question/${a.questionId}`}>{a.content}</Link></h3>
                                                <p>Posted: {new Date(a.createdAt).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </>
                                ) : (
                                    <>
                                        {view === 'reportedBugs' && reportedBugs.map(reportedBug => (
                                            <li key={reportedBug._id}>
                                                <h3><Link to={`/view-bug/${reportedBug._id}`}>{reportedBug.summary}</Link></h3>
                                                <p>Description: {reportedBug.description}</p>
                                                <p>Reported on: {new Date(reportedBug.createdAt).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                        {view === 'bugsAssigned' && bugsAssigned.map(bugAssigned => (
                                            <li key={bugAssigned._id}>
                                                <h3><Link to={`/view-bug/${bugAssigned._id}`}>{bugAssigned.summary}</Link></h3>
                                                <p>Description: {bugAssigned.description}</p>
                                                <p>Reported on: {new Date(bugAssigned.createdAt).toLocaleDateString()}</p>
                                            </li>
                                        ))}
                                    </>
                                )}
                            </List>
                        </div>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Profile;

