import React, {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import connectionsReducer from "../reducers/connections.reducer.js";
import {initialConnectionsData} from "../data/initial-data";

export const ConnectionsContext = createContext();
export const DispatchContext = createContext();

export const ConnectionsProvider = ({children}) => {
    const [connections, dispatch] = useLocalStorageReducer("connections", initialConnectionsData, connectionsReducer);

    return (
        <ConnectionsContext.Provider value={connections}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ConnectionsContext.Provider>
    );
}