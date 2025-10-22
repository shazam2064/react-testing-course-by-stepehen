import {initialQuestionsData} from "../data/initial-data";

export const getInitialQuestionState = () => {
    return initialQuestionsData
};

const questionReducer = (questions, action) => {
    switch (action.type) {
        case "SET_QUESTIONS":
            return action.questions;
        case 'DELETE_QUESTION':
            return questions.filter(question => question._id !== action.payload._id);
        default:
            return questions;
    }
}

export default questionReducer;