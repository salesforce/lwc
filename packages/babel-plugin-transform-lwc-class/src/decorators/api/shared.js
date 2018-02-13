const { LWC_PACKAGE_EXPORTS: { API_DECORATOR } } = require('../../constants');

function isApiDecorator(decorator) {
    return decorator.name === API_DECORATOR;
}

module.exports = {
    isApiDecorator,
}
