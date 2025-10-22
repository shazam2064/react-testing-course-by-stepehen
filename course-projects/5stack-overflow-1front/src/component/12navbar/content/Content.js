import React from "react";
import classNames from "classnames";
import { Container } from "reactstrap";
import { Switch, Route } from "react-router-dom";

import Topbar from "./Topbar";
import {QuestionsProvider} from "../../../contexts/questions.context";
import {AnswersProvider} from "../../../contexts/answers.context";
import {TagsProvider} from "../../../contexts/tags.context";
import Home from "../../Home";
import QuestionList from "../../1questions/QuestionList";
import ViewQuestion from "../../2view-question/ViewQuestion";
import AddEditQuestion from "../../5add-edit-question/AddEditQuestion";
import Login from "../../6auth/Login";
import Signup from "../../6auth/Signup";
import AdminUsers from "../../8admin-users/ListUsers";
import AddEditUser from "../../9add-edit-users/AddEditUser";
import Tags from "../../7tags/Tags";
import Profile from "../../10user-profile/Profile";
import Verify from "../../11verify-email/Verify";

const Content = ({ sidebarIsOpen, toggleSidebar }) => (
    <Container
        fluid
        className={classNames("content", { "is-open": sidebarIsOpen })}
    >
                <QuestionsProvider>
                    <AnswersProvider>
                        <TagsProvider>
                            <Switch>
                                <Route exact path="/" component={Home}/>
                                <Route path="/questions"
                                       render={(routeProps) => <QuestionList {...routeProps}/>}/>
                                <Route path="/question/:tagId"
                                       render={(routeProps) => <QuestionList {...routeProps}/>}/>
                                <Route path="/view-question/:questionId" component={ViewQuestion}/>
                                <Route path="/add-question"
                                       render={(routeProps) => <AddEditQuestion {...routeProps} />}/>
                                <Route path="/edit-question/:questionId"
                                       render={(routeProps) => <AddEditQuestion {...routeProps} />}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/signup" component={Signup}/>
                                <Route path="/admin/users" component={AdminUsers}/>
                                <Route path="/admin/add-user"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/admin/edit-user/:adminUserId"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/tags" component={Tags}/>
                                <Route path="/profile/:userId"
                                       render={(routeProps) => <Profile {...routeProps} />}/>
                                <Route path="/verify/:token" component={Verify}/>
                            </Switch>
                        </TagsProvider>
                    </AnswersProvider>
                </QuestionsProvider>
    </Container>
);

export default Content;
