import React from 'react';
import { Link } from "react-router-dom";
import {Card, CardBody, CardText, Row} from "reactstrap";

function Comments({ comment }) {
    return (
        <Card className="mb-3">
            <CardBody>
                <CardText>
                    <span className="text-muted">
                        Comment by
                    </span>
                    <Link to={`/profile/${comment.creator._id}`}> {comment.creator.name} </Link>
                    <span className="text-muted">
                        on {new Date(comment.createdAt).toLocaleDateString()}
                    </span>
                </CardText>
                <CardText>
                    <p>{comment.text}</p>
                    {comment.updatedBy && (
                        <div className="text-muted">
                            <span>Edited by {comment.updatedBy.name} on {new Date(comment.updatedAt).toLocaleDateString()}</span>
                        </div>
                    )}
                </CardText>
            </CardBody>
        </Card>
    );
}

export default Comments;