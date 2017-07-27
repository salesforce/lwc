const classProperty = require('babel-plugin-transform-class-properties');

module.exports = function({ types }) {
    return classProperty({ types }).visitor;
}
