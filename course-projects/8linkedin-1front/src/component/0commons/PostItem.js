import React, { memo, useContext, useState } from "react";
import { withRouter } from "react-router-dom";
import { Link } from "react-router-dom";
import {
    Badge,
    Card,
    CardBody,
    CardText,
    Col,
    Row,
    Dropdown,
    DropdownToggle,
    DropdownMenu,
    DropdownItem,
} from "reactstrap";
import { API_URL } from "../../rest/api.rest";
import PostImage from "../7posts/PostImage";
import { usePostActions } from "../../hooks/usePostActions";
import { UserContext } from "../../contexts/user.context";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrashAlt } from "@fortawesome/free-solid-svg-icons/faTrashAlt";
import { faPencilAlt } from "@fortawesome/free-solid-svg-icons/faPencilAlt";
import { useDeletePost } from "../../rest/useRestPosts";
import { PostsContext, DispatchContext } from "../../contexts/posts.context";
import AddEditPost from "../8add-edit-posts/AddEditPost";

const PostItem = memo(function PostItem({ post, history, triggerReload, setError }) {
    const posts = useContext(PostsContext);
    const dispatch = useContext(DispatchContext);
    const loggedUser = useContext(UserContext);
    const isCreator = post?.creator._id === loggedUser.userId;
    const isAdmin = loggedUser.isAdmin;
    const deletePost = useDeletePost();

    const { showActionButtons } = usePostActions(
        { history },
        triggerReload,
        setError
    );

    const [dropdownOpen, setDropdownOpen] = useState(false);
    const toggleDropdown = () => setDropdownOpen(!dropdownOpen);

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editPostId, setEditPostId] = useState(null);

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const handleEditPost = () => {
        setEditPostId(post._id); // Set the post ID for editing
        toggleModal(); // Open the modal
    };

    const handleDeletePost = () => {
        console.log(`Deleting post with ID: ${post._id}`);
        deletePost(post._id)
            .then(() => {
                dispatch({ type: "DELETE_POST", payload: { _id: post._id } });
                setError(null);
                triggerReload();
                history.push("/");
            })
            .catch((err) => {
                console.error(err);
                setError("Post could not be deleted: " + err.message);
            });
    };

    const getEditDeleteButtons = () => {
        if (loggedUser.isLogged) {
            return (
                (isAdmin || isCreator) && (
                    <Col sm={1} className="text-end">
                        <Dropdown isOpen={dropdownOpen} toggle={toggleDropdown} className="mt-2">
                            <DropdownToggle className="p-0" style={{ background: "transparent", border: "none" }}>
                                <span style={{ fontSize: "1.5rem", cursor: "pointer", color: "#808080" }}>⋮</span>
                            </DropdownToggle>
                            <DropdownMenu>
                                <DropdownItem onClick={handleEditPost} className={"text-primary"}>
                                    <FontAwesomeIcon icon={faPencilAlt} className="me-2"></FontAwesomeIcon>Edit
                                </DropdownItem>
                                <DropdownItem onClick={handleDeletePost} className={"text-danger"}>
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
        <div key={post._id} className="mb-3">
            <Card className="mb-3">
                <CardBody>
                    <Row>
                        <Col sm={1}>
                            <img
                                src={`${API_URL}/${post.creator.image}`}
                                alt="Profile"
                                style={{
                                    width: "70px",
                                    height: "70px",
                                    borderRadius: "50%",
                                    objectFit: "cover",
                                }}
                            />
                        </Col>
                        <Col sm={10}>
                            <div className="d-flex justify-content-between mb-1">
                                <div>
                                    <strong>
                                        <Link to={`/profile/${post.creator._id}`}>{post.creator.name}</Link>
                                    </strong>
                                    <span className="text-muted">
                                        {" "}
                                        @{post.creator.email} · {new Date(post.createdAt).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>
                            <CardText>{post.content}</CardText>
                            {post.image && <PostImage imageUrl={`${API_URL}/${post.image}`} />}
                            {showActionButtons(post)}
                        </Col>
                        {getEditDeleteButtons()}
                    </Row>
                </CardBody>
            </Card>
            <AddEditPost isOpen={isModalOpen} toggle={toggleModal} postId={editPostId} triggerReload={triggerReload} />
        </div>
    );
});

export default withRouter(PostItem);