import React, {useState, useEffect, useContext} from 'react';
import {useFetchBugs} from '../../rest/useRestBugs';
import {BugsContext, DispatchContext} from '../../contexts/bugs.context';
import {TitleContext} from "../../contexts/title.context";
import BugItem from "./BugItem";
import {getInitialBugState} from "../../reducers/bug.reducer";
import {Alert, Col, FormGroup, Input, Row, Table} from "reactstrap";

function SearchBug(props) {
    const bugsContext = useContext(BugsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchBugs = useFetchBugs();
    const {query} = props.match.params;
    const isFiltered = !!query;
    const {setTitle} = useContext(TitleContext);
    const [bugs, setBugs] = useState(getInitialBugState());
    const [searchTerm, setSearchTerm] = useState(query || '');
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (query) {
            fetchBugs().then(fetchedBugs => {
                dispatch({type: 'SET_BUGS', bugs: fetchedBugs});
                const filteredBugs = fetchedBugs.filter(bug => {
                    const queryLower = query.toLowerCase();
                    return (
                        bug.summary.toLowerCase().includes(queryLower) ||
                        bug.product.name.toLowerCase().includes(queryLower) ||
                        bug.component.name.toLowerCase().includes(queryLower) ||
                        bug.assignee.name.toLowerCase().includes(queryLower) ||
                        bug.reporter.email.toLowerCase().includes(queryLower) ||
                        bug.status.toLowerCase().includes(queryLower) ||
                        bug.severity.toLowerCase().includes(queryLower) ||
                        bug.priority.toLowerCase().includes(queryLower) ||
                        bug.hardware.toLowerCase().includes(queryLower) ||
                        bug.os.toLowerCase().includes(queryLower) ||
                        bug.description.toLowerCase().includes(queryLower)
                    );
                });
                setBugs(filteredBugs);
                setError(null);

            }).catch(error => {
                dispatch({type: 'SET_BUGS', bugs: []});
                setError(error.message);
                setVisible(true);
            });
        } else {
            dispatch({type: 'SET_BUGS', bugs: []});
        }

        setTitle('Search Bugs');
    }, [query, fetchBugs, dispatch, setTitle]);

    const handleSearch = () => {
        if (isFiltered && bugs.length === 0)
        {
            setVisible(true);
        }
        if (error) {
            setVisible(true);
        }
        if (searchTerm && searchTerm.trim() !== '') {
            props.history.push(`/search-bug/${searchTerm}`);
        }
    };

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h1 className="display-5">Search Bugs</h1>
            <Row className="mb-3">
                <Col className="d-flex flex-row input-group search-group mx-2">
                    <Input
                        type="text"
                        className="form-control search-bar"
                        id="search"
                        placeholder="Search bugs..."
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
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                isFiltered && bugs.length > 0 && (
                    <Table>
                        <thead>
                        <tr>
                            <th>Product</th>
                            <th>Comp</th>
                            <th>Assignee</th>
                            <th>Status</th>
                            <th>Resolution</th>
                            <th>Summary</th>
                            <th>Changed</th>
                        </tr>
                        </thead>
                        <tbody>
                        {bugs.map(bug => (
                            <BugItem key={bug._id} bug={bug} props={props}/>
                        ))}
                        </tbody>
                    </Table>
                )
            )}
            {
                isFiltered && bugs.length === 0 && <Alert color="info" isOpen={visible} toggle={onDismiss}>
                    No bugs found.
                </Alert>
            }
        </div>
    );
}

export default SearchBug;