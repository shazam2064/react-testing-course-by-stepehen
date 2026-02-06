import React, {createContext} from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import jobsReducer from "../reducers/jobs.reducer.js";
import {initialJobsData} from "../data/initial-data";

export const JobsContext = createContext();
export const DispatchContext = createContext();

export const JobsProvider = ({children}) => {
    const [jobs, dispatch] = useLocalStorageReducer("jobs", initialJobsData, jobsReducer);

    return (
        <JobsContext.Provider value={jobs}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </JobsContext.Provider>
    );
}