"use strict";
exports.__esModule = true;
var config = {
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['<rootDir>/**/*.test.(js|ts)'],
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/src/core/$1'
    },
    testEnvironment: 'node',
    verbose: true,
    preset: 'ts-jest'
};
exports["default"] = config;
