import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AdminUsersContext } from "../../contexts/admin-users.context";
import { getInitialAdminUserState } from "../../reducers/admin-user.reducer";
import { useFetchAdminUserById } from "../../rest/useRestAdminUsers";
import { UserContext } from "../../contexts/user.context";
import {TitleContext} from "../../contexts/title.context";
import {Card, CardText, CardTitle, Col, List, Row} from "reactstrap";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope, faBirthdayCake } from '@fortawesome/free-solid-svg-icons';

function Profile(props) {
    const adminUsers = useContext(AdminUsersContext);
    const [adminUser, setAdminUser] = useState(getInitialAdminUserState()[0]);
    const [error, setError] = useState(null);
    const [view, setView] = useState('bugsAssigned');
    const fetchAdminUserById = useFetchAdminUserById();
    const { userId } = props.match.params;
    const loggedUser = useContext(UserContext);
    const isCreator = adminUser._id === loggedUser.userId;
    const { setTitle } = useContext(TitleContext);

    useEffect(() => {
        fetchAdminUserById(userId).then(adminUser => {
            setAdminUser(adminUser);
            console.log('user: ' + adminUser);
        }).catch(error => {
            setError(`User could not be fetched: ${error.message}`);
        });

        setTitle('User Profile');
    }, [userId, setTitle]);

    const memberSince = new Date(adminUser.createdAt).toLocaleDateString();

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
                            <li><p
                                className="text-muted mb-0 d-flex d-inline-flex">Reported Bugs:</p> {adminUser.reportedBugs.length}
                            </li>
                            <li><p
                                className="text-muted mb-0 d-flex d-inline-flex">Bugs Assigned:</p> {adminUser.bugsAssigned.length}
                            </li>
                        </List>
                    </Card>
                </Col>
                <Col sm="6">
                    <Card body className="h-100">
                        <CardTitle tag="h3">
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
                        </CardTitle>
                        <CardText>
                            <List type="unstyled">
                                {view === 'reportedBugs' && adminUser.reportedBugs.map(reportedBug => (
                                    <div>
                                        <li key={reportedBug._id}>
                                            <h3><Link to={`/view-bug/${reportedBug._id}`}>{reportedBug.summary}</Link>
                                            </h3>
                                            <p>Description: {reportedBug.description}</p>
                                            <p>Reported on: {new Date(reportedBug.createdAt).toLocaleDateString()}</p>
                                        </li>
                                    </div>
                                ))}
                                {view === 'bugsAssigned' && adminUser.bugsAssigned.map(bugAssigned => (
                                    <div>
                                        <li key={bugAssigned._id}>
                                            <h3><Link to={`/view-bug/${bugAssigned._id}`}>{bugAssigned.summary}</Link>
                                            </h3>
                                            <p>Description: {bugAssigned.description}</p>
                                            <p>Reported on: {new Date(bugAssigned.createdAt).toLocaleDateString()}</p>
                                        </li>
                                    </div>
                                ))}
                            </List>
                        </CardText>
                    </Card>
                </Col>
            </Row>
        </div>
    );
}

export default Profile;