const {initialJobsData} = require('../data/initial-data');

export const getInitialJobsState = () => {
    return initialJobsData;
}

const jobsReducer = (jobs, action) => {
    switch (action.type) {
        case "SET_JOBS":
            return action.jobs;
        case 'DELETE_JOB':
            return jobs.filter(job => job._id !== action.payload._id);
        default:
            return jobs;
    }
}

export default jobsReducer;