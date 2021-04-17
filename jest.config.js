module.exports = {
    clearMocks: true,

    collectCoverage: true,
    collectCoverageFrom: [
        '<rootDir>/src/**/*.js'
    ],
    coverageDirectory: '<rootDir>/test/coverage',
    coveragePathIgnorePatterns: [
        '/node_modules/'
    ],

    testEnvironment: 'node'
}
