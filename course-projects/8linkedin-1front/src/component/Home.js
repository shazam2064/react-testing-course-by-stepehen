import React from 'react';
import ListPosts from "./0commons/ListPosts";

function Home(props) {

    return (
        <div >
            <ListPosts homePage={true}/>
        </div>
    );
}

export default Home;