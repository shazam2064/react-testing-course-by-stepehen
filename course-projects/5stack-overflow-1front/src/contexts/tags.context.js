import React, {createContext} from "react";
import tagsReducer from "../reducers/tags.reducer";
import {initialTagData} from "../data/initial-data";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";


export const TagsContext = createContext();
export const DispatchContext = createContext();

export const TagsProvider = ({children}) => {
    const [tags, dispatch] = useLocalStorageReducer("tags", initialTagData, tagsReducer);

    return (
        <TagsContext.Provider value={tags}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </TagsContext.Provider>
    );
}