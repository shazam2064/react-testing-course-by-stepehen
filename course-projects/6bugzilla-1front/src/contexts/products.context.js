import React, { createContext } from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import productReducer from "../reducers/product.reducer";
import { productsInitialData } from "../data/initial-data";

export const ProductsContext = createContext();
export const DispatchContext = createContext();

export const ProductProvider = ({ children }) => {
    const [products, dispatch] = useLocalStorageReducer("products", productsInitialData, productReducer);

    return (
        <ProductsContext.Provider value={products}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ProductsContext.Provider>
    );
}