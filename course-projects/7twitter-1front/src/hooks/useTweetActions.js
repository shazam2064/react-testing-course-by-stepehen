// File: `src/hooks/useTweetActions.js`
import { useContext } from 'react';
import { UserContext } from '../contexts/user.context';
import { useLikeTweet, useReTweet } from '../rest/useRestTweets';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faRetweet, faHeart } from '@fortawesome/free-solid-svg-icons';

export const useTweetActions = (props, triggerReload, setError) => {
    const loggedUser = useContext(UserContext);
    const likeTweet = useLikeTweet();
    const retweet = useReTweet();

    const handleViewTweet = (tweetId) => {
        props.history.push(`/view-tweet/${tweetId}`);
    };

    const handleLikeTweet = (tweetId) => {
        if (!loggedUser || !loggedUser.token) {
            setError('You must be logged in to like a tweet.');
            return;
        }

        likeTweet(tweetId)
            .then(() => {
                triggerReload();
            })
            .catch((error) => {
                setError('Tweet could not be liked: ' + error.message);
            });
    };

    const handleRetweet = (tweetId) => {
        if (!loggedUser || !loggedUser.token) {
            setError('You must be logged in to retweet.');
            return;
        }

        retweet(tweetId)
            .then(() => {
                triggerReload();
            })
            .catch((error) => {
                setError('Tweet could not be retweeted: ' + error.message);
            });
    };

    const showActionButtons = (tweet) => {
        const hasLiked = tweet.likes.includes(loggedUser.userId);
        const hasRetweeted = tweet.retweets.includes(loggedUser.userId);

        return (
            <div className="d-flex justify-content-start mt-2">
                <div
                    className="me-3 d-inline-block"
                    onClick={() => handleViewTweet(tweet._id)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faComment} /> {tweet.comments.length}
                </div>
                <div
                    className={`me-3 d-inline-block ${hasRetweeted ? 'text-primary' : ''}`}
                    onClick={() => handleRetweet(tweet._id)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faRetweet} /> {tweet.retweets.length}
                </div>
                <div
                    className={`d-inline-block ${hasLiked ? 'text-danger' : ''}`}
                    onClick={() => handleLikeTweet(tweet._id)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faHeart} /> {tweet.likes.length}
                </div>
            </div>
        );
    };

    return { handleViewTweet, handleLikeTweet, handleRetweet, showActionButtons };
};