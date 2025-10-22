import React from 'react';
import ListQuestions from './0commons/ListQuestions';

function Home(props) {

    return (
        <div >
            <ListQuestions homePage={true}/>
        </div>
    );
}

export default Home;