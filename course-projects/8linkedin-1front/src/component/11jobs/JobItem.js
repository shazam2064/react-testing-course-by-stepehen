import React, { memo } from 'react';
import { withRouter } from "react-router-dom";
import { Card, CardBody, CardTitle, CardText, Badge } from "reactstrap";

const JobItem = memo(function JobItem({ job, actionButtons, adminButtons }) {
    return (
        <Card className="mb-4 shadow border-0">
            <CardBody>
                <div className="d-flex justify-content-between align-items-start">
                    <div>
                        <CardTitle tag="h5" className="mb-1 text-primary">
                            {job.title}
                        </CardTitle>
                        <CardText className="text-muted mb-2">
                            <strong>{job.company}</strong> • {job.location}
                        </CardText>
                    </div>
                    <div>{adminButtons}</div>
                </div>
                <CardText className="mb-3">
                    {job.description.length > 150
                        ? `${job.description.substring(0, 150)}...`
                        : job.description}
                </CardText>
                <div className="mb-3">
                    {job.requirements.map((req, index) => (
                        <Badge key={index} color="info" className="me-2">
                            {req}
                        </Badge>
                    ))}
                </div>
                <div className="d-flex gap-2">
                    {actionButtons}
                </div>
            </CardBody>
        </Card>
    );
});

export default withRouter(JobItem);