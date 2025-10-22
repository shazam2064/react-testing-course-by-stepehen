import React, { useContext, useEffect, useState } from 'react';
import { DispatchContext, QuestionsContext } from '../../contexts/questions.context.js';
import QuestionItem from '../0commons/QuestionItem';
import { withRouter } from 'react-router-dom';
import { useFetchQuestions, useFetchQuestionsByTag } from "../../rest/useRestQuestions";
import { UserContext } from "../../contexts/user.context";
import {Button, Col, Container, FormGroup, Input, Label, Row} from "reactstrap";

function ListQuestions(props) {
    const loggedUser = useContext(UserContext);
    const questions = useContext(QuestionsContext);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchQuestions = useFetchQuestions();
    const fetchQuestionsByTag = useFetchQuestionsByTag();
    const { homePage } = props;
    const { tagId } = props.match.params;
    const isFilteredTag = !!tagId;
    const [reload, setReload] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('newest');

    useEffect(() => {
        const getQuestions = async () => {
            try {
                if (isFilteredTag) {
                    const questions = await fetchQuestionsByTag(tagId);
                    dispatch({ type: 'SET_QUESTIONS', questions });
                    setError(null);
                } else {
                    const questions = await fetchQuestions();
                    dispatch({ type: 'SET_QUESTIONS', questions });
                    setError(null);
                }
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({ type: 'LOGOUT' });
                }
                dispatch({ type: 'SET_QUESTIONS', questions: [] });
                setError('Questions could not be retrieved.');
            }
        };

        if (reload) {
            getQuestions();
            setReload(false);
        }
    }, [dispatch, tagId, isFilteredTag, reload]);

    const handleSearchChange = (e) => {
        setSearchTerm(e.target.value);
    };

    const handleFilterChange = (filterType) => {
        setFilter(filterType);
    };

    const handleViewQuestion = (questionId) => {
        props.history.push(`/view-question/${questionId}`);
    };

    const filteredQuestions = questions
        .filter(question => question.title.toLowerCase().includes(searchTerm.toLowerCase()))
        .sort((a, b) => {
            if (filter === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (filter === 'popular') {
                return b.votes - a.votes;
            } else if (filter === 'views') {
                return b.views - a.views;
            }
            return 0;
        });

    return (
        <div className="container">
            <Row className="question-page-header mb-3">
                <Col>
                    {homePage ? (
                        <>
                            <h1 className="display-5">Welcome back, <span className="text-muted">{loggedUser.email}</span></h1>
                            <hr/>
                        </>
                    ) : (
                        <h1 className="display-3">Questions</h1>
                    )}
                </Col>
                <Col className="mt-5">
                    {!homePage && (
                        <div className="text-right d-flex justify-content-end">
                            <button className="btn btn-primary" onClick={() => props.history.push('/add-question')}>Ask a question</button>
                        </div>
                    )}
                </Col>

            </Row>
            {!homePage && (
                <Row className="mb-3">
                    <Col md={8}>
                        <FormGroup>
                            <Label for="searchQuestions" hidden>Search Questions</Label>
                            <Input
                                type="text"
                                id="searchQuestions"
                                placeholder="Search questions..."
                                value={searchTerm}
                                onChange={handleSearchChange}
                            />
                        </FormGroup>
                    </Col>
                    <Col md={4} className="text-right">
                        <button className="btn secondary-button" onClick={() => handleFilterChange('newest')}>Newest</button>
                        <button className="btn secondary-button" onClick={() => handleFilterChange('popular')}>Popular</button>
                        <button className="btn secondary-button" onClick={() => handleFilterChange('views')}>Views</button>
                    </Col>
                </Row>
            )}
            <Row>
                <Col>
                    {isFilteredTag && <h2>Questions tagged with: {tagId}</h2>}
                    {error && <p className="text-danger">{error}</p>}
                    <ul className="list-unstyled">
                        {filteredQuestions.map(question => (
                            <QuestionItem key={question._id} question={question}>
                                <Button color="link" onClick={() => handleViewQuestion(question._id)}>View</Button>
                            </QuestionItem>
                        ))}
                    </ul>
                </Col>
            </Row>
        </div>
    );
}

export default withRouter(ListQuestions);