import React, {useState, useEffect, useContext} from 'react';
import {Card, CardBody, CardTitle, Row, Col, Button, Badge, Alert} from 'reactstrap';
import { useFetchApplications, useUpdateApplication } from "../../rest/useRestApplications";
import ApplicationModal from "../13applications/ApplicationModal";
import {JobsContext} from "../../contexts/jobs.context";
import {Link} from "react-router-dom";
import {getInitialJobsState} from "../../reducers/jobs.reducer";
import {UserContext} from "../../contexts/user.context";
import {AdminUsersContext} from "../../contexts/admin-users.context";

function ReviewApplications(props) {
    const jobs = useContext(JobsContext);
    const [applications, setApplications] = useState([]);
    const [selectedApplication, setSelectedApplication] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [error, setError] = useState(null);
    const [reload, setReload] = useState(true);
    const fetchApplications = useFetchApplications();
    const updateApplication = useUpdateApplication();
    const { jobId } = props.match.params;
    const [filteredJob, setFilteredJob] = useState(getInitialJobsState()[0]);
    const { triggerReloadGlobal } = useContext(AdminUsersContext);

    const toggleModal = () => setIsModalOpen(!isModalOpen);

    useEffect(() => {
        const fetchFilteredApplications = async () => {
            try {
                const allApplications = await fetchApplications();
                const filteredApplications = allApplications.filter(app => app.job._id === jobId);
                setError(null);
                setApplications(filteredApplications);
            } catch (error) {
                console.error('Error fetching applications:', error);
                setError('Failed to fetch applications: ' + error.message);
            }
        };

        if (reload) {
            fetchFilteredApplications();
            setFilteredJob(jobs.find(job => job._id === jobId));
            console.log('Filtered job:', filteredJob);
            setReload(false);
        }
    }, [jobId, reload, fetchApplications]);

    const handleApprove = async (applicationId) => {
        try {
            await updateApplication(applicationId, 'accepted');
            setReload(true);
            // triggerReloadGlobal();
        } catch (error) {
            setError('Error approving application:', error);
        }
    };

    const handleReject = async (applicationId) => {
        try {
            await updateApplication(applicationId, 'rejected');
            setReload(true);
            // triggerReloadGlobal();
        } catch (error) {
            setError('Error rejecting application:', error);
        }
    };

    const handleViewDetails = (application) => {
        setSelectedApplication(application);
        toggleModal();
    };

    const handleClickJobLink = (jobId) => {
        props.history.push(`/view-job/${jobId}`);
    }

    return (
        <Card className="container p-4">
            <CardBody>
                <CardTitle tag="h2" className="mb-4">
                    Review Applications for{' '}
                    <strong
                        className="hover-link text-primary text-decoration-underline"
                        onClick={() => handleClickJobLink(filteredJob._id)}
                    >
                            {filteredJob.title}
                    </strong>
                </CardTitle>
                {error && (
                    <Alert color="danger">
                        {error}
                    </Alert>
                )}
                {applications.length === 0 ? (
                    <div className="alert alert-warning" role="alert">
                        No applications found for this job.
                    </div>
                ) : (
                    <Row>
                        {applications.map((application) => (
                            <Col md={6} key={application._id} className="mb-3">
                                <Card className="shadow-sm border-0 rounded-lg p-3" style={{ backgroundColor: '#f9f9f9' }}>
                                    <CardBody>
                                        <h5 className="mb-3" style={{ fontWeight: 'bold', color: '#333' }}>
                                            Applicant: {application.applicant.name}
                                        </h5>
                                        <p>
                                            <strong>Status:</strong>{' '}
                                            <Badge
                                                color={
                                                    application.status === 'accepted'
                                                        ? 'success'
                                                        : application.status === 'rejected'
                                                            ? 'danger'
                                                            : 'primary'
                                                }
                                                className="text-capitalize"
                                            >
                                                {application.status}
                                            </Badge>
                                        </p>
                                        <div className="d-flex justify-content-between mt-3">
                                            <Button color="info" onClick={() => handleViewDetails(application)}>
                                                View Details
                                            </Button>
                                            <div>
                                                <button className="me-2 btn btn-outline-success btn-outline" onClick={() => handleApprove(application._id)}>
                                                    Approve
                                                </button>
                                                <button className="btn btn-outline-danger btn-outline" onClick={() => handleReject(application._id)}>
                                                    Reject
                                                </button>
                                            </div>
                                        </div>
                                    </CardBody>
                                </Card>
                            </Col>
                        ))}
                    </Row>
                )}
            </CardBody>

            <ApplicationModal
                isOpen={isModalOpen}
                toggle={toggleModal}
                application={selectedApplication}
            />
        </Card>
    );
};

export default ReviewApplications;