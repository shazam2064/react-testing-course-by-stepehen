import React, {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import tweetsReducer from "../reducers/tweets.reducer.js";
import {initialTweetsData} from "../data/initial-data";

export const TweetsContext = createContext();
export const DispatchContext = createContext();

export const TweetsProvider = ({children}) => {
    const [tweets, dispatch] = useLocalStorageReducer("tweets", initialTweetsData, tweetsReducer);

    return (
        <TweetsContext.Provider value={tweets}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </TweetsContext.Provider>
    );
}