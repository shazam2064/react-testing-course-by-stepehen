// File: `src/hooks/usePostActions.js`
import { useContext } from 'react';
import { UserContext } from '../contexts/user.context';
import { useLikePost } from '../rest/useRestPosts';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faComment, faHeart } from '@fortawesome/free-solid-svg-icons';

export const usePostActions = (props, triggerReload, setError) => {
    const loggedUser = useContext(UserContext);
    const likePost = useLikePost();

    const handleViewPost = (postId) => {
        props.history.push(`/view-post/${postId}`);
    };

    const handleLikePost = (postId) => {
        if (!loggedUser || !loggedUser.token) {
            setError('You must be logged in to like a post.');
            return;
        }

        likePost(postId)
            .then(() => {
                triggerReload();
            })
            .catch((error) => {
                setError('Post could not be liked: ' + error.message);
            });
    };

    const showActionButtons = (post) => {
        const hasLiked = post.likes.includes(loggedUser.userId);

        return (
            <div className="d-flex justify-content-start mt-2">
                <div
                    className="me-3 d-inline-block"
                    onClick={() => handleViewPost(post._id)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faComment} /> {post.comments.length}
                </div>
                <div
                    className={`d-inline-block ${hasLiked ? 'text-danger' : ''}`}
                    onClick={() => handleLikePost(post._id)}
                    style={{ cursor: 'pointer' }}
                >
                    <FontAwesomeIcon icon={faHeart} /> {post.likes.length}
                </div>
            </div>
        );
    };

    return { handleViewPost, handleLikePost, showActionButtons };
};