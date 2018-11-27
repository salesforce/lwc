const validate = require('./validate');
const transform = require('./transform');
const { LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR } } = require('../../constants');

module.exports = {
    name: WIRE_DECORATOR,
    validate,
    transform,
}
