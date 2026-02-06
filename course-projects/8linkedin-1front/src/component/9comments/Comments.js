import React, {useContext, useState} from 'react';
import {Link} from "react-router-dom";
import {Card, CardBody, CardText, Col, Dropdown, DropdownItem, DropdownMenu, DropdownToggle, Row} from "reactstrap";
import {API_URL} from "../../rest/api.rest";
import {FontAwesomeIcon} from "@fortawesome/react-fontawesome";
import {faPencilAlt} from "@fortawesome/free-solid-svg-icons/faPencilAlt";
import {faTrashAlt} from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import {UserContext} from "../../contexts/user.context";
import {useDeleteComment, useLikeComment} from "../../rest/useRestComments";
import {CommentsContext, DispatchContext} from "../../contexts/comments.context";
import {faHeart} from "@fortawesome/free-solid-svg-icons";

function Comments({comment, history, triggerReload, setError, handleEditComment}) {
    const comments = useContext(CommentsContext);
    const dispatch = useContext(DispatchContext);
    const loggedUser = useContext(UserContext);
    const isCreator = comment?.creator._id === loggedUser.userId;
    const isAdmin = loggedUser.isAdmin;
    const deleteComment = useDeleteComment();
    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);
    const [hasLiked, setHasLiked] = useState(comment.likes.includes(loggedUser.userId));
    const likeComment = useLikeComment();

    const handleLikeComment = (commentID) => {
        if (!loggedUser || !loggedUser.token) {
            setError('You must be logged in to like a comment.');
            return;
        }

        likeComment(commentID)
            .then(() => {
                setHasLiked((prevHasLiked) => !prevHasLiked);
                triggerReload();
            })
            .catch((error) => {
                setError('comment could not be liked: ' + error.message);
            });
    };

    const handleEdit = () => {
        handleEditComment(comment._id);
    };

    const handleDeleteComment = () => {
        console.log(`Deleting comment with ID: ${comment._id}`);
        deleteComment(comment._id)
            .then(() => {
                setError(null);
                triggerReload();
            })
            .catch((err) => {
                console.error(err);
                setError("Comment could not be deleted: " + err.message);
            });
    };

    const getEditDeleteButtons = () => {
        if (loggedUser.isLogged) {
            return (
                (isAdmin || isCreator) && (
                    <Col sm={1} className="text-end">
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mt-2">
                            <DropdownToggle className="p-0" style={{background: "transparent", border: "none"}}>
                                <span style={{fontSize: "1.5rem", cursor: "pointer", color: "#808080"}}>⋮</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={handleEdit} className={"text-primary"}>
                                    <FontAwesomeIcon icon={faPencilAlt} className="me-2"></FontAwesomeIcon>Edit
                                </DropdownItem>
                                <DropdownItem onClick={handleDeleteComment} className={"text-danger"}>
                                    <FontAwesomeIcon icon={faTrashAlt} className="me-2"></FontAwesomeIcon>Delete
                                </DropdownItem>
                            </DropdownMenu>
                        </Dropdown>
                    </Col>
                )
            );
        }
    };

    return (
        <div key={comment._id} className="mb-3 px-0">
            <Card className="mb-3">
                <CardBody className="mb-3">
                    <Row>
                        <Col sm={1} className="d-flex justify-content-end align-items-start">
                            <img
                                src={`${API_URL}/${comment.creator.image}`}
                                alt="Profile"
                                style={{
                                    width: "50px",
                                    height: "50px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        </Col>
                        <Col sm={10}>
                            <div className="d-flex justify-content-between mb-1">
                                <div>
                                    <strong>
                                        <Link to={`/profile/${comment.creator._id}`}>{comment.creator.name}</Link>
                                    </strong>
                                    <span className="text-muted">
                                {" "}@{comment.creator.email} · {new Date(comment.createdAt).toLocaleDateString()}
                                </span>
                                </div>
                            </div>
                            <CardText>
                                {comment.text}
                                <div
                                    className={`mt-1 ${hasLiked ? 'text-danger' : ''}`}
                                    onClick={() => handleLikeComment(comment._id)}
                                    style={{cursor: 'pointer'}}
                                >
                                    <FontAwesomeIcon icon={faHeart}/> {comment.likes.length}
                                </div>
                            </CardText>

                        </Col>
                        {getEditDeleteButtons()}
                    </Row>
                </CardBody>
            </Card>
        </div>
    );
}

export default Comments;