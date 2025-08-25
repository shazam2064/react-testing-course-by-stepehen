export default {
    testEnvironment: "jsdom",
    transform: {
        "^.+\\.[tj]sx?$": "babel-jest",   // handle JS/JSX
    },
    transformIgnorePatterns: [
        "node_modules/(?!(axios|msw|@bundled-es-modules)/)", // 👈 allow axios & msw ESM builds
    ],
    moduleFileExtensions: ["js", "jsx"],
    setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
};
