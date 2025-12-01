import {componentsInitialData} from "../data/initial-data";

export const getInitialComponentState = () => {
    return componentsInitialData;
}

const componentReducer = (components, action) => {
    switch (action.type) {
        case "SET_COMPONENTS":
            return action.components;
        case 'DELETE_COMPONENT':
            return components.filter(component => component._id !== action.payload._id);
        default:
            return components;
    }
}

export default componentReducer;