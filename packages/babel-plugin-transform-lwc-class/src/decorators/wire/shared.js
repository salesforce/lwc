const { RAPTOR_PACKAGE_EXPORTS: { WIRE_DECORATOR } } = require('../../constants');

function isWireDecorator(decorator) {
    return decorator.type === WIRE_DECORATOR;
}

module.exports = {
    isWireDecorator,
}
