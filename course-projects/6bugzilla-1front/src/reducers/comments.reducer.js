import {commentsInitialData} from "../data/initial-data";

export const getInitialCommentsState = () => {
    return commentsInitialData;
}

const commentsReducer = (comments, action) => {
    switch (action.type) {
        case "SET_COMMENTS":
            return action.comments;
        case 'DELETE_COMMENT':
            return comments.filter(comment => comment._id !== action.payload._id);
        default:
            return comments;
    }
}

export default commentsReducer;