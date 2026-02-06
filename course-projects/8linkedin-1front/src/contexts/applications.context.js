import React, {createContext} from "react";
import {initialApplicationsData} from "../data/initial-data";
import applicationsReducer from "../reducers/applications.reducer";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";

export const ApplicationsContext = createContext();
export const DispatchContext = createContext();

export const ApplicationsProvider = ({children}) => {
    const [applications, dispatch] = useLocalStorageReducer("applications", initialApplicationsData, applicationsReducer);

    return (
        <ApplicationsContext.Provider value={applications}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ApplicationsContext.Provider>
    );
}