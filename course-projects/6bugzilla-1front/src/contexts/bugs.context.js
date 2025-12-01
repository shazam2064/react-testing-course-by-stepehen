import {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import bugReducer from "../reducers/bug.reducer";
import {bugsInitialData} from "../data/initial-data";

export const BugsContext = createContext();
export const DispatchContext = createContext();

export const BugProvider = ({children}) => {
    const [bugs, dispatch] = useLocalStorageReducer("bugs", bugsInitialData, bugReducer);

    return (
        <BugsContext.Provider value={bugs}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </BugsContext.Provider>
    );
}