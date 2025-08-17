import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import productsReducer from '../reducers/products.reducer';
import { prodInitialData } from '../data/initial-data';

export const ProductsContext = createContext();
export const DispatchContext = createContext();

export const ProductsProvider = ({ children }) => {
    const [products, dispatch] = useLocalStorageReducer("products", prodInitialData, productsReducer);

    return (
        <ProductsContext.Provider value={products}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ProductsContext.Provider>
    );
};