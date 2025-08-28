import {Route, Routes} from "react-router-dom";
import Shop from "./components/Shop";
import ProductList from "./components/1products/ProductList";
import CartList from "./components/3cart/CartList";
import OrderList from "./components/4orders/OrderList";
import AddEditProduct from "./components/5add-edit-product/AddEditProduct";
import ViewProduct from "./components/2view-product/ViewProduct";
import Navbar from "./components/Navbar";
import AdminProducts from "./components/6admin-product/AdminProducts";
import {ProductsProvider} from "./contexts/products.context";
import {CartProvider} from "./contexts/cart.context";
import {OrdersProvider} from "./contexts/orders.context";
import Login from "./components/7auth/Login";
import Signup from "./components/7auth/Signup";
import {UserProvider} from "./contexts/user.context";
import AdminUsers from "./components/8admin-users/ListUsers";
import {AdminUsersProvider} from "./contexts/admin-users.context";
import AddEditUser from "./components/9add-edit-users/AddEditUser";
import 'bootstrap/dist/css/bootstrap.min.css';

function App() {
    return (
        <div className="App">
            <UserProvider>
                <AdminUsersProvider>
                    <Navbar/>
                    <ProductsProvider>
                        <CartProvider>
                            <OrdersProvider>
                                <Routes>
                                    <Route exact path="/" component={Shop}/>
                                    <Route path="/products" component={ProductList}/>
                                    <Route path="/view-product/:prodId" component={ViewProduct}/>
                                    <Route path="/cart" component={CartList}/>
                                    <Route path="/orders" component={OrderList}/>
                                    <Route path="/admin/add-product"
                                           render={(routeProps) => <AddEditProduct {...routeProps} />}/>
                                    <Route path="/admin/admin-products" component={AdminProducts}/>
                                    <Route path="/admin/edit-product/:prodId"
                                           render={(routeProps) => <AddEditProduct {...routeProps} />}/>
                                    <Route path="/login" component={Login}/>
                                    <Route path="/signup" component={Signup}/>
                                    <Route path="/admin/users" component={AdminUsers}/>
                                    <Route path="/admin/add-user"
                                           render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                    <Route path="/admin/edit-user/:adminUserId"
                                           render={(routeProps) => <AddEditUser {...routeProps} />}/>
                                </Routes>
                            </OrdersProvider>
                        </CartProvider>
                    </ProductsProvider>
                </AdminUsersProvider>
            </UserProvider>
        </div>
    );
}

export default App;