import React from 'react';
import {useVoteAnswer} from "../../rest/useRestAnswers";
import {Link} from 'react-router-dom';
import {Button, Card, CardBody, Col, Row} from "reactstrap";

function Answers({answer, triggerReloadVote}) {
    const voteAnswer = useVoteAnswer();
    const answerId = answer._id;
    const [error, setError] = React.useState(null);

    const handleVote = (vote) => {
        voteAnswer(answerId, vote)
            .then(answer => {
                triggerReloadVote();
            })
            .catch(error => setError(error.message));
    }

    return (
        <div className="mb-3">
            <Row className="align-items-center">
                <Col xs="1" className="d-flex flex-column align-items-center">
                    <Button color="link" onClick={() => handleVote('up')}>Upvote</Button>
                    <div>{answer.votes}</div>
                    <Button color="link" onClick={() => handleVote('down')}>Downvote</Button>
                </Col>
                <Col xs="11">
                    <p>{answer.content}</p>
                    <div className="text-muted">
                        <span>Answered by <Link
                            to={`/profile/${answer.creator._id}`}>{answer.creator.name}</Link> on {new Date(answer.createdAt).toLocaleDateString()}</span>
                        {answer.updatedBy && (
                            <span> | Edited by {answer.updatedBy.name} on {new Date(answer.updatedAt).toLocaleDateString()}</span>
                        )}
                    </div>
                </Col>
            </Row>
        </div>
    );
}

export default Answers;