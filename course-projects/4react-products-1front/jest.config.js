module.exports = {
    testEnvironment: 'jsdom',
    transform: {
        '^.+\\.jsx?$': 'babel-jest',
    },
    transformIgnorePatterns: [
        '/node_modules/(?!(axios|msw)/)',
    ],
    moduleNameMapper: {
        '\\.(css|less|scss|sass)$': 'identity-obj-proxy',
    },
    setupFilesAfterEnv: ['<rootDir>/config/jest.setup.js'], // Correct usage of <rootDir>
    testMatch: ['**/?(*.)+(test).[jt]s?(x)'], // Matches files like Login.test.js or Login.test.jsx
};