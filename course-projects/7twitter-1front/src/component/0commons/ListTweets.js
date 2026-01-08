import React, {useContext, useEffect, useRef, useState} from 'react';
import { withRouter } from 'react-router-dom';
import {UserContext} from "../../contexts/user.context";
import {DispatchContext, TweetsContext} from "../../contexts/tweets.context";
import {useFetchTweets} from "../../rest/useRestTweets";
import {Alert, Button, Col, FormGroup, Input, Label, Row} from "reactstrap";
import TweetItem from "./TweetItem";
import ErrorModal from "./ErrorModal";


function ListTweets(props) {
    const loggedUser = useContext(UserContext);
    const tweets = useContext(TweetsContext);
    const [filteredTweets, setFilteredTweets] = useState(tweets);
    const dispatch = useContext(DispatchContext);
    const [error, setError] = useState('');
    const fetchTweets = useFetchTweets();
    const { homePage } = props;
    const [reload, setReload] = useState(true);
    const [filter, setFilter] = useState('newest');
    const {query} = props.match.params;
    const prevQuery = useRef(query);

    useEffect(() => {
        const getTweets = async () => {
            try {
                const fetchedTweets = await fetchTweets();
                dispatch({ type: 'SET_TWEETS', tweets: fetchedTweets });
                if (query) {
                    const queryLower = query.toLowerCase();
                    const filtered = fetchedTweets.filter(tweet => {
                        return (
                            tweet.text.toLowerCase().includes(queryLower) ||
                            tweet.creator.name.toLowerCase().includes(queryLower) ||
                            tweet.creator.email.toLowerCase().includes(queryLower)
                        );
                    });
                    setFilteredTweets(filtered);
                    console.log('Filtered tweets:', JSON.stringify(filtered));
                } else {
                    setFilteredTweets(fetchedTweets);
                }
                setReload(false);
                setError(null);
            } catch (error) {
                if (error.message === 'Unauthorized') {
                    dispatch({ type: 'LOGOUT' });
                }
                dispatch({ type: 'SET_TWEETS', tweets: [] });
                setError('Tweets could not be retrieved.');
            }
        };

        if (reload || prevQuery.current !== query) {
            getTweets();
            setReload(false);
        }
    }, [dispatch, reload, query, fetchTweets]);

    const handleFilterChange = (filterType) => {
        setFilter(filterType);
    };

    const triggerReload = () => {
        setReload(true);
    };

    const sortedTweets = filteredTweets
        .sort((a, b) => {
            if (filter === 'newest') {
                return new Date(b.createdAt) - new Date(a.createdAt);
            } else if (filter === 'oldest') {
                return new Date(a.createdAt) - new Date(b.createdAt);
            } else if (filter === 'popular') {
                return b.likes.length - a.likes.length;
            } else if (filter === 'most-retweeted') {
                return b.retweets.length - a.retweets.length;
            }
            return 0;
        });

    return (
        <div className="container">
            <Row className="tweet-page-header mb-3">
                <Col>
                    {homePage ? (
                        <>
                            <h1 className="display-6 fs-2">Welcome back, <span
                                className="text-muted">{loggedUser.email}</span></h1>
                            <p>Explore the latest tweets and connect with others.</p>
                        </>
                    ) : (
                        <h1 className="display-3">Tweets</h1>
                    )}
                </Col>
            </Row>
            {!homePage && (
                <Row className="mb-3">
                    <Col md={12} className="text-right">
                        <button className="btn btn-outline-info me-2 custom-info-button" onClick={() => handleFilterChange('newest')}>Newest</button>
                        <button className="btn btn-outline-info me-2 custom-info-button" onClick={() => handleFilterChange('oldest')}>Oldest</button>
                        <button className="btn btn-outline-info me-2 custom-info-button" onClick={() => handleFilterChange('popular')}>Popular</button>
                        <button className="btn btn-outline-info me-2 custom-info-button" onClick={() => handleFilterChange('most-retweeted')}> Most Retweeted</button>
                    </Col>
                </Row>
            )}
            <Row>
                <Col>
                    {error && <ErrorModal error={error} />}
                    {sortedTweets.length === 0 && !error && (
                        <Alert color="warning">
                            <h4 className="alert-heading">No Tweets Found</h4>
                            <p>There are currently no tweets to display. Please check back later or make one yourself :P</p>
                        </Alert>
                    )}
                    <ul className="list-unstyled">
                        {sortedTweets.map(tweet => (
                            <TweetItem
                                key={tweet._id}
                                tweet={tweet}
                                history={props.history}
                                triggerReload={triggerReload}
                                setError={setError}
                            />
                        ))}
                    </ul>
                </Col>
            </Row>
        </div>
    );
}

export default withRouter(ListTweets);