import React, { useContext, useEffect, useState } from 'react';
import { CartContext, DispatchContext as CartDispatchContext } from '../../contexts/cart.context';
import CartItem from './CartItem';
import { useNavigate, useLocation } from 'react-router-dom';
import { useFetchCart, useDeleteProductFromCart } from "../../rest/useRestCart";
import { useCreateOrder } from "../../rest/useRestOrders";
import { Alert } from "reactstrap";

function CartList() {
    const cart = useContext(CartContext);
    const cartDispatch = useContext(CartDispatchContext);
    const location = useLocation();
    const navigate = useNavigate();
    const [refreshCart, setRefreshCart] = useState(location.state?.refreshCart || false);
    const [error, setError] = useState('');
    const fetchCart = useFetchCart();
    const deleteProductFromCart = useDeleteProductFromCart();
    const createOrder = useCreateOrder();
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refreshCart) {
            setRefreshCart(false);
            fetchCart().then(cart => {
                cartDispatch({ type: 'SET_CART', cart });
            }).catch(error => {
                cartDispatch({ type: 'SET_CART', cart: { products: [] } });
                setError(error.message);
            });
        }

        if (error) {
            setVisible(true);
        }
    }, [refreshCart, error]);

    const handleDeleteProduct = async (prodId) => {
        try {
            await deleteProductFromCart(prodId);
            setRefreshCart(true);
        } catch (error) {
            setError('Product could not be deleted: ' + error.message);
        }
    };

    const getCartMap = () => {
        if (!cart || !cart.products) {
            return <p>No products in the cart</p>;
        }
        return cart.products.map((item) => (
            <CartItem key={item.product._id}
                      prodId={item.product._id}
                      cartItem={item.product}
                      quantity={item.quantity}
                      handleDeleteProduct={handleDeleteProduct}
                      dispatch={cartDispatch}
            />
        ));
    };

    const GetCartList = () => {
        if (!cart) {
            return <p>No products in the cart</p>;
        }
        return getCartMap();
    };

    const handleOrderNow = () => {
        if (!cart || cart.products.length === 0) {
            alert('No items found in cart.');
            return;
        }
        if (error) {
            setVisible(true);
        }
        const newOrder = {
            orderList: cart.products.map(item => ({
                prodId: item.product._id,
                productItem: item.product,
                quantity: item.quantity
            }))
        };
        createOrder(newOrder).then(() => {
            cartDispatch({ type: 'CLEAR_CART' });
            navigate('/orders');
            console.log('Order placed successfully', newOrder);
        }).catch(error => {
            setError('Order could not be placed: ' + error.message);
        });
    };

    return (
        <div className="container my-4">
            <h1 className="mb-3 text-center display-3">Cart List</h1>
            {error &&
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert>
            }
            <ul className="list-group mb-4">
                {GetCartList()}
            </ul>
            <button className="btn btn-outline-success btn-block" onClick={handleOrderNow}>Order Now</button>
        </div>
    );
};

export default CartList;