import React, {memo, useContext, useEffect, useState} from 'react';
import {Alert, Badge, Button, Card, CardBody, CardFooter, CardText, Col, Row} from "reactstrap";
import {useDeleteTweet, useFetchTweet, useFetchTweets, useLikeTweet} from "../../rest/useRestTweets";
import {Link, withRouter} from "react-router-dom";
import {UserContext} from "../../contexts/user.context";
import {useTweetActions} from '../../hooks/useTweetActions';
import ErrorModal from "../0commons/ErrorModal";
import TweetItem from "../0commons/TweetItem";
import {useDeleteComment} from "../../rest/useRestComments";
import AddEditComment from "../10add-edit-comments/AddEditComment";
import Comments from "../9comments/Comments";
import {DispatchContext, TweetsContext} from "../../contexts/tweets.context";
import {getInitialTweetState} from "../../reducers/tweets.reducer";

const ViewTweet = memo(function ViewTweet(props) {
    const tweets = useContext(TweetsContext)
    const dispatch = useContext(DispatchContext);
    const [tweet, setTweet] = useState(getInitialTweetState()[0]);
    const [error, setError] = useState(null);
    const {history} = props;
    const fetchTweets = useFetchTweets();
    const deleteComment = useDeleteComment();
    const [editCommentId, setEditCommentId] = useState(null);
    const {tweetId} = props.match.params;
    const loggedUser = useContext(UserContext);
    const isAdmin = loggedUser.isAdmin;
    const [reload, setReload] = useState(true);
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        const getTweets = async () => {
            try {
                const tweets = await fetchTweets();
                dispatch({type: 'SET_TWEETS', tweets});
                const filteredTweet = tweets.filter(t => t._id === tweetId);
                setTweet(filteredTweet[0]);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_TWEETS', tweets: []});
                setError('Tweets could not be retrieved:' + error.message);
            }
        }

        if (reload) {
            getTweets();
            setEditCommentId(null);
            setReload(false);
        }
    }, [tweetId, reload]);

    const onDismiss = () => setVisible(false);

    if (!tweet) {
        return <div className="container my-4">
            <Alert color="warning" isOpen={visible} toggle={onDismiss}>
                <h4 className="alert-heading">Sorry...</h4>
                No tweet found.
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
        <div className="container">
            <Row>
                <Col>
                    {error && <ErrorModal error={error}/>}
                    <TweetItem
                        key={tweet._id}
                        tweet={tweet}
                        history={history}
                        triggerReload={triggerReload}
                        setError={setError}
                    />
                </Col>
            </Row>
            <div>
                <h5>{tweet.comments.length} Comments</h5>
                <ul className="list-unstyled">
                    {tweet.comments.map(comment => {
                        return (
                            <li key={comment._id}>
                                <div className="mb-3">
                                    <CardBody>
                                        {editCommentId === comment._id ? (
                                            <AddEditComment comment={comment} tweetId={tweet._id} editMode={true}
                                                           triggerReload={triggerReload}/>
                                        ) : (
                                            <Comments
                                                comment={comment}
                                                tweetId={tweet._id}
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
                <AddEditComment tweetId={tweet._id} editMode={false} triggerReload={triggerReload}/>
            </div>
        </div>
    );
});

export default withRouter(ViewTweet);