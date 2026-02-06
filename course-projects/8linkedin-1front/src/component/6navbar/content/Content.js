import React from "react";
import classNames from "classnames";
import {Container} from "reactstrap";
import {Switch, Route} from "react-router-dom";

import Home from "../../Home";
import Login from "../../1auth/Login";
import Signup from "../../1auth/Signup";
import AdminUsers from "../../2admin-users/ListUsers";
import AddEditUser from "../../3add-edit-users/AddEditUser";
import Profile from "../../4user-profile/Profile";
import Verify from "../../5verify-email/Verify";
import {PostsProvider} from "../../../contexts/posts.context";
import ViewPost from "../../7posts/ViewPost";
import AddEditPost from "../../8add-edit-posts/AddEditPost";
import {CommentsProvider} from "../../../contexts/comments.context";
import ListPosts from "../../0commons/ListPosts";
import ListJobs from "../../11jobs/ListJobs";
import {JobsProvider} from "../../../contexts/jobs.context";
import ViewJob from "../../11jobs/ViewJob";
import AddEditJob from "../../12add-edit-jobs/AddEditJob";
import ApplyToJob from "../../13applications/ApplyToJob";
import ReviewApplications from "../../14applications-manager/ReviewApplications";
import {ConversationsProvider} from "../../../contexts/conversations.context";
import Chat from "../../15messages/Chat";
import {ConnectionsProvider} from "../../../contexts/connections.context";
import NotificationsList from "../../16notifications/NotificationsList";

const Content = ({sidebarIsOpen}) => (
    <Container
        fluid
        className={classNames("content", {"is-open": sidebarIsOpen})}
    >
        <PostsProvider>
            <CommentsProvider>
                <JobsProvider>
                    <ConversationsProvider>
                        <ConnectionsProvider>
                            <Switch>
                                <Route exact path="/" component={Home}/>
                                <Route path="/view-post/:postId" component={ViewPost}/>
                                <Route path="/post/:query"
                                       render={(routeProps) => <ListPosts {...routeProps}/>}/>
                                <Route path="/add-post"
                                       render={(routeProps) => <AddEditPost {...routeProps} />}/>
                                <Route path="/edit-post/:postId"
                                       render={(routeProps) => <AddEditPost {...routeProps} />}/>
                                <Route path="/jobs"
                                       render={(routeProps) => <ListJobs {...routeProps} />}/>
                                <Route
                                    path="/view-job/:jobId"
                                    render={(routeProps) => <ViewJob {...routeProps} />}
                                />
                                <Route path="/admin/add-job"
                                       render={(routeProps) => <AddEditJob {...routeProps} />}/>
                                <Route path="/admin/edit-job/:jobId"
                                       render={(routeProps) => <AddEditJob {...routeProps} />}/>
                                <Route path="/apply/:jobId"
                                       render={(routeProps) => <ApplyToJob {...routeProps} />}/>
                                <Route path="/admin/review-applications/:jobId"
                                       render={(routeProps) => <ReviewApplications {...routeProps} />}/>
                                <Route path="/messaging"
                                       render={(routeProps) => <Chat {...routeProps} />}/>
                                <Route path="/notifications"
                                       render={(routeProps) => <NotificationsList {...routeProps} />}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/signup" component={Signup}/>
                                <Route path="/users" component={AdminUsers}/>
                                <Route path="/admin/add-user"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/admin/edit-user/:adminUserId"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/profile/:userId"
                                       render={(routeProps) => <Profile {...routeProps} />}/>
                                <Route path="/verify/:token" component={Verify}/>
                            </Switch>
                        </ConnectionsProvider>
                    </ConversationsProvider>
                </JobsProvider>
            </CommentsProvider>
        </PostsProvider>
    </Container>
);

export default Content;
