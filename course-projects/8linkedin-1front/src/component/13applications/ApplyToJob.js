import React, { useContext, useState } from 'react';
import { JobsContext } from '../../contexts/jobs.context';
import { useCreateApplication } from '../../rest/useRestApplications';
import { Alert, Button, Card, Form, FormGroup, Input, Label } from 'reactstrap';
import { getInitialApplicationsState } from '../../reducers/applications.reducer';

function ApplyToJob({ match, history }) {
    const { jobId } = match.params;
    const jobs = useContext(JobsContext);
    const createApplication = useCreateApplication();
    const [application, setApplication] = useState({
        ...getInitialApplicationsState()[0],
        jobId,
    });
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);
    const [visible, setVisible] = useState(true);

    const job = jobs.find((job) => job._id === jobId);

    const onDismiss = () => setVisible(false);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setApplication((prevApp) => ({
            ...prevApp,
            [name]: value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await createApplication(application);
            setError(null);
            setSuccess('Application submitted successfully!');
            setApplication({
                ...getInitialApplicationsState()[0],
                jobId,
            })
        } catch (err) {
            setError(err.message || 'An error occurred while submitting the application.');
            setSuccess(null);
        }
    };

    if (!job) {
        return (
            <Alert color="danger" className="mt-4">
                <h4 className="alert-heading">Job Not Found</h4>
                <p>The job you are trying to apply for does not exist.</p>
            </Alert>
        );
    }

    return (
        <section className="container ">
            <Card className="p-3 mx-auto mb-3 shadow-sm" style={{ borderRadius: '10px', background: '#f9f9f9' }}>
                <div className="card-header bg-primary text-white text-start" style={{ borderRadius: '10px 10px 0 0' }}>
                    <h4 className="mb-0 mx-2">{job.title}</h4>
                </div>
                <div className="p-3">
                    <div className="mb-2">
                        <p className="mb-1"><strong>Company:</strong> {job.company}</p>
                        <p className="mb-1"><strong>Location:</strong> {job.location}</p>
                    </div>
                    <div className="mb-2">
                        <p className="mb-1"><strong>Description:</strong></p>
                        <p className="text-muted small">{job.description}</p>
                    </div>
                    <div>
                        <p className="mb-1"><strong>Requirements:</strong></p>
                        <div className="d-flex flex-wrap">
                            {job.requirements.map((req, index) => (
                                <span key={index} className="badge border border-info text-dark mx-1 my-1">
                                    {req}
                                </span>
                            ))}
                        </div>
                    </div>
                </div>
            </Card>
            <Form onSubmit={handleSubmit}>
                <Card className="p-3 mx-auto mb-3 shadow-sm" style={{ borderRadius: '10px' }}>
                    {error && (
                        <Alert color="danger" isOpen={visible} toggle={onDismiss} className="mb-3">
                            <h6 className="alert-heading">Error</h6>
                            <p className="mb-0 small">{error}</p>
                        </Alert>
                    )}
                    {success && (
                        <Alert color="success" isOpen={visible} toggle={onDismiss} className="mb-3">
                            <h6 className="alert-heading">Success</h6>
                            <p className="mb-0 small">{success}</p>
                        </Alert>
                    )}
                    <FormGroup>
                        <Label htmlFor="resume" className="small"><strong>Resume</strong></Label>
                        <Input
                            type="textarea"
                            id="resume"
                            name="resume"
                            value={application.resume}
                            onChange={handleChange}
                            rows="3"
                            placeholder="Paste your resume here"
                            required
                            className="small"
                        />
                    </FormGroup>
                    <FormGroup>
                        <Label htmlFor="coverLetter" className="small"><strong>Cover Letter</strong></Label>
                        <Input
                            type="textarea"
                            id="coverLetter"
                            name="coverLetter"
                            value={application.coverLetter}
                            onChange={handleChange}
                            rows="4"
                            placeholder="Write your cover letter here"
                            required
                            className="small"
                        />
                    </FormGroup>
                    <div className="text-center">
                        <Button type="submit" color="primary" className="btn-sm">
                            Submit Application
                        </Button>
                    </div>
                </Card>
            </Form>
        </section>
    );
}

export default ApplyToJob;