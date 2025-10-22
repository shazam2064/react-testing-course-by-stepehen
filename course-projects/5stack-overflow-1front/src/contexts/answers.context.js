import React, { createContext } from "react";
import useLocalStorageReducer from "../hooks/useLocalStorageReducer";
import answersReducer from "../reducers/answers.reducer";
import { initialAnswerData } from "../data/initial-data";

export const AnswersContext = createContext();
export const DispatchContext = createContext();

export const AnswersProvider = ({ children }) => {
    const [answers, dispatch] = useLocalStorageReducer("answers", initialAnswerData, answersReducer);

    return (
        <AnswersContext.Provider value={answers}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </AnswersContext.Provider>
    );
}