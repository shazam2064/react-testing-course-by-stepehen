import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import userReducer from '../reducers/user.reducer';
import { userInitialData } from '../data/initial-data';

export const UserContext = createContext();
export const DispatchContext = createContext();

export const UserProvider = ({ children }) => {
    const [user, dispatch] = useLocalStorageReducer("user", userInitialData, userReducer);

    return (
        <UserContext.Provider value={user}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </UserContext.Provider>
    );
};