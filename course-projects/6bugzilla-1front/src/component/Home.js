import React, {useState, useEffect, useContext} from 'react';
import {DispatchContext, UserContext} from "../contexts/user.context";
import {TitleContext} from "../contexts/title.context";
import {useFetchAdminUserById} from "../rest/useRestAdminUsers";
import {getInitialAdminUserState} from "../reducers/admin-user.reducer";
import {Card, CardBody, CardText, Col, Row, Input} from "reactstrap";
import {FontAwesomeIcon} from '@fortawesome/react-fontawesome';
import {faFileAlt, faSearch, faUser} from '@fortawesome/free-solid-svg-icons';

function Home(props) {
    const loggedUser = useContext(UserContext);
    const loggedDispatch = useContext(DispatchContext);
    const {setTitle} = useContext(TitleContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [user, setUser] = useState(getInitialAdminUserState()[0]);
    const userId = loggedUser.userId;
    const fetchUserById = useFetchAdminUserById();
    const [error, setError] = useState(null);

    useEffect(() => {
        fetchUserById(userId).then(user => {
            setUser(user);
        }).catch(error => {
            setError(`User could not be fetched: ${error.message}`);
        });

        setTitle('Home');
    }, [setTitle]);

    const handleRedirect = (path) => {
        props.history.push(path);
    };

    const handleSearch = () => {
        if (searchTerm && searchTerm.trim() !== '') {
            props.history.push(`/search-bug/${searchTerm}`);
        }
    };

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h2 className="display-5 text-center">Welcome to Bugzilla</h2>
            <Row className="my-4">
                <Col sm="4">
                    <Card className="text-center bg-blue text-light">
                        <CardBody onClick={() => handleRedirect('/new-bug')} style={{cursor: 'pointer'}}>
                            <FontAwesomeIcon icon={faFileAlt} size="4x" className="mb-2"/>
                            <CardText>File a Bug</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="4">
                    <Card className="text-center bg-blue text-light">
                        <CardBody onClick={() => handleRedirect('/browse')} style={{cursor: 'pointer'}}>
                            <FontAwesomeIcon icon={faSearch} size="4x" className="mb-2"/>
                            <CardText>Search a Bug</CardText>
                        </CardBody>
                    </Card>
                </Col>
                <Col sm="4">
                    <Card className="text-center bg-blue text-light">
                        <CardBody onClick={() => handleRedirect(`/profile/${loggedUser.userId}`)}
                                  style={{cursor: 'pointer'}}>
                            <FontAwesomeIcon icon={faUser} size="4x" className="mb-2"/>
                            <CardText>Profile Info</CardText>
                        </CardBody>
                    </Card>
                </Col>
            </Row>
            <Row className="mb-4">
                <Col className="d-flex flex-row input-group search-group mx-2">
                    <Input
                        type="text"
                        className=" form-control search-bar"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                    <div className="input-group-prepend">
                            <span onClick={handleSearch} className="btn btn-secondary search-button">
                                <i className="fas fa-search"> Search Bugs</i>
                            </span>
                    </div>
                </Col>
            </Row>
            <Col>
                <Row>
                    {loggedUser && (
                        <div className="common-queries">
                            <h3>Common Queries</h3>
                            <ul>
                                <li onClick={() => handleRedirect('/search-bug/' + user.name)}>Bugs assigned to
                                    user: <span className="link-like">{user.bugsAssigned.length}</span></li>
                                <li onClick={() => handleRedirect('/search-bug/' + user.email)}>Bugs reported by
                                    user: <span className="link-like">{user.reportedBugs.length}</span></li>
                            </ul>
                        </div>
                    )}
                </Row>
            </Col>
        </div>
    );
}

export default Home;