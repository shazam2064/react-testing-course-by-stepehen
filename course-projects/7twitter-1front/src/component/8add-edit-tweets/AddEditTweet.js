import React, { useState, useEffect, useContext } from 'react';
import { Link, withRouter } from 'react-router-dom';
import { DispatchContext, TweetsContext } from '../../contexts/tweets.context';
import { getInitialTweetState } from '../../reducers/tweets.reducer';
import { useCreateTweet, useUpdateTweet } from '../../rest/useRestTweets';
import { API_URL } from '../../rest/api.rest';
import { UserContext } from '../../contexts/user.context';
import { Alert, Col, Form, FormGroup, Input, Row, Modal, ModalHeader, ModalBody, ModalFooter, Button } from "reactstrap";

function AddEditTweet({ isOpen, toggle, tweetId, history, triggerReload }) {
    const tweets = useContext(TweetsContext);
    const dispatch = useContext(DispatchContext);
    const [tweet, setTweet] = useState(getInitialTweetState());
    const [error, setError] = useState(null);
    const createTweet = useCreateTweet();
    const updateTweet = useUpdateTweet();
    const isEditMode = !!tweetId;
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
            const tweet = tweets.find(tweet => tweet._id === tweetId);
            setTweet(tweet);
        } else {
            setTweet(getInitialTweetState());
        }
    }, [tweetId, isEditMode, refreshKey]); // Add refreshKey to dependencies

    const handleChange = (e) => {
        const { name, value, files } = e.target;
        if (name === 'image') {
            if (files.length > 0) {
                const file = files[0];
                setTweet(prevTweet => ({
                    ...prevTweet,
                    imageFile: file,
                    imageUrl: URL.createObjectURL(file) // Optional: for preview purposes
                }));
            } else if (!files.length && isEditMode && tweet.image) {
                // Retain the existing image in edit mode if no new file is selected
                setTweet(prevTweet => ({
                    ...prevTweet,
                    imageFile: null,
                    imageUrl: `${API_URL}/${tweet.image}`
                }));
            } else {
                setTweet(prevTweet => ({
                    ...prevTweet,
                    imageFile: null,
                    imageUrl: null
                }));
            }
        } else {
            setTweet(prevTweet => ({
                ...prevTweet,
                [name]: value
            }));
        }
    };

    const validateForm = () => {
        const { text } = tweet;
        return text && text.trim().length > 0;
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
            let savedTweet;
            if (isEditMode) {
                await updateTweet(tweet);
                savedTweet = tweet;
            } else {
                savedTweet = await createTweet(tweet);
            }
            setError(null);
            handleToggle();
            history.push(`/view-tweet/${isEditMode ? tweetId : savedTweet._id}`);
            triggerReload();
        } catch (error) {
            setError(`Tweet could not be ${isEditMode ? 'updated' : 'created'}: ${error.message}`);
        }
    };

    const ImagePreview = ({ tweet, isEditMode, showPreview, setShowPreview }) => (
        <>
            {(tweet.imageUrl || (isEditMode && tweet.image)) && (
                <div className="display-flex mr-2 mb-2 mt-0">
                    {showPreview && (
                        <div className="mb-3" style={{ marginTop: '10px' }}>
                            <img
                                src={
                                    tweet.imageUrl
                                        ? tweet.imageUrl
                                        : `${API_URL}/${tweet.image}`
                                }
                                alt="Tweet Attachment"
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
                {isEditMode ? 'Edit Tweet' : 'Add Tweet'}
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
                            id="text"
                            name="text"
                            rows="5"
                            placeholder="Write your tweet here..."
                            onChange={handleChange}
                            value={tweet.text}
                        />
                    </FormGroup>
                    <ImagePreview
                        tweet={tweet}
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
                        {(tweet.imageUrl || (isEditMode && tweet.image)) && (
                            <button
                                type="button"
                                className="btn bg-transparent btn-outline-danger btn-sm me-2"
                                onClick={() => {
                                    setTweet(prevTweet => ({
                                        ...prevTweet,
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
                <Button color="primary" className="text-light" onClick={handleSubmit}>
                    {isEditMode ? 'Edit Tweet' : 'Add Tweet'}
                </Button>
                <Button color="danger" className="text-light" onClick={handleToggle}>
                    Cancel
                </Button>
            </ModalFooter>
        </Modal>
    );
}

export default withRouter(AddEditTweet);