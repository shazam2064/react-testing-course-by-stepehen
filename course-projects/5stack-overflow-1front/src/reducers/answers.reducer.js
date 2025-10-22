import {initialAnswerData} from "../data/initial-data";

export const getInitialAnswerState = () => {
    return initialAnswerData
}

const answersReducer = (state = [], action) => {
    switch (action.type) {
        case "SET_ANSWERS":
            return action.answers;
        case 'DELETE_ANSWER':
            return state.filter(answer => answer._id !== action.payload._id);
        default:
            return state;
    }
}

export default answersReducer;