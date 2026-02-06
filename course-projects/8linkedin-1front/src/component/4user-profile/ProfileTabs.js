import React, {useState} from 'react';
import {Alert, List, Nav, NavItem, NavLink, TabContent, TabPane} from 'reactstrap';
import classnames from 'classnames';
import PostItem from '../0commons/PostItem';
import Comments from "../9comments/Comments";
import {Link} from "react-router-dom";
import JobItem from "../11jobs/JobItem";

function ProfileTabs({adminUser, likedPosts, setError, triggerReload, props}) {
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
                        Posts
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
                        Jobs
                    </NavLink>
                </NavItem>
            </Nav>
            <TabContent activeTab={activeTab}>
                <TabPane tabId="1">
                    <List type="unstyled">
                        {adminUser.posts.length > 0 ? (
                            adminUser.posts.map((post) => (
                                <PostItem
                                    key={post._id}
                                    post={post}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('posts')
                        )}
                    </List>
                </TabPane>
                <TabPane tabId="2">
                    <List type="unstyled">
                        {adminUser.comments.length > 0 ? (
                            adminUser.comments.map((reply) => (
                                <li key={reply._id}>
                                    <Link className="text-decoration-none" to={`/view-post/${reply.post._id}`}>
                                        <Comments
                                            comment={reply}
                                            postId={reply.post._id}
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
                        {likedPosts.length > 0 ? (
                            likedPosts.map((like) => (
                                <PostItem
                                    key={like._id}
                                    post={like}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('liked posts')
                        )}
                    </List>
                </TabPane>
                <TabPane tabId="4">
                    <List type="unstyled" className="px-4 py-2">
                        {adminUser.jobs.length > 0 ? (
                            adminUser.jobs.map((job) => (
                                <JobItem
                                    key={job._id}
                                    job={job}
                                    history={props.history}
                                    triggerReload={triggerReload}
                                    setError={setError}
                                />
                            ))
                        ) : (
                            noResultsMessage('jobs')
                        )}
                    </List>
                </TabPane>
            </TabContent>
        </div>
    );
}

export default ProfileTabs;