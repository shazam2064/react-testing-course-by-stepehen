import React from 'react';
import ListTweets from "./0commons/ListTweets";

function Home(props) {

    return (
        <div >
            <ListTweets homePage={true}/>
        </div>
    );
}

export default Home;