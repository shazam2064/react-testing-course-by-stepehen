import React, { createContext } from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import adminUserReducer from "../reducers/admin-user.reducer";
import { adminUsersInitialData } from '../data/initial-data';

export const AdminUsersContext = createContext();
export const DispatchContext = createContext();

export const AdminUsersProvider = ({ children }) => {
    const [adminUsers, dispatch] = useLocalStorageReducer("adminUsers", adminUsersInitialData, adminUserReducer);

    return (
        <AdminUsersContext.Provider value={adminUsers}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </AdminUsersContext.Provider>
    );
}