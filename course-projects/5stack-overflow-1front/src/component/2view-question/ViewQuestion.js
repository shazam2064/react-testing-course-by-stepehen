import React, {useContext, useEffect, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {QuestionsContext, DispatchContext} from '../../contexts/questions.context';
import Answer from "../3answers/Answers";
import AddEditAnswer from "../4add-editanswer/AddEditAnswer";
import {getInitialQuestionState} from "../../reducers/question.reducer";
import {useDeleteQuestion, useFetchQuestion, useFetchQuestions, useVoteQuestion} from "../../rest/useRestQuestions";
import {useDeleteAnswer} from "../../rest/useRestAnswers";
import {UserContext} from "../../contexts/user.context";
import {Link} from 'react-router-dom';
import {
    Col,
    Nav,
    NavItem,
    NavLink,
    Row,
    Button,
    Badge,
    Card,
    CardBody,
    CardTitle,
    CardText,
    CardFooter
} from "reactstrap";

function ViewQuestion(props) {
    const questions = useContext(QuestionsContext);
    const dispatch = useContext(DispatchContext);
    const [question, setQuestion] = useState(() => getInitialQuestionState()[0] || null);
    const [error, setError] = useState(null);
    const fetchQuestion = useFetchQuestion();
    const fetchQuestions = useFetchQuestions();
    const voteQuestion = useVoteQuestion();
    const deleteAnswer = useDeleteAnswer();
    const deleteQuestion = useDeleteQuestion();
    const {questionId} = props.match.params;
    const [reload, setReload] = useState(true);
    const [reloadVote, setReloadVote] = useState(false);
    const [editAnswerId, setEditAnswerId] = useState(null);
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const isCreator = !!(question && question.creator && question.creator._id === loggedUser.userId);

    useEffect(() => {
        if (reload) {
            fetchQuestion(questionId)
                .then(question => {
                    setQuestion(question);
                    setReload(false);
                })
                .catch(error => setError(error.message));
        } else if (reloadVote) {
            const getQuestions = async () => {
                try {
                    const questions = await fetchQuestions();
                    dispatch({type: 'SET_QUESTIONS', questions});
                    const filteredQuestion = questions.filter(q => q._id === questionId);
                    setQuestion(filteredQuestion[0]);
                    setEditAnswerId(null);
                    setReloadVote(false);
                    setError(null);
                } catch (error) {
                    if (error.message === 'Unauthorized') {
                        dispatch({type: 'LOGOUT'});
                    }
                    dispatch({type: 'SET_QUESTIONS', questions: []});
                    setError('Questions could not be retrieved.');
                }
            };

            getQuestions();
        }
    }, [reload, reloadVote, questionId]);

    if (!question) {
        return <p>Question not found</p>;
    }

    const handleVote = (vote) => {
        voteQuestion(questionId, vote)
            .then(question => {
                setReloadVote(true);
            })
            .catch(error => setError(error.message));
    }

    const triggerReloadVote = () => {
        setReloadVote(true);
    }

    const handleEditAnswer = (answerId) => {
        setEditAnswerId(answerId);
    }

    const handleDeleteAnswer = (answerId) => {
        deleteAnswer(answerId).then(() => {
            dispatch({type: 'DELETE_ANSWER', payload: {_id: answerId}});
            setError(null);
            triggerReloadVote();
        }).catch(error => {
            setError('Answer could not be deleted.');
        });
    }

    const handleEditQuestion = (questionId) => {
        props.history.push(`/edit-question/${questionId}`);
    }

    const handleDeleteQuestion = (questionId) => {
        deleteQuestion(questionId).then(() => {
            dispatch({type: 'DELETE_QUESTION', payload: {_id: questionId}});
            setError(null);
            props.history.push('/questions');
        }).catch(error => {
            setError('Question could not be deleted.');
        });
    }

    return (
        <div className="container">
            <Row>
                <Col>
                    <h1 className="display-5">{question.title}</h1>
                    <footer>
                        <Row>
                            <Col>
                                <ul className="list-inline mb-0">
                                    <li className="list-inline-item">
                                        Asked:<span
                                        className="text-muted"> {new Date(question.createdAt).toLocaleDateString()}</span>
                                    </li>
                                    <li className="list-inline-item">
                                        Modified: <span
                                        className="text-muted"> {new Date(question.updatedAt).toLocaleDateString()}</span>
                                    </li>
                                    <li className="list-inline-item">
                                        Views: <span className="text-muted"> {question.views}</span>
                                    </li>
                                </ul>
                                <hr/>
                            </Col>
                        </Row>
                    </footer>
                </Col>
            </Row>
            <div className="mb-3">
                <Row>
                    <Col xs="1">
                        <div className="d-flex flex-column align-items-center mt-4">
                            <Button color="link" onClick={() => handleVote('up')}>Upvote</Button>
                            <span>{question.votes}</span>
                            <Button color="link" onClick={() => handleVote('down')}>Downvote</Button>
                        </div>
                    </Col>
                    <Col xs="11">
                        <Card>
                            <CardBody>
                                <CardText className="fs-5">{question.content}</CardText>
                                <div className="mb-3">
                                    {question.tags.map(tag => (
                                        <Badge key={tag._id} color="secondary" className="mx-1">{tag.name}</Badge>
                                    ))}
                                </div>
                                <CardFooter>
                                    <Row>
                                        <Col>
                                            {(isAdmin || isCreator) && (
                                                <div className="mt-2 d-flex justify-content-start align-items-center">
                                                    <button className="btn btn-outline-primary mx-2"
                                                            onClick={() => handleEditQuestion(question._id)}>Edit
                                                    </button>
                                                    <button className="btn btn-outline-danger"
                                                            onClick={() => handleDeleteQuestion(question._id)}>Delete
                                                    </button>
                                                </div>
                                            )}
                                        </Col>
                                        <Col>
                                            <div className="mt-3 d-flex justify-content-end align-items-center">
                                                <span className="text-muted">Asked by <Link
                                                    to={`/profile/${question.creator._id}`}>{question.creator.name}</Link> on {new Date(question.createdAt).toLocaleDateString()}</span>
                                                {question.updatedBy && (
                                                    <span>Edited by <Link
                                                        to={`/profile/${question.updatedBy._id}`}>{question.updatedBy.name}</Link> on {new Date(question.updatedAt).toLocaleDateString()}</span>
                                                )}
                                            </div>
                                        </Col>
                                    </Row>
                                </CardFooter>
                            </CardBody>
                        </Card>
                    </Col>
                </Row>
            </div>
            <div>
                <h2>{question.answers.length} Answers</h2>
                <ul className="list-unstyled">
                    {question.answers.map(answer => {
                        const isAnswerCreator = answer.creator._id === loggedUser.userId;
                        return (
                            <li key={answer._id}>
                                <div className="mb-3">
                                    <CardBody>
                                        {editAnswerId === answer._id ? (
                                            <AddEditAnswer answer={answer} questionId={question._id} editMode={true}
                                                           triggerReloadVote={triggerReloadVote}/>
                                        ) : (
                                            <Answer answer={answer} questionId={question._id}
                                                    triggerReloadVote={triggerReloadVote}/>
                                        )}
                                        {(isAdmin || isAnswerCreator) && (
                                            <div className="mt-3">
                                                {editAnswerId === answer._id ? null : (
                                                    <button className="btn btn-outline-primary mx-2"
                                                            onClick={() => handleEditAnswer(answer._id)}>Edit</button>
                                                )}
                                                {editAnswerId === answer._id ? null : (
                                                    <button className="btn btn-outline-danger"
                                                            onClick={() => handleDeleteAnswer(answer._id)}>Delete</button>
                                                )}
                                            </div>
                                        )}
                                    </CardBody>
                                    <hr/>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <h2>Your Answer</h2>
                <AddEditAnswer questionId={question._id} editMode={false} triggerReloadVote={triggerReloadVote}/>
            </div>
        </div>
    );
}

export default withRouter(ViewQuestion);