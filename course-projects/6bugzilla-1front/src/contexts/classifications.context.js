import React, { createContext } from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import classificationReducer from "../reducers/classification.reducer";
import { classificationsInitialData } from "../data/initial-data";

export const ClassificationsContext = createContext();
export const DispatchContext = createContext();

export const ClassificationProvider = ({ children }) => {
    const [classifications, dispatch] = useLocalStorageReducer("classifications", classificationsInitialData, classificationReducer);

    return (
        <ClassificationsContext.Provider value={classifications}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ClassificationsContext.Provider>
    );
}