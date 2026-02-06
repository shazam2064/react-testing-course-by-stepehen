const {initialCommentsData} = require( "../data/initial-data");

export const getInitialCommentsState = () => {
    return initialCommentsData;
}

const commentsReducer = (comments, action) => {
    switch (action.type) {
        case "SET_COMMENTS":
            return action.comments;
        case "DELETE_COMMENT":
            if (!Array.isArray(comments)) {
                console.error("State is not an array:", comments);
                return comments;
            }
            return comments.filter(comment => comment._id !== action.payload._id);
        default:
            return comments;
    }
};

export default commentsReducer;
