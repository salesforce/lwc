const { LWC_PACKAGE_EXPORTS: { WIRE_DECORATOR } } = require('../../constants');

function isWireDecorator(decorator) {
    return decorator.name === WIRE_DECORATOR;
}

module.exports = {
    isWireDecorator,
}
