import React, {useContext, useEffect, useState} from 'react';
import {JobsContext, DispatchContext} from "../../contexts/jobs.context";
import {useDeleteJob, useFetchJobs} from "../../rest/useRestJobs";
import {UserContext} from "../../contexts/user.context";
import {Alert, Button, Card, Col, FormGroup, Input, Label, Row} from "reactstrap";
import JobItem from "./JobItem";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faSearch} from "@fortawesome/free-solid-svg-icons";

function ListJobs(props) {
    const jobs = useContext(JobsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const [jobsList, setJobsList] = useState([]);
    const fetchJobs = useFetchJobs();
    const deleteJob = useDeleteJob();
    const [refreshJobs, setRefreshJobs] = useState(true);
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        const getJobs = async () => {
            try {
                const fetchedJobs = await fetchJobs();
                dispatch({type: 'SET_JOBS', jobs: fetchedJobs});
                setJobsList(fetchedJobs);
                setRefreshJobs(false);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_JOBS', jobs: []});
                setError('Jobs could not be retrieved.');
            }
        }

        if (refreshJobs) {
            getJobs();
            setRefreshJobs(false);
        }
    }, [dispatch, refreshJobs]);

    const handleEditJob = (jobId) => {
        props.history.push('/admin/edit-job/' + jobId);
    }

    const handleDeleteJob = (jobId) => {
        deleteJob(jobId).then(() => {
            dispatch({type: 'DELETE_JOB', payload: {_id: jobId}});
            setError(null);
            setRefreshJobs(true);
        }).catch(error => {
            setError('Job could not be deleted: ' + error.message);
        });
    }

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    }

    const filteredJobs = jobsList
        .filter(job => {
                return (
                        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        job.company.toLowerCase().includes(searchTerm.toLowerCase())) ||
                    job.location.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    job.description.toLowerCase().includes(searchTerm.toLowerCase())
            }
        );

    const showAdminButtons = (job) => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <div>
                    <button className="btn btn-success text-light me-2"
                            onClick={() => handleEditJob(job._id)}>Edit
                    </button>
                    <button className="btn btn-danger text-light me-4"
                            onClick={() => handleDeleteJob(job._id)}>Delete
                    </button>
                </div>
            );
        } else {
            return null;
        }
    }

    const handleApplyJob = (job) => {
        props.history.push(`/apply/${job._id}`);
    };

    const handleViewJob = (job) => {
        props.history.push(`/view-job/${job._id}`);
    };

    const handleReviewApplications = (job) => {
        props.history.push({
            pathname: `/admin/review-applications/${job._id}`,
            state: { applications: job.applicants },
        });
    };

    const showActionButtons = (job) => {
        return (
            <div className="d-flex gap-2">
                <button
                    className="btn btn-secondary text-light rounded-pill"
                    onClick={() => handleViewJob(job)}
                >
                    View Details
                </button>
                {loggedUser.isLogged && (
                    job.creator._id === loggedUser.userId ? (
                        <button
                            className="btn btn-secondary text-light rounded-pill"
                            onClick={() => handleReviewApplications(job)}
                        >
                            Review Applications
                        </button>
                    ) : (
                        <button
                            className="btn btn-secondary text-light rounded-pill"
                            onClick={() => handleApplyJob(job)}
                        >
                            Apply Now
                        </button>
                    )
                )}
            </div>
        );
    };

    const AddJobButton = () => {
        if (loggedUser.isAdmin && loggedUser.isLogged) {
            return (
                <Col>
                    <div className="text-right d-flex justify-content-end">
                        <Button
                            color="outline-secondary"
                            className="rounded-pill w-50 btn-outline"
                            onClick={() => props.history.push('/admin/add-job')}>
                            Add Job
                        </Button>
                    </div>
                </Col>


            );
        }
    }

    return (
        <Card className="container p-4">
            <h1 className="mb-3 text-start fs-2 mx-2">Find your next role...</h1>
            <Row>
                <Col md={10} className="mb-4 d-flex flex-row input-group search-group">
                    <FormGroup className="search-group">
                        <Label for="searchJobs" hidden>Search</Label>
                        <div className="d-flex flex-row input-group search-group mx-2">
                            <Input
                                type="text"
                                id="searchJobs"
                                placeholder="Search jobs..."
                                value={searchTerm}
                                className="form-control search-bar"
                                onChange={handleSearchChange}
                            />
                            <span className="btn-block btn bg-light border-secondary-subtle">
                                <FontAwesomeIcon icon={faSearch} className="text-info"/>
                            </span>
                        </div>
                    </FormGroup>
                </Col>
                {AddJobButton()}
            </Row>
            {error ? (
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            ) : (
                jobsList.length === 0 ? (
                    <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">Sorry...</h4>
                        No users found.
                    </Alert>
                ) : (
                    <Row>
                        <Col>
                            <div className="list-group">
                                {filteredJobs.map(job => (
                                    <JobItem
                                        key={job._id}
                                        job={job}
                                        adminButtons={showAdminButtons(job)}
                                        actionButtons={showActionButtons(job)}
                                    />
                                ))}
                            </div>
                        </Col>
                    </Row>
                )
            )}
        </Card>
    );
}

export default ListJobs;