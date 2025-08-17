import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import ordersReducer from '../reducers/orders.reducer';
import { orderInitialData } from '../data/initial-data';

export const OrdersContext = createContext();
export const DispatchContext = createContext();

export const OrdersProvider = ({ children }) => {
    const [orders, dispatch] = useLocalStorageReducer("orders", orderInitialData, ordersReducer);

    return (
        <OrdersContext.Provider value={orders}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </OrdersContext.Provider>
    );
};