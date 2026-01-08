import React from 'react';
import ListTweets from "../0commons/ListTweets";

function TweetList(props) {
    return (
        <div>
            <ListTweets homePage={false}/>
        </div>
    );
}

export default TweetList;