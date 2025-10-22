import React, { memo } from "react";
import { withRouter } from "react-router-dom";
import { Link } from 'react-router-dom';
import {Badge, Card, CardBody, CardText, CardTitle, Col, Row} from "reactstrap";

const QuestionItem = memo(function QuestionItem({ question, history, actionButtons }) {
    const getFirst50Words = (content) => {
        return content.split(" ").slice(0, 50).join(" ") + (content.split(" ").length > 50 ? "..." : "");
    };

    const handleViewQuestion = () => {
        history.push(`/view-question/${question._id}`);
    };

    return (
        <div key={question._id} className="mb-3">
            <Card>
                <CardBody>
                    <Row>
                        <Col md={2} className="text-center">
                            <div className="votes mb-2"><strong>{question.votes}</strong> votes</div>
                            <div className="answers mb-2"><strong>{question.answers.length}</strong> answers</div>
                            <div className="views"><strong>{question.views}</strong> views</div>
                        </Col>
                        <Col md={10}>
                            <CardTitle tag="h5" onClick={handleViewQuestion}
                                       style={{cursor: 'pointer', color: '#0077cc'}}>
                                {question.title}
                            </CardTitle>
                            <CardText>{getFirst50Words(question.content)}</CardText>
                            <div className="question-meta">
                                <div className="question-tags mb-2">
                                    {question.tags.map(tag => (
                                        <button key={tag._id} className="btn btn-outline-secondary mx-1" >{tag.name}</button>
                                    ))}
                                </div>
                                <div className="question-author text-muted">
                                    <span><Link to={`/profile/${question.creator._id}`}>{question.creator.name}</Link> asked </span>
                                    <span>{new Date(question.createdAt).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </Col>
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
});

export default withRouter(QuestionItem);