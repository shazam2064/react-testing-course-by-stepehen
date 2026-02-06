const {initialConversationsData} = require("../data/initial-data");

export const getInitialConversationsState = () => {
    return initialConversationsData;
}

const conversationsReducer = (conversations, action) => {
    switch (action.type) {
        case "SET_CONVERSATIONS":
            return action.conversations;
        case 'DELETE_CONVERSATION':
            return conversations.filter(conversation => conversation._id !== action.payload._id);
        default:
            return conversations;
    }
}

export default conversationsReducer;