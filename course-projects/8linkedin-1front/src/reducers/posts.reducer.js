const {initialPostsData} = require("../data/initial-data");

export const getInitialPostState = () => {
    return initialPostsData
}

const postsReducer = (posts, action) => {
    switch (action.type) {
        case "SET_POSTS":
            return action.posts;
        case 'DELETE_POST':
            return posts.filter(post => post._id !== action.payload._id);
        default:
            return posts;
    }
}

export default postsReducer;