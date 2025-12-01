import {classificationsInitialData} from '../data/initial-data';

export const getInitialClassificationState = () => {
    return classificationsInitialData
}

const classificationReducer = (classifications, action) => {
    switch (action.type) {
        case "SET_CLASSIFICATIONS":
            return action.classifications;
        case 'DELETE_CLASSIFICATION':
            return classifications.filter(classification => classification._id !== action.payload._id);
        default:
            return classifications;
    }
}

export default classificationReducer;