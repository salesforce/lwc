const { RAPTOR_PACKAGE_EXPORTS: { API_DECORATOR } } = require('../../constants');

function isApiDecorator(decorator) {
    return decorator.type === API_DECORATOR;
}

module.exports = {
    isApiDecorator,
}
