import React, { useContext, useEffect, useState } from 'react';
import { QuestionsContext } from "../../contexts/questions.context";
import { TagsContext } from "../../contexts/tags.context";
import { getInitialQuestionState } from "../../reducers/question.reducer";
import { useCreateQuestion, useUpdateQuestion } from "../../rest/useRestQuestions";
import { UserContext } from "../../contexts/user.context";
import {Alert, Badge, Button, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditQuestion(props) {
    const questions = useContext(QuestionsContext);
    const tags = useContext(TagsContext);
    const [question, setQuestion] = useState(getInitialQuestionState()[0]);
    const [error, setError] = useState(null);
    const createQuestion = useCreateQuestion();
    const updateQuestion = useUpdateQuestion();
    const { questionId } = props.match.params;
    const isEditMode = !!questionId;
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            const question = questions.find(question => question._id === questionId);
            if (question) {
                setQuestion(question);
            }
        } else {
            setQuestion(getInitialQuestionState()[0]);
        }
    }, [questionId, isEditMode, questions]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setQuestion(prevQuestion => ({
            ...prevQuestion,
            [name]: value
        }));
    };

    const handleTagChange = (e) => {
        if (!e.target.value) {
            return;
        }
        const searchedTag = e.target.value;
        if (searchedTag && !question.tags.some(tag => (tag._id ? tag._id : tag) === searchedTag)) {
            setQuestion(prevQuestion => ({
                ...prevQuestion,
                tags: [...prevQuestion.tags, searchedTag]
            }));
        }
    };

    const handleRemoveTag = (searchedTag) => {
        setQuestion(prevQuestion => ({
            ...prevQuestion,
            tags: prevQuestion.tags.filter(tag => (tag._id ? tag._id : tag) !== searchedTag)
        }));
    };

    const validateForm = () => {
        const { title, content } = question;
        return title && content;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (error) {
            setVisible(true);
        }
        if (!validateForm()) {
            alert('Please fill in the missing fields');
            return;
        }
        try {
            if (isEditMode) {
                await updateQuestion(question);
            } else {
                await createQuestion(question);
            }
            setError(null);
            props.history.push('/questions');
        } catch (error) {
            setError(`Question could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    return (
        <div className="container my-4 col-6 mx-auto">
            <h2 className="mb-3 text-center display-3">{isEditMode ? 'Edit Question' : 'Add New Question'}</h2>
            {error ?
                <Alert className="custom-alert" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <label htmlFor="title">Title</label>
                    <input
                        type="text"
                        id="title"
                        name="title"
                        className="form-control"
                        value={question.title}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <label htmlFor="content">Content</label>
                    <textarea
                        id="content"
                        name="content"
                        className="form-control"
                        value={question.content}
                        onChange={handleChange}
                        required
                    />
                </FormGroup>
                <FormGroup>
                    <Label for="tags">Tags</Label>
                    <Input type="select" id="tags" onChange={handleTagChange}>
                        <option value="" key="" name="">Select a tag</option>
                        {tags.map(tag => (
                            <option key={tag._id} value={tag._id}>{tag.name}</option>
                        ))}
                    </Input>
                    <div className="mt-3 d-flex flex-wrap">
                        {question.tags.map(tagId => {
                            let searchedTag;
                            if (tagId._id) {
                                searchedTag = tagId._id;
                            } else {
                                searchedTag = tagId;
                            }
                            const tag = tags.find(tag => tag._id === searchedTag) ?? { name: "" };
                            return (
                                <div key={searchedTag}
                                     className="d-flex text-primary align-items-center border border-primary rounded mx-1 py-0 px-1">
                                    {tag.name}
                                    <Button close className="ml-2 py-0" onClick={() => handleRemoveTag(searchedTag)}/>
                                </div>
                            );
                        })}
                    </div>
                </FormGroup>
                <div className="d-flex align-items-center justify-content-center">
                    <button type="submit" className="btn btn-outline-info mb-3">Save</button>
                </div>
            </Form>
        </div>
    );
}

export default AddEditQuestion;