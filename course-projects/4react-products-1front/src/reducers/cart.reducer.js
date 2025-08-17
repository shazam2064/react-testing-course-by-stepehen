import { v4 as uuid } from "uuid";
import { cartInitialData } from "../data/initial-data";

export const getInitialCartState = () => {
    return cartInitialData;
};

const cartReducer = (state, action) => {
    switch (action.type) {
        case "SET_CART":
            return action.cart;
        case 'CLEAR_CART':
            return [];
        default:
            return state;
    }
};

export const clearCart = () => ({ type: 'CLEAR_CART' });

export default cartReducer;