import React, {useState} from 'react';
import {Alert, List, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import classnames from 'classnames';
import TweetItem from '../0commons/TweetItem';
import Comments from "../9comments/Comments";
import {Link} from "react-router-dom";

function ProfileTabs({adminUser, likedTweets, retweetedTweets, setError, triggerReload, props}) {
    const [activeTab, setActiveTab] = useState('1');

    const toggle = (tab) => {
        if (activeTab !== tab) {
            setActiveTab(tab);
        }
    };

    const noResultsMessage = (type) => {
        return (
            <div className="my-4 mx-3" color="info">
                <h5 className="alert-heading"> This user has no {type} yet...</h5>
            </div>
        );
    }

    return (
        <div>
            <Nav tabs>
                <NavItem>
                    <NavLink
                        className={classnames({active: activeTab === '1'})}
                        onClick={() => toggle('1')}
                    >
                        Tweets
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({active: activeTab === '2'})}
                        onClick={() => toggle('2')}
                    >
                        Replies
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({active: activeTab === '3'})}
                        onClick={() => toggle('3')}
                    >
                        Likes
                    </NavLink>
                </NavItem>
                <NavItem>
                    <NavLink
                        className={classnames({active: activeTab === '4'})}
                        onClick={() => toggle('4')}
                    >
                        Retweets
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <List type="unstyled">
                        {adminUser.tweets.length > 0 ? (
                            adminUser.tweets.map((tweet) => (
                                <TweetItem
                                    key={tweet._id}
                                    tweet={tweet}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('tweets')
                        )}
                    </List>
                </TabPane>
                <TabPane tabId="2">
                    <List type="unstyled">
                        {adminUser.comments.length > 0 ? (
                            adminUser.comments.map((reply) => (
                                <li key={reply._id}>
                                    <Link className="text-decoration-none" to={`/view-tweet/${reply.tweet._id}`}>
                                        <Comments
                                            comment={reply}
                                            tweetId={reply.tweet._id}
                                            triggerReload={triggerReload}
                                            setError={setError}
                                        />
                                    </Link>
                                </li>
                            ))
                        ) : (
                            noResultsMessage('replies')
                        )}
                    </List>
                </TabPane>
                <TabPane tabId="3">
                    <List type="unstyled">
                        {likedTweets.length > 0 ? (
                            likedTweets.map((like) => (
                                <TweetItem
                                    key={like._id}
                                    tweet={like}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('liked tweets')
                        )}
                    </List>
                </TabPane>
                <TabPane tabId="4">
                    <List type="unstyled">
                        {retweetedTweets.length > 0 ? (
                            retweetedTweets.map((reTweet) => (
                                <TweetItem
                                    key={reTweet._id}
                                    tweet={reTweet}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('retweeted tweets')
                        )}
                    </List>
                </TabPane>
            </TabContent>
        </div>
    );
}

export default ProfileTabs;