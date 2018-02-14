module.exports = {
    testRegex: "\\.spec\\.(js|ts)$",
    transform: {
        "^.+\\.js$": "babel-jest",
        "^.+\\.ts$": "ts-jest"
    },
    moduleFileExtensions: ["ts", "js", "json", "node"],
};

