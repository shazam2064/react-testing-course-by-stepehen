import {productsInitialData} from "../data/initial-data";

export const getInitialProductState = () => {
    return productsInitialData;
}

const productReducer = (products, action) => {
    switch (action.type) {
        case "SET_PRODUCTS":
            return action.products;
        case 'DELETE_PRODUCT':
            return products.filter(product => product._id !== action.payload._id);
        default:
            return products;
    }
}

export default productReducer;