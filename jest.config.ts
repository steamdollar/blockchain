import type { Config } from '@jest/types'
const config: Config.InitialOptions = {
    moduleFileExtensions: ['ts', 'js'],
    testMatch: ['<rootDir>/**/*.test.(js|ts)'],
    moduleNameMapper: {
        '^@core/(.*)$': '<rootDir>/src/core/$1',
    },
    testEnvironment: 'node',
    verbose: true,
    preset: 'ts-jest',
}

export default config