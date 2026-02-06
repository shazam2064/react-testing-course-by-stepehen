import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { DispatchContext, PostsContext } from '../../contexts/posts.context';
import { getInitialPostState } from '../../reducers/posts.reducer';
import { useCreatePost, useUpdatePost } from '../../rest/useRestPosts';
import { API_URL } from '../../rest/api.rest';
import { UserContext } from '../../contexts/user.context';
import { Alert, Col, Form, FormGroup, Input, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

function AddEditPost({ isOpen, toggle, postId, history, triggerReload }) {
    const posts = useContext(PostsContext);
    const dispatch = useContext(DispatchContext);
    const [post, setPost] = useState(getInitialPostState());
    const [error, setError] = useState(null);
    const createPost = useCreatePost();
    const updatePost = useUpdatePost();
    const isEditMode = !!postId;
    const loggedUser = useContext(UserContext);
    const [visible, setVisible] = useState(true);
    const [refreshKey, setRefreshKey] = useState(0);
    const [showPreview, setShowPreview] = useState(false);

    const onDismiss = () => setVisible(false);

    const handleToggle = () => {
        toggle();
        setVisible(false);
        setShowPreview(false);
        setRefreshKey(prevKey => prevKey + 1); // Increment refreshKey
    };

    useEffect(() => {
        if (isEditMode) {
            const post = posts.find(post => post._id === postId);
            setPost(post);
        } else {
            setPost(getInitialPostState());
        }
    }, [postId, isEditMode, refreshKey]); // Add refreshKey to dependencies

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            if (files.length > 0) {
                const file = files[0];
                setPost(prevPost => ({
                    ...prevPost,
                    imageFile: file,
                    imageUrl: URL.createObjectURL(file) // Optional: for preview purposes
                }));
            } else if (!files.length && isEditMode && post.image) {
                // Retain the existing image in edit mode if no new file is selected
                setPost(prevPost => ({
                    ...prevPost,
                    imageFile: null,
                    imageUrl: `${API_URL}/${post.image}`
                }));
            } else {
                setPost(prevPost => ({
                    ...prevPost,
                    imageFile: null,
                    imageUrl: null
                }));
            }
        } else {
            setPost(prevPost => ({
                ...prevPost,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const { content } = post;
        return content && content.trim().length > 0;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!validateForm()) {
            alert('Please fill in the missing fields');
            return;
        }
        if (error) {
            setVisible(true);
        }
        try {
            let savedPost;
            if (isEditMode) {
                await updatePost(post);
                savedPost = post;
            } else {
                savedPost = await createPost(post);
            }
            setError(null);
            handleToggle();
            history.push(`/view-post/${isEditMode ? postId : savedPost._id}`);
            triggerReload();
        } catch (error) {
            setError(`Post could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    const ImagePreview = ({ post, isEditMode, showPreview, setShowPreview }) => (
        <>
            {(post.imageUrl || (isEditMode && post.image)) && (
                <div className="display-flex mr-2 mb-2 mt-0">
                    {showPreview && (
                        <div className="mb-3" style={{ marginTop: '10px' }}>
                            <img
                                src={
                                    post.imageUrl
                                        ? post.imageUrl
                                        : `${API_URL}/${post.image}`
                                }
                                alt="Post Attachment"
                                style={{
                                    width: '90px',
                                    height: '90px',
                                    borderRadius: '10%',
                                    objectFit: 'cover',
                                }}
                            />
                        </div>
                    )}
                    <a
                        href="#"
                        className="text-primary mb-3"
                        onClick={(e) => {
                            e.preventDefault();
                            setShowPreview(!showPreview);
                        }}
                    >
                        {showPreview ? 'Close Attachment' : 'Open Attachment'}
                    </a>
                </div>
            )}
        </>
    );

    return (
        <Modal isOpen={isOpen} toggle={handleToggle} size="lg">
            <ModalHeader toggle={handleToggle}>
                {isEditMode ? 'Edit Post' : 'Add Post'}
            </ModalHeader>
            <ModalBody>
                {error ?
                    <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                        <h4 className="alert-heading">An error occurred</h4>
                        {error}
                    </Alert> : null}
                <Row className="mb-3 d-flex align-items-center">
                    <Col sm={1}>
                        <img
                            src={`${API_URL}/${loggedUser.image}`}
                            alt="Profile Picture"
                            style={{
                                width: '40px',
                                height: '40px',
                                borderRadius: '50%',
                                objectFit: 'cover'
                            }}
                        />
                    </Col>
                    <Col sm={10}>
                        <div className="d-flex justify-content-between mb-1">
                            <div>
                                <strong>
                                    <Link to={`/profile/${loggedUser.userId}`}>@{loggedUser.email}</Link>
                                </strong>
                            </div>
                        </div>
                    </Col>
                </Row>
                <Form onSubmit={handleSubmit} method="POST">
                    <FormGroup>
                        <Input
                            className="form-control"
                            type="textarea"
                            id="content"
                            name="content"
                            rows="5"
                            placeholder="Write your post here..."
                            onChange={handleChange}
                            value={post.content}
                        />
                    </FormGroup>
                    <ImagePreview
                        post={post}
                        isEditMode={isEditMode}
                        showPreview={showPreview}
                        setShowPreview={setShowPreview}
                    />
                    <FormGroup className="d-flex align-items-center justify-content-between">
                        <Input
                            className="form-control"
                            type="file"
                            id="image"
                            name="image"
                            onChange={handleChange}
                        />
                        {(post.imageUrl || (isEditMode && post.image)) && (
                            <button
                                type="button"
                                className="btn bg-transparent btn-outline-danger btn-sm me-2"
                                onClick={() => {
                                    setPost(prevPost => ({
                                        ...prevPost,
                                        image: null,
                                        imageFile: null,
                                        imageUrl: null,
                                    }));
                                    document.getElementById('image').value = ''; // Clear the file input
                                }}
                            >
                                &times;
                            </button>
                        )}
                    </FormGroup>
                </Form>
            </ModalBody>
            <ModalFooter>
                <Button color="success" className="text-light" onClick={handleSubmit}>
                    {isEditMode ? 'Edit Post' : 'Add Post'}
                </Button>
                <Button color="danger" className="text-light" onClick={handleToggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default withRouter(AddEditPost);