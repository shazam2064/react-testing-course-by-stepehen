import React from "react";
import classNames from "classnames";
import { Container } from "reactstrap";
import { Switch, Route } from "react-router-dom";

import Home from "../../Home";
import Login from "../../1auth/Login";
import Signup from "../../1auth/Signup";
import AdminUsers from "../../2admin-users/ListUsers";
import AddEditUser from "../../3add-edit-users/AddEditUser";
import Profile from "../../4user-profile/Profile";
import Verify from "../../5verify-email/Verify";
import {TweetsProvider} from "../../../contexts/tweets.context";
import ViewTweet from "../../7tweets/ViewTweet";
import AddEditTweet from "../../8add-edit-tweets/AddEditTweet";
import TweetList from "../../7tweets/TweetList";
import {CommentsProvider} from "../../../contexts/comments.context";

const Content = ({ sidebarIsOpen, toggleSidebar }) => (
    <Container
        fluid
        className={classNames("content", { "is-open": sidebarIsOpen })}
    >
                <TweetsProvider>
                        <CommentsProvider>
                            <Switch>
                                <Route exact path="/" component={Home}/>
                                <Route path="/view-tweet/:tweetId" component={ViewTweet}/>
                                <Route path="/tweets"
                                       render={(routeProps) => <TweetList {...routeProps}/>}/>
                                <Route path="/tweet/:query"
                                       render={(routeProps) => <TweetList {...routeProps}/>}/>
                                <Route path="/add-tweet"
                                       render={(routeProps) => <AddEditTweet {...routeProps} />}/>
                                <Route path="/edit-tweet/:tweetId"
                                       render={(routeProps) => <AddEditTweet {...routeProps} />}/>
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
                        </CommentsProvider>
                </TweetsProvider>
    </Container>
);

export default Content;
