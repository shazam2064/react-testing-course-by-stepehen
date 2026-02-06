import React from 'react';
import { Modal, ModalHeader, ModalBody, ModalFooter, Button, Row, Col, Badge } from 'reactstrap';
import {API_URL} from "../../rest/api.rest";

const ApplicationModal = ({ isOpen, toggle, application }) => {
    if (!application) return null;

    return (
        <Modal isOpen={isOpen} toggle={toggle} size="lg">
            <ModalHeader toggle={toggle}>Application Details</ModalHeader>
            <ModalBody>
                {/* Applicant Section */}
                <div className="d-flex align-items-center mb-4">
                    <img
                        src={`${API_URL}/${application.applicant.image}` || 'https://via.placeholder.com/100'}
                        alt="Profile"
                        className="rounded-circle me-3"
                        style={{ width: '100px', height: '100px', objectFit: 'cover' }}
                    />
                    <div>
                        <h4 className="mb-1">
                            <a
                                href={`/profile/${application.applicant._id}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                style={{textDecoration: 'none', color: '#007bff'}}
                            >
                                {application.applicant.name}
                            </a>
                        </h4>
                        <p className="mb-0 text-muted">{application.applicant.email}</p>
                        <p
                            className="mb-0 text-muted text-truncate"
                            style={{
                                maxWidth: '300px',
                                whiteSpace: 'nowrap',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis'
                            }}
                        >
                            {application.applicant.about || 'About info not provided'}
                        </p>
                    </div>
                </div>

                {/* Resume and Cover Letter Section */}
                <Row className="mb-1">
                    <Row md={12}>
                        <h5>Resume</h5>
                        <p className="text-muted">{application.resume || 'No resume provided'}</p>
                    </Row>
                    <Row md={12}>
                    <h5>Cover Letter</h5>
                        <p className="text-muted">{application.coverLetter || 'No cover letter provided'}</p>
                    </Row>
                </Row>
                <hr/>
                <div className="mt-1">
                    <h5>Status</h5>
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
                </div>
            </ModalBody>
            <ModalFooter>
                <Button color="secondary" onClick={toggle}>Close</Button>
            </ModalFooter>
        </Modal>
    );
};

export default ApplicationModal;