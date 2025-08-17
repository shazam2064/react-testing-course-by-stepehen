const ordersReducer = (state, action) => {
    switch (action.type) {
        case "SET_ORDERS":
            return action.orders;
        case "DELETE_ORDER":
            return state.filter(order => order._id !== action._id);
        default:
            return state;
    }
};

export default ordersReducer;