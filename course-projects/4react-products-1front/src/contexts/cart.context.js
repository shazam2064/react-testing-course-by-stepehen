import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import cartReducer from '../reducers/cart.reducer';
import { cartInitialData } from '../data/initial-data';

export const CartContext = createContext();
export const DispatchContext = createContext();

export const CartProvider = ({ children }) => {
    const [cart, dispatch] = useLocalStorageReducer("cart", cartInitialData, cartReducer);

    return (
        <CartContext.Provider value={cart}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </CartContext.Provider>
    );
};