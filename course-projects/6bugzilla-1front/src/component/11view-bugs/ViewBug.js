import React, {useContext, useEffect, useState} from 'react';
import {BugsContext, DispatchContext} from "../../contexts/bugs.context";
import {getInitialBugState} from "../../reducers/bug.reducer";
import {useDeleteBug, useFetchBugs} from "../../rest/useRestBugs";
import {UserContext} from "../../contexts/user.context";
import AddEditComment from "../14add-edit-comments/AddEditComment";
import Comment from "../13comments/Comments";
import {useDeleteComment} from "../../rest/useRestComments";
import {API_URL} from "../../rest/api.rest";
import {CardBody, Col, FormGroup, Input, Label, Modal, ModalBody, ModalHeader, Row} from "reactstrap";

function ViewBug(props) {
    const bugs = useContext(BugsContext);
    const dispatch = useContext(DispatchContext);
    const [bug, setBug] = useState(getInitialBugState()[0]);
    const [error, setError] = useState(null);
    const [isPopupOpen, setIsPopupOpen] = useState(false);
    const fetchBugs = useFetchBugs();
    const deleteComment = useDeleteComment();
    const [editCommentId, setEditCommentId] = useState(null);
    const {bugId} = props.match.params;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const isCreator = bug.reporter._id === loggedUser.userId;
    const [reload, setReload] = useState(true);

    useEffect(() => {
        const getBugs = async () => {
            try {
                const bugs = await fetchBugs();
                dispatch({type: 'SET_QUESTIONS', questions: bugs});
                const filteredBug = bugs.filter(b => b._id === bugId);
                setBug(filteredBug[0]);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_QUESTIONS', questions: []});
                setError('Questions could not be retrieved.');
            }
        };

        if (reload) {
            getBugs();
            setEditCommentId(null);
            setReload(false);
        }
    }, [bugId, reload]);

    if (!bug) {
        return (
            <div className="page-container">
                <h2>Bug not found...</h2>
            </div>
        );
    }

    const handleEdit = () => {
        props.history.push(`/edit-bug/${bugId}`);
    };

    const handleViewDependency = (depId) => {
        props.history.push(`/view-bug/${depId}`);
    };

    const handleViewHistory = () => {
        props.history.push(`/bug-history/${bugId}`);
    }

    const handleViewProfile = (userId) => {
        props.history.push(`/profile/${userId}`);
    }

    const togglePopup = () => {
        setIsPopupOpen(!isPopupOpen);
    };

    const triggerReload = () => {
        setReload(true);
    }

    const handleEditComment = (commentId) => {
        setEditCommentId(commentId);
    }

    const handleDeleteComment = (commentId) => {
        deleteComment(commentId).then(() => {
            dispatch({type: 'DELETE_ANSWER', payload: {_id: commentId}});
            setError(null);
            triggerReload();
        }).catch(error => {
            setError('Comment could not be deleted.');
        });
    }

    return (
        <div className="container container-fluid p-5 my-4 mx-auto bg-light border-3 border rounded">
            <h1 className="display-5 text-secondary mb-3">{bugId}: <span className="display-5 text-black">{bug.summary}</span>
            </h1>
            <Row className="mb-3">
                <Col>
                    <p><span className="text-muted">Status:</span> {bug.status} {bug.resolution && <span>({bug.resolution})</span>}</p>
                    <p><span className="text-muted">Product:</span> {bug.product.name}</p>
                    <p><span className="text-muted">Component:</span> {bug.component.name}</p>
                    <p><span className="text-muted">Version:</span> {bug.version}</p>
                    <p><span className="text-muted">Hardware:</span> {bug.hardware} {bug.os}</p>
                    <p><span className="text-muted">Importance:</span> {bug.severity} - Priority: {bug.priority}</p>
                    <p><span className="text-muted">Deadline:</span> {bug.deadline}</p>
                    <p><span className="text-muted">Assignee:</span> {bug.assignee.name}</p>
                    <p><span className="text-muted">Dependencies:</span> {bug.dependencies.length > 0 ? (
                        bug.dependencies.map(dep => (
                            <span key={dep._id} onClick={() => handleViewDependency(dep._id)}
                                  className="link-like">{dep.summary} </span>
                        ))
                    ) : (
                        <span>None</span>
                    )}</p>

                </Col>
                <Col>
                    <p><span className="text-muted">Reported by:</span> <span
                        onClick={() => handleViewProfile(bug.reporter._id)}
                        className="link-like">{bug.reporter.name}</span> on {new Date(bug.createdAt).toLocaleDateString()}
                    </p>
                    <p><span className="text-muted">Modified on:</span> {new Date(bug.updatedAt).toLocaleDateString()}
                        <span onClick={handleViewHistory}
                              className="link-like">(History)</span>
                    </p>
                    <FormGroup>
                        <Label for="cc" className="text-muted">CC List:</Label>
                        <Input type="select" id="cc" className="">
                            {bug.CC.map(cc => (
                                <option key={cc._id} value={cc._id}>{cc.email}</option>
                            ))}
                        </Input>
                    </FormGroup>
                    <button className="btn btn-outline-success" onClick={handleEdit}>Edit Bug</button>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col xs="8">
                {bug.attachment && (
                        <>
                            <img src={`${API_URL}/${bug.attachment}`} alt="Attachment" className="attachment img-thumbnail"
                                 onClick={togglePopup} style={{ cursor: 'pointer', maxWidth: '100px', maxHeight: '100px' }} />
                            <Modal isOpen={isPopupOpen} toggle={togglePopup}>
                                <ModalHeader toggle={togglePopup}>Attachment</ModalHeader>
                                <ModalBody>
                                    <img src={`${API_URL}/${bug.attachment}`} alt="Attachment" className="img-fluid" />
                                </ModalBody>
                            </Modal>
                        </>
                    )}
                </Col>
                <Col>
                </Col>
            </Row>
            <div>
                <h2 className="display-6 text-center"> {bug.comments.length} Comments</h2>
                <ul className="list-unstyled">
                    {bug.comments.map(comment => {
                        const isCommentCreator = comment.creator._id === loggedUser.userId;
                        return (
                            <li key={comment._id}>
                                <div className="mb-3">
                                    <CardBody>
                                        {editCommentId === comment._id ? (
                                            <AddEditComment comment={comment} bugId={bugId} editMode={true}
                                                            triggerReload={triggerReload}/>
                                        ) : (
                                            <Comment comment={comment} bugId={bugId}/>
                                        )}
                                        {(isAdmin || isCommentCreator) && (
                                            <div className="mt-3">
                                                {editCommentId === comment._id ? null : (
                                                    <button className="btn btn-outline-success mx-2"
                                                            onClick={() => handleEditComment(comment._id)}>Edit</button>
                                                )}
                                                {editCommentId === comment._id ? null : (
                                                    <button className="btn btn-outline-danger"
                                                            onClick={() => handleDeleteComment(comment._id)}>Delete</button>
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
                <ul>
                    <AddEditComment bugId={bugId} editMode={false} triggerReload={triggerReload}/>
                </ul>
            </div>
        </div>
    );
}

export default ViewBug;