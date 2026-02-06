const {initialConnectionsData} = require("../data/initial-data");

export const getInitialConnectionsState = () => {
    return initialConnectionsData;
}

const connectionsReducer = (connections, action) => {
    switch (action.type) {
        case "SET_CONNECTIONS":
            return action.connections;
        case 'DELETE_CONNECTION':
            return connections.filter(connection => connection._id !== action.payload._id);
        default:
            return connections;
    }
}

export default connectionsReducer;