import React, {createContext, useState} from 'react';
import useLocalStorageReducer from '../hooks/useLocalStorageReducer';
import adminUserReducer from "../reducers/admin-user.reducer";
import { adminUsersInitialData } from '../data/initial-data';
import { debounce } from 'lodash';

export const AdminUsersContext = createContext();
export const DispatchContext = createContext();

export const AdminUsersProvider = ({ children }) => {
    const [adminUsers, dispatch] = useLocalStorageReducer("adminUsers", adminUsersInitialData, adminUserReducer);
    const [reloadFlag, setReloadFlag] = useState(0);


    const triggerReloadGlobal = debounce(() => {
        setReloadFlag((prevFlag) => prevFlag + 1);
        console.log("Reload triggered " + reloadFlag);
    }, 300);

    return (
        <AdminUsersContext.Provider value={{adminUsers, reloadFlag, triggerReloadGlobal}}>
            <DispatchContext.Provider value={dispatch}>
                {children}
            </DispatchContext.Provider>
        </AdminUsersContext.Provider>
    );
}