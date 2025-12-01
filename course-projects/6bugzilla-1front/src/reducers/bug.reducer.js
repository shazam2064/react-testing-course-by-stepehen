import {bugsInitialData} from "../data/initial-data";

export const getInitialBugState = () => {
    return bugsInitialData;
}

const bugReducer = (bug, action) => {
    switch (action.type) {
        case "SET_BUG":
            return action.bug;
        case 'DELETE_BUG':
            return bug.filter(bug => bug._id !== action.payload._id);
        default:
            return bug;
    }
}

export default bugReducer;