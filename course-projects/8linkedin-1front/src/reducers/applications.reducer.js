const {initialApplicationsData} = require("../data/initial-data");

export const getInitialApplicationsState = () => {
    return initialApplicationsData;
}

const applicationsReducer = (applications, action) => {
    switch (action.type) {
        case "SET_APPLICATIONS":
            return action.applications;
        case "DELETE_APPLICATION":
            if (!Array.isArray(applications)) {
                console.error("State is not an array:", applications);
                return applications;
            }
            return applications.filter(application => application._id !== action.payload._id);
        default:
            return applications;
    }
}

export default applicationsReducer;