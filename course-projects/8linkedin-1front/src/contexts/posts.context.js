import React, {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import postsReducer from "../reducers/posts.reducer.js";
import {initialPostsData} from "../data/initial-data";

export const PostsContext = createContext();
export const DispatchContext = createContext();

export const PostsProvider = ({children}) => {
    const [posts, dispatch] = useLocalStorageReducer("posts", initialPostsData, postsReducer);

    return (
        <PostsContext.Provider value={posts}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </PostsContext.Provider>
    );
}