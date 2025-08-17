module.exports = {
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!axios)/', // Allow Jest to transform Axios
    ],
    testEnvironment: 'jsdom',
};