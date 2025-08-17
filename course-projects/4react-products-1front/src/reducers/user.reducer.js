import { userInitialData,  } from "../data/initial-data";

const userReducer = (users, action) => {
    switch (action.type) {
        case 'LOGIN':
            return { ...users, ...action.payload, isLogged: true };
        case 'LOGOUT':
            return { ...users, ...userInitialData };
        case 'SET_USER':
            return { ...users, ...action.payload };
        default:
            return users;
    }
}

export default userReducer;