import React, {memo, useEffect, useState, useContext} from 'react';
import {Card, Button, Alert} from 'reactstrap';
import {useDeleteJob, useFetchJob} from "../../rest/useRestJobs";
import {getInitialJobsState} from "../../reducers/jobs.reducer";
import {Link, withRouter} from "react-router-dom";
import {API_URL} from "../../rest/api.rest";
import {UserContext} from "../../contexts/user.context";
import {DispatchContext} from "../../contexts/jobs.context";

const ViewJob = memo(function ViewJob(props) {
    const loggedUser = useContext(UserContext);
    const dispatch = useContext(DispatchContext);
    const [job, setJob] = useState(getInitialJobsState()[0]);
    const [error, setError] = useState(null);
    const fetchJob = useFetchJob();
    const deleteJob = useDeleteJob();
    const { jobId } = props.match.params;
    const [reload, setReload] = useState(true);
    const [visible, setVisible] = useState(true);

    const handleEditJob = (jobId) => {
        props.history.push('/admin/edit-job/' + jobId);
    };

    const handleDeleteJob = (jobId) => {
        deleteJob(jobId).then(() => {
            dispatch({type: 'DELETE_JOB', payload: {_id: jobId}});
            setError(null);
            props.history.push('/jobs');
        }).catch(error => {
            setError('Job could not be deleted: ' + error.message);
        });
    }

    const handleApplyJob = (job) => {
        props.history.push(`/apply/${job._id}`);
    };

    useEffect(() => {
        const fetchJobById = async (id) => {
            try {
                const fetchedJob = await fetchJob(id);
                setJob(fetchedJob);
                setReload(false);
                setError(null);
            } catch (err) {
                // If Unauthorized, notify global state to logout
                if (err && err.message === 'Unauthorized') {
                    dispatch({ type: 'LOGOUT' });
                }
                setError(err.message || 'Job could not be retrieved.');
            }
        };

        if (reload) {
            fetchJobById(jobId);
            setReload(false);
        }
    }, [jobId, fetchJob, dispatch, reload]);

    if (!job) {
        return <div className="container my-4">
            <Alert color="warning" isOpen={visible}>
                <h4 className="alert-heading">Sorry...</h4>
                No post found.
            </Alert>
        </div>;
    }

    if (error) {
        return <div className="container my-4">
            <Alert color="danger" isOpen={visible}>
                <h4 className="alert-heading">An error occurred</h4>
                {error}
            </Alert>
        </div>;
    }

    return (
        <Card className="container p-4">
            <div className="mb-1">
                <h2 className="text-primary">
                    {job.title} - {job.location}
                </h2>
                <h4 className="text-muted">
                    {job.company}
                </h4>
                <p className="text-muted">
                    posted {new Date(job.updatedAt).toLocaleDateString()} · {job.applicants.length} people clicked apply
                </p>
            </div>
            <div className="d-flex align-items-center mb-3">
                {loggedUser.isAdmin ? (
                    <div>
                        <Button
                            color="outline-success"
                            className="btn-outline me-2"
                            onClick={() => handleEditJob(job._id)}
                        >
                            Edit
                        </Button>
                        <Button
                            color="outline-danger"
                            className="btn-outline"
                            onClick={() => handleDeleteJob(job._id)}
                        >
                            Delete
                        </Button>
                    </div>
                ) : (
                    <div>
                        <Button
                            color="outline-secondary"
                            className="btn-outline"
                            onClick={() => handleApplyJob(job)}
                        >
                            Apply
                        </Button>
                    </div>
                )}
            </div>
            <div className="mb-4">
                <h4>About the job</h4>
                <p>{job.description}</p>
                <h5>Requirements:</h5>
                <ul>
                    {job.requirements.map((req, index) => (
                        <li key={index}>{req}</li>
                    ))}
                </ul>
            </div>
            <hr />
            <div className="mb-4">
                <h4>About the creator</h4>
                <div key={job.creator._id} className="d-flex align-items-center mb-4">
                    <img
                        src={`${API_URL}/${job.creator.image}` || "https://static-00.iconduck.com/assets.00/profile-user-icon-2048x2048-m41rxkoe.png"}
                        alt={`${job.creator.name}'s profile`}
                        className="rounded-circle me-3"
                        style={{ width: "50px", height: "50px", objectFit: "cover" }}
                    />
                    <Link to={`/profile/${job.creator._id}`} className="text-decoration-none">
                        <h1 className="h5 mb-0 text-black">{job.creator.name}</h1>
                        <p className="mb-0 text-muted">@{job.creator.email}</p>
                    </Link>
                </div>
            </div>
        </Card>
    );
});

export default withRouter(ViewJob);

