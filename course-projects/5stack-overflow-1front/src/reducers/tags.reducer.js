import {initialTagData} from "../data/initial-data";

export const getInitialTagState = () => {
    return initialTagData
}

const tagsReducer = (state = [], action) => {
    switch (action.type) {
        case "SET_TAGS":
            return action.tags;
        case 'DELETE_TAG':
            return state.filter(tag => tag._id !== action.payload._id);
        default:
            return state;
    }
}

export default tagsReducer;