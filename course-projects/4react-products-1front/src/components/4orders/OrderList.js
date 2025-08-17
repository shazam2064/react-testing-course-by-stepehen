import React, { useContext, useEffect,  useState} from 'react';
import { OrdersContext, DispatchContext } from '../../contexts/orders.context';
import { useFetchOrders, useDeleteOrder } from '../../rest/useRestOrders';
import {Alert} from "reactstrap";

function OrderList(props) {
    const orders = useContext(OrdersContext);
    const ordersDispatch = useContext(DispatchContext);
    const [refresh, setRefresh] = useState(true);
    const [error, setError] = useState('');
    const fetchOrders = useFetchOrders();
    const deleteOrder = useDeleteOrder();
    const [visible, setVisible] = useState(true);

    const onDismiss = () => setVisible(false);

    useEffect(() => {
        if (refresh) {
            fetchOrders().then(orders => {
                ordersDispatch({ type: 'SET_ORDERS', orders });
                setRefresh(false);
            }).catch(error => {
                ordersDispatch({ type: 'SET_ORDERS', orders: [] });
                setError(error.message);
                setRefresh(false);
            });
        }
    }, [refresh]);

    const handleDeleteOrder = async (orderId) => {
        try {
            await deleteOrder(orderId);
            ordersDispatch({ type: 'DELETE_ORDER', _id: orderId });
            setError(null);
        } catch (error) {
            setError('Order could not be deleted: ' + error.message);
        }
    };

    const getOrderItems = (orderList) => {
        return orderList.map(item => {
            const { productItem, quantity } = item;
            if (!productItem) {
                return null; // or handle the error appropriately
            }
            return (
                <li key={productItem._id} className="list-group-item d-flex justify-content-between align-items-center my-1 border-1 rounded-2">
                    {productItem.name} - {productItem.price} ({quantity})
                </li>
            );
        });
    };

    const getOrdersList = () => {
        if (orders.length === 0) {
            return <p>No orders found.</p>;
        } else {
            return orders.map(order => (
                <div className="container mb-4" key={order._id}>
                    <h3>Order Id: <span className="text-muted">{order._id}</span></h3>
                    <ul className="list-group">
                        {getOrderItems(order.orderList)}
                    </ul>
                    <button className="btn btn-outline-danger mt-2" onClick={() => handleDeleteOrder(order._id)}>Delete</button>
                </div>
            ));
        }
    };

    return (
        <div className="container my-4">
            <h1 className="mb-3 text-center display-3">Order List</h1>
            {error ?
                <Alert color="danger" isOpen={visible} toggle={onDismiss}>
                    <h4 className="alert-heading">An error occurred</h4>
                    {error}
                </Alert> : null}
            <ul className="list-group">
                {getOrdersList()}
            </ul>
        </div>
    );
}

export default OrderList;