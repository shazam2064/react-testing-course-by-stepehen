import React, {createContext} from "react";
import {commentsInitialData} from "../data/initial-data";
import commentsReducer from "../reducers/comments.reducer";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";

export const CommentsContext = createContext();
export const DispatchContext = createContext();

export const CommentsProvider = ({children}) => {
    const [comments, dispatch] = useLocalStorageReducer("comments", commentsInitialData, commentsReducer);

    return (
        <CommentsContext.Provider value={comments}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </CommentsContext.Provider>
    );
}