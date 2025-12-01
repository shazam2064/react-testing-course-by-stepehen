import logo from './logo.svg';
import 'bootstrap/dist/css/bootstrap.min.css';
import '@fortawesome/fontawesome-free/css/all.min.css';
import {Route, Switch} from "react-router-dom";
import Navbar from "./component/Navbar";
import Login from "./component/0auth/Login";
import Signup from "./component/0auth/Signup";
import {UserProvider} from "./contexts/user.context";
import AdminUsers from "./component/1admin-users/ListUsers";
import {AdminUsersProvider} from "./contexts/admin-users.context";
import AddEditUser from "./component/2add-edit-users/AddEditUser";
import Home from "./component/Home";
import Profile from "./component/3user-profile/Profile";
import Verify from "./component/4verify-email/Verify";
import Admin from "./component/5admin-management/Admin";
import {TitleProvider} from "./contexts/title.context";
import {ClassificationProvider} from "./contexts/classifications.context";
import Classifications from "./component/7classification/ListClassification";
import AddEditClassification from "./component/7classification/AddEditClassification";
import {ProductProvider} from "./contexts/products.context";
import Products from "./component/8products/ListProduct";
import AddEditProduct from "./component/8products/AddEditProduct";
import {ComponentProvider} from "./contexts/components.context";
import Components from "./component/9components/ListComponent";
import AddEditComponent from "./component/9components/AddEditComponent";
import {BugProvider} from "./contexts/bugs.context";
import AddEditBug from "./component/10add-edit-bugs/AddEditBug";
import ViewBug from "./component/11view-bugs/ViewBug";
import ListHistory from "./component/12bug-history/ListHistory";
import {CommentsProvider} from "./contexts/comments.context";
import SearchBug from "./component/15search-bugs/SearchBug";
import BrowseProduct from "./component/16browse/BrowseProduct";
import BrowseClassification from "./component/16browse/BrowseClassification";
import BrowseBug from "./component/16browse/BrowseBug";

function App() {
    return (
        <div className="App">
            <UserProvider>
                <AdminUsersProvider>
                    <TitleProvider>
                        <Navbar/>
                        <ClassificationProvider>
                        <ProductProvider>
                        <ComponentProvider>
                        <BugProvider>
                        <CommentsProvider>
                            <Switch>
                                <Route exact path="/" component={Home}/>
                                <Route path="/login" component={Login}/>
                                <Route path="/signup" component={Signup}/>
                                <Route path="/admin/management" component={Admin}/>
                                <Route path="/admin/users" component={AdminUsers}/>
                                <Route path="/admin/add-user"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/admin/edit-user/:adminUserId"
                                       render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                <Route path="/profile/:userId"
                                       render={(routeProps) => <Profile {...routeProps} />}/>
                                <Route path="/verify/:token" component={Verify}/>
                                <Route path="/admin/classifications" component={Classifications}/>
                                <Route path="/admin/add-classification"
                                       render={(routeProps) => <AddEditClassification {...routeProps} />}/>
                                <Route path="/admin/edit-classification/:classificationId"
                                       render={(routeProps) => <AddEditClassification {...routeProps} />}/>
                                <Route path="/admin/products" component={Products}/>
                                <Route path="/admin/add-product"
                                       render={(routeProps) => <AddEditProduct {...routeProps} />}/>
                                <Route path="/admin/edit-product/:productId"
                                       render={(routeProps) => <AddEditProduct {...routeProps} />}/>
                                <Route path="/admin/components" component={Components}/>
                                <Route path="/admin/add-component"
                                       render={(routeProps) => <AddEditComponent {...routeProps} />}/>
                                <Route path="/admin/edit-component/:componentId"
                                       render={(routeProps) => <AddEditComponent {...routeProps} />}/>
                                <Route path="/new-bug"
                                       render={(routeProps) => <AddEditBug {...routeProps} />}/>
                                <Route path="/edit-bug/:bugId"
                                       render={(routeProps) => <AddEditBug {...routeProps} />}/>
                                <Route path="/view-bug/:bugId" component={ViewBug}></Route>
                                <Route path="/bug-history/:bugId" component={ListHistory}></Route>
                                <Route path="/search-bugs"
                                       render={(routeProps) => <SearchBug {...routeProps} />}/>
                                <Route path="/search-bug/:query"
                                       render={(routeProps) => <SearchBug {...routeProps} />}/>
                                <Route path="/browse-prod/:prodId" component={BrowseProduct}></Route>
                                <Route path="/browse/" component={BrowseClassification}></Route>
                                <Route path="/bug-browse/:componentId" component={BrowseBug}></Route>
                            </Switch>
                        </CommentsProvider>
                        </BugProvider>
                        </ComponentProvider>
                        </ProductProvider>
                        </ClassificationProvider>
                    </TitleProvider>
                </AdminUsersProvider>
            </UserProvider>
        </div>
    );
}

export default App;