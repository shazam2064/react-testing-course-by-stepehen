import React, { useContext, useEffect, useState } from 'react';
import { JobsContext } from "../../contexts/jobs.context";
import { getInitialJobsState } from "../../reducers/jobs.reducer";
import { useCreateJob, useFetchJob, useUpdateJob } from "../../rest/useRestJobs";
import { UserContext } from "../../contexts/user.context";
import { Alert, Button, Card, Form, FormGroup, Input, Label } from "reactstrap";

function AddEditJob(props) {
    const jobs = useContext(JobsContext);
    const [job, setJob] = useState(getInitialJobsState()[0]);
    const [error, setError] = useState(null);
    const fetchJob = useFetchJob();
    const createJob = useCreateJob();
    const updateJob = useUpdateJob();
    const { jobId } = props.match.params;
    const isEditMode = !!jobId;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            fetchJob(jobId).then((fetchedJob) => {
                setJob(fetchedJob);
            }).catch((error) => {
                setError('Job could not be retrieved.');
            });
        } else {
            setJob(getInitialJobsState()[0]);
        }
    }, [jobId, isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setJob((prevJob) => ({
            ...prevJob,
            [name]: value,
        }));
    };

    const addRequirement = (e) => {
        e.preventDefault();
        if (job.newReq?.trim()) {
            setJob((prevJob) => ({
                ...prevJob,
                requirements: [...(prevJob.requirements || []), prevJob.newReq.trim()],
                newReq: '',
            }));
        }
    };

    const removeRequirement = (index) => {
        setJob((prevJob) => ({
            ...prevJob,
            requirements: (prevJob.requirements || []).filter((_, i) => i !== index),
        }));
    };

    const validateJob = () => {
        const { title, description, location, company, requirements } = job;
        if (!title || !description || !location || !company || requirements.length === 0) {
            setError('All fields are required.');
            return false;
        }
        return true;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        if (!validateJob()) {
            setVisible(true);
            return;
        }
        try {
            let savedJob;
            if (isEditMode) {
                await updateJob(job);
                savedJob = job;
            } else {
                savedJob = await createJob(job);
            }
            setError(null);
            props.history.push(`/view-job/${savedJob._id}`);
        } catch (err) {
            setError(err.message || 'An error occurred while saving the job.');
        }
    };

    if (!isAdmin) {
        return (
            <div className="container p-s5 my-4 col-8 mx-auto">
                <Alert color="warning">
                    <h4 className="alert-heading">Unauthorized!</h4>
                    <p>Hey, you are not authorized to view this page.</p>
                    <hr />
                    <p className="mb-0">
                        Go{' '}
                        <a
                            className="alert-link"
                            onClick={() => props.history.push('/')}
                        >
                            back
                        </a>
                        .
                    </p>
                </Alert>
            </div>
        );
    }

    return (
        <section className="container p-4">
            <Form onSubmit={handleSubmit}>
                <Card className="p-4 mx-auto mb-3">
                    {error && (
                        <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                            <h4 className="alert-heading">An error occurred</h4>
                            {error}
                        </Alert>
                    )}
                    <FormGroup>
                        <h1 className="mb-4 display-5 bg-white text-secondary text-decoration-underline">
                            {isEditMode ? 'Edit Job' : 'Add Job'}
                        </h1>
                        <Label htmlFor="title">Job Title</Label>
                        <Input
                            type="text"
                            id="title"
                            name="title"
                            value={job.title}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="description">Description</Label>
                        <Input
                            type="textarea"
                            id="description"
                            name="description"
                            value={job.description}
                            onChange={handleChange}
                            rows="3"
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="location">Location</Label>
                        <Input
                            type="text"
                            id="location"
                            name="location"
                            value={job.location}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="company">Company</Label>
                        <Input
                            type="text"
                            id="company"
                            name="company"
                            value={job.company}
                            onChange={handleChange}
                            required
                        />
                    </FormGroup>
                </Card>
                <Card className="p-4 mx-auto mb-3">
                    <FormGroup>
                        <Label>Requirements</Label>
                        <div className="d-flex flex-wrap">
                            {(job.requirements || []).map((req, index) => (
                                <span
                                    key={index}
                                    className="d-flex align-items-center border border-info rounded mx-1 py-0 px-1 mb-2"
                                >
                                    {req}
                                    <button
                                        type="button"
                                        className="btn btn-sm btn-outline-danger border-0 mx-1"
                                        onClick={() => removeRequirement(index)}
                                    >
                                        x
                                    </button>
                                </span>
                            ))}
                        </div>
                        <Input
                            type="text"
                            placeholder="Add a requirement"
                            value={job.newReq || ''}
                            onChange={(e) =>
                                setJob((prevJob) => ({
                                    ...prevJob,
                                    newReq: e.target.value,
                                }))
                            }
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    e.preventDefault();
                                    addRequirement(e);
                                }
                            }}
                        />
                    </FormGroup>
                </Card>
                <div className="d-flex align-items-center justify-content-center">
                    <Button type="submit" className="btn btn-secondary text-light mb-3">
                        {isEditMode ? 'Update Job' : 'Add Job'}
                    </Button>
                </div>
            </Form>
        </section>
    );
}

export default AddEditJob;