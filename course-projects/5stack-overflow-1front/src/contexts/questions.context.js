import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import questionsReducer from '../reducers/question.reducer.js';
import { initialQuestionsData } from '../data/initial-data';

export const QuestionsContext = createContext();
export const DispatchContext = createContext();

export const QuestionsProvider = ({ children }) => {
    const [questions, dispatch] = useLocalStorageReducer("questions", initialQuestionsData, questionsReducer);

    return (
        <QuestionsContext.Provider value={questions}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </QuestionsContext.Provider>
    );
}