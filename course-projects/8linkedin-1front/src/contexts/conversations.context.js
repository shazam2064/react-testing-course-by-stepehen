import React, {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import conversationsReducer from "../reducers/conversations.reducer.js";
import {initialConversationsData} from "../data/initial-data";

export const ConversationsContext = createContext();
export const DispatchContext = createContext();

export const ConversationsProvider = ({children}) => {
    const [conversations, dispatch] = useLocalStorageReducer("conversations", initialConversationsData, conversationsReducer);

    return (
        <ConversationsContext.Provider value={conversations}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </ConversationsContext.Provider>
    );
}