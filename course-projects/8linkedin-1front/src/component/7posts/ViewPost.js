import React, {memo, useContext, useEffect, useState} from 'react';
import {Alert, Badge, Button, Card, CardBody, CardFooter, CardText, Col, Row} from "reactstrap";
import {useDeletePost, useFetchPost, useFetchPosts, useLikePost} from "../../rest/useRestPosts";
import {Link, withRouter} from "react-router-dom";
import {UserContext} from "../../contexts/user.context";
import {usePostActions} from '../../hooks/usePostActions';
import ErrorModal from "../0commons/ErrorModal";
import PostItem from "../0commons/PostItem";
import {useDeleteComment} from "../../rest/useRestComments";
import AddEditComment from "../10add-edit-comments/AddEditComment";
import Comments from "../9comments/Comments";
import {DispatchContext, PostsContext} from "../../contexts/posts.context";
import {getInitialPostState} from "../../reducers/posts.reducer";

const ViewPost = memo(function ViewPost(props) {
    const posts = useContext(PostsContext)
    const dispatch = useContext(DispatchContext);
    const [post, setPost] = useState(getInitialPostState()[0]);
    const [error, setError] = useState(null);
    const {history} = props;
    const fetchPosts = useFetchPosts();
    const deleteComment = useDeleteComment();
    const [editCommentId, setEditCommentId] = useState(null);
    const {postId} = props.match.params;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const [reload, setReload] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const getPosts = async () => {
            try {
                const posts = await fetchPosts();
                dispatch({type: 'SET_POSTS', posts});
                const filteredPost = posts.filter(t => t._id === postId);
                setPost(filteredPost[0]);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_POSTS', posts: []});
                setError('Posts could not be retrieved:' + error.message);
            }
        }

        if (reload) {
            getPosts();
            setEditCommentId(null);
            setReload(false);
        }
    }, [postId, reload]);

    const onDismiss = () => setVisible(false);

    if (!post) {
        return <div className="container my-4">
            <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                <h4 className="alert-heading">Sorry...</h4>
                No post found.
            </Alert>
        </div>;
    }

    const triggerReload = () => {
        setReload(true);
    };

    const handleEditComment = (commentId) => {
        setEditCommentId(commentId);
    }

    return (
        <div>
            <Row>
                <Col>
                    {error && <ErrorModal error={error}/>}
                    <PostItem
                        key={post._id}
                        post={post}
                        history={history}
                        triggerReload={triggerReload}
                        setError={setError}
                    />
                </Col>
            </Row>
            <Card className="container mt-0 mb-3">
                <h5 className="mt-3">{post.comments.length} Comments</h5>
                <ul className="list-unstyled">
                    {post.comments.map(comment => {
                        return (
                            <li key={comment._id}>
                                <div className="mb-3">
                                    <CardBody>
                                        {editCommentId === comment._id ? (
                                            <AddEditComment comment={comment} postId={post._id} editMode={true}
                                                           triggerReload={triggerReload}/>
                                        ) : (
                                            <Comments
                                                comment={comment}
                                                postId={post._id}
                                                triggerReload={triggerReload}
                                                setError={setError}
                                                handleEditComment={handleEditComment}
                                            />
                                        )}
                                    </CardBody>
                                    <hr/>
                                </div>
                            </li>
                        );
                    })}
                </ul>
                <h5>Your Comment</h5>
                <AddEditComment postId={post._id} editMode={false} triggerReload={triggerReload}/>
            </Card>
        </div>
    );
});

export default withRouter(ViewPost);