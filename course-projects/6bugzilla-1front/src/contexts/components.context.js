import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import componentReducer from "../reducers/component.reducer";
import {componentsInitialData} from "../data/initial-data";

export const ComponentsContext = createContext();
export const DispatchContext = createContext();

export const ComponentProvider = ({ children }) => {
    const [components, dispatch] = useLocalStorageReducer("components", componentsInitialData, componentReducer);

    return (
        <ComponentsContext.Provider value={components}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ComponentsContext.Provider>
    );
}

