import React, { useContext, useEffect, useState } from 'react';
import { CommentsContext, DispatchContext } from "../../contexts/comments.context";
import { getInitialCommentsState } from "../../reducers/comments.reducer";
import { useCreateComment, useUpdateComment } from "../../rest/useRestComments";
import { UserContext } from "../../contexts/user.context";
import {Alert, Button, Form, FormGroup, Input, Label} from "reactstrap";

function AddEditComment({ comment, postId, editMode, triggerReload }) {
    const comments = useContext(CommentsContext);
    const dispatch = useContext(DispatchContext);
    const [commentState, setCommentState] = useState(getInitialCommentsState());
    const [error, setError] = useState(null);
    const createComment = useCreateComment();
    const updateComment = useUpdateComment();
    const commentId = comment?._id;
    const [isEditMode, setIsEditMode] = useState(editMode);
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (isEditMode) {
            setCommentState(comment);
        } else {
            setCommentState(getInitialCommentsState());
        }
    }, [isEditMode]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setCommentState(prevComment => ({
            ...prevComment,
            [name]: value
        }));
    }

    const validateForm = () => {
        const { text } = commentState;
        return text;
    }

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
                await updateComment(commentId, commentState.text);
                setIsEditMode(false);
            } else {
                await createComment(postId, commentState.text);
            }
            setCommentState(getInitialCommentsState());
            triggerReload();
        } catch (error) {
            setError(error.message);
        }
    }

    return (
        <div className="mb-3">
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <Form onSubmit={handleSubmit}>
                <FormGroup>
                    <Label for="content" hidden>Your Comment</Label>
                    <Input
                        type="textarea"
                        name="text"
                        rows="4"
                        id="content"
                        value={commentState.text}
                        onChange={handleChange}
                        placeholder="Add a comment..."
                        cols="50"
                    />
                </FormGroup>
                <Button color="primary" type="submit" className="rounded-pill text-light">{isEditMode ? 'Update Comment' : 'Add Comment'}</Button>
            </Form>
        </div>
    );
}

export default AddEditComment;