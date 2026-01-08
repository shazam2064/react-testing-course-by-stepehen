const {initialTweetsData} = require("../data/initial-data");

export const getInitialTweetState = () => {
    return initialTweetsData
}

const tweetsReducer = (tweets, action) => {
    switch (action.type) {
        case "SET_TWEETS":
            return action.tweets;
        case 'DELETE_TWEET':
            return tweets.filter(tweet => tweet._id !== action.payload._id);
        default:
            return tweets;
    }
}

export default tweetsReducer;