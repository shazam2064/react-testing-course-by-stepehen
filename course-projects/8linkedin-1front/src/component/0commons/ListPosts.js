import React, {useContext, useEffect, useRef, useState} from 'react';
import {withRouter} from 'react-router-dom';
import {UserContext} from "../../contexts/user.context";
import {DispatchContext, PostsContext} from "../../contexts/posts.context";
import {useFetchPosts} from "../../rest/useRestPosts";
import {Alert, Button, Card, Col, FormGroup, Input, Label, Row} from "reactstrap";
import PostItem from "./PostItem";
import ErrorModal from "./ErrorModal";
import AddEditPost from "../8add-edit-posts/AddEditPost";


function ListPosts(props) {
    const loggedUser = useContext(UserContext);
    const posts = useContext(PostsContext);
    const [filteredPosts, setFilteredPosts] = useState(posts);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchPosts = useFetchPosts();
    const {homePage} = props;
    const [reload, setReload] = useState(true);
    const [filter, setFilter] = useState('newest');
    const {query} = props.match.params;
    const prevQuery = useRef(query);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        const getPosts = async () => {
            try {
                const fetchedPosts = await fetchPosts();
                dispatch({type: 'SET_POSTS', posts: fetchedPosts});
                if (query) {
                    const queryLower = query.toLowerCase();
                    const filtered = fetchedPosts.filter(post => {
                        return (
                            post.content.toLowerCase().includes(queryLower) ||
                            post.creator.name.toLowerCase().includes(queryLower) ||
                            post.creator.email.toLowerCase().includes(queryLower)
                        );
                    });
                    setFilteredPosts(filtered);
                    console.log('Filtered posts:', JSON.stringify(filtered));
                } else {
                    setFilteredPosts(fetchedPosts);
                }
                setReload(false);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({type: 'LOGOUT'});
                }
                dispatch({type: 'SET_POSTS', posts: []});
                setError('Posts could not be retrieved.');
            }
        };

        if (reload || prevQuery.current !== query) {
            getPosts();
            setReload(false);
        }
    }, [dispatch, reload, query, fetchPosts]);

    const handleFilterChange = (filterType) => {
        setFilter(filterType);
    };

    const triggerReload = () => {
        setReload(true);
    };

    const toggleModal = () => {
        setIsModalOpen(!isModalOpen);
    };

    const sortedPosts = filteredPosts
        .sort((a, b) => {
            if (filter === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (filter === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (filter === 'popular') {
                return b.likes.length - a.likes.length;
            }
            return 0;
        });

    return (
        <Card className="container p-3">
            <Row className="post-page-header mb-0">
                <Col>
                    <>
                        <h1 className="display-6 fs-2">Welcome back, <span
                            className="text-muted">{loggedUser.email}</span></h1>
                        <p>Explore the latest posts and connect with others.</p>
                    </>
                </Col>
            </Row>
            <Row className="mb-3">
                <Col md={10} className="text-right">
                    <button className="btn btn-outline-secondary me-2 btn-outline"
                            onClick={() => handleFilterChange('newest')}>Newest
                    </button>
                    <button className="btn btn-outline-secondary me-2 btn-outline"
                            onClick={() => handleFilterChange('oldest')}>Oldest
                    </button>
                    <button className="btn btn-outline-secondary me-2 btn-outline"
                            onClick={() => handleFilterChange('popular')}>Popular
                    </button>
                </Col>
                <Col md={2} className="text-right">
                    <Button
                        color="success"
                        className="rounded-pill w-100 text-light"
                        onClick={toggleModal}
                    >
                        Add Post
                    </Button>
                </Col>
            </Row>
            <Row>
                <Col>
                    {error && <ErrorModal error={error}/>}
                    {sortedPosts.length === 0 && !error && (
                        <Alert color="warning">
                            <h4 className="alert-heading">No Posts Found</h4>
                            <p>There are currently no posts to display. Please check back later or make one yourself
                                :P</p>
                        </Alert>
                    )}
                    <ul className="list-unstyled">
                        {sortedPosts.map(post => (
                            <PostItem
                                key={post._id}
                                post={post}
                                history={props.history}
                                triggerReload={triggerReload}
                                setError={setError}
                            />
                        ))}
                    </ul>
                </Col>
            </Row>
            <AddEditPost isOpen={isModalOpen} toggle={toggleModal} postId={null} />
        </Card>
    );
}

export default withRouter(ListPosts);