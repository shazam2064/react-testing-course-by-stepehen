import React, { useContext, useEffect, useState } from 'react';
import { AnswersContext, DispatchContext } from "../../contexts/answers.context";
import { getInitialAnswerState } from "../../reducers/answers.reducer";
import { useCreateAnswer, useUpdateAnswer } from "../../rest/useRestAnswers";
import { UserContext } from "../../contexts/user.context";
import {Alert, Button, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditAnswer({ answer, questionId, editMode, triggerReloadVote }) {
    const answers = useContext(AnswersContext);
    const dispatch = useContext(DispatchContext);
    const [answerState, setAnswerState] = useState(getInitialAnswerState());
    const [error, setError] = useState(null);
    const createAnswer = useCreateAnswer();
    const updateAnswer = useUpdateAnswer();
    const answerId = answer?._id;
    const [isEditMode, setIsEditMode] = useState(editMode);
    const loggedUser = useContext(UserContext);

    useEffect(() => {
        if (isEditMode) {
            setAnswerState(answer);
        } else {
            setAnswerState(getInitialAnswerState());
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setAnswerState(prevAnswer => ({
            ...prevAnswer,
            [name]: value
        }));
    }

    const validateForm = () => {
        const { content } = answerState;
        return content;
    }

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert('Please fill in the missing fields');
            return;
        }
        try {
            if (isEditMode) {
                await updateAnswer(answerId, answerState.content);
                setIsEditMode(false);
            } else {
                await createAnswer(questionId, answerState.content);
            }
            setAnswerState(getInitialAnswerState());
            triggerReloadVote();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="mb-3">
            {error && <Alert color="danger">{error}</Alert>}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="content">Your Answer</Label>
                    <Input
                        type="textarea"
                        name="content"
                        id="content"
                        rows="5"
                        value={answerState.content}
                        onChange={handleChange}
                        placeholder="Type your answer here..."
                    />
                </FormGroup>
                <button className="btn btn-outline-primary" type="submit">
                    {isEditMode ? 'Update Your Answer' : 'Post Your Answer'}
                </button>
            </Form>
        </div>
    );
}

export default AddEditAnswer;