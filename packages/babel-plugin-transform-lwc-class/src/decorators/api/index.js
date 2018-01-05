const validate = require('./validate');
const transform = require('./transform');
const { RAPTOR_PACKAGE_EXPORTS: { API_DECORATOR } } = require('../../constants');

module.exports = {
    name: API_DECORATOR,
    validate,
    transform,
};
