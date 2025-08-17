export const getInitialAdminUserState = () => {
    return {
        _id: '',
        name: '',
        email: '',
        status: '',
        password: '',
        isAdmin: false
    };
};

const adminUserReducer = (adminUsers, action) => {
    switch (action.type) {
        case "SET_ADMIN_USERS":
            return action.adminUsers;
        case 'DELETE_ADMIN_USER':
            return adminUsers.filter(adminUser => adminUser._id !== action.payload._id);
        default:
            return adminUsers;
    }
}

export default adminUserReducer;