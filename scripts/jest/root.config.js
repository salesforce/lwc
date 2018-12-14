module.exports = {
    rootDir: '../..',

    testMatch: [
        '<rootDir>/**/__tests__/*.spec.(js|ts)'
    ],

    projects: [
        '<rootDir>/packages/@lwc/errors',
        '<rootDir>/packages/@lwc/babel-plugin-component',
        '<rootDir>/packages/@lwc/compiler',
        '<rootDir>/packages/@lwc/engine',
        '<rootDir>/packages/@lwc/jest-preset',
        '<rootDir>/packages/@lwc/jest-resolver',
        '<rootDir>/packages/@lwc/jest-serializer',
        '<rootDir>/packages/@lwc/jest-transformer',
        '<rootDir>/packages/@lwc/module-resolver',
        '<rootDir>/packages/@lwc/template-compiler',
        '<rootDir>/packages/@lwc/style-compiler',
        '<rootDir>/packages/@lwc/wire-service',
        '<rootDir>/packages/@lwc/rollup-plugin',
        '<rootDir>/packages/lwc-tslint-rules',
    ],
};
