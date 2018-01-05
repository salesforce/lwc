const { staticClassProperty } = require('../../utils');
const { RAPTOR_PACKAGE_EXPORTS: { TRACK_DECORATOR }, RAPTOR_COMPONENT_PROPERTIES } = require('../../constants');

const TRACK_PROPERTY_VALUE = 1;

function isTrackDecorator(decorator) {
    return decorator.type === TRACK_DECORATOR;
}

function validate(klass, decorators) {
    decorators.filter(isTrackDecorator).forEach(({ path }) => {
        if (!path.parentPath.isClassProperty()) {
            throw path.buildCodeFrameError(`@track decorator can only be applied to class properties.`);
        }
    });
}

function transform(t, klass, decorators) {
    const trackDecorators = decorators.filter(isTrackDecorator);

    const trackConfig = trackDecorators.map(({ path }) => (
        // Get tracked field names
        path.parentPath.get('key.name').node
    )).reduce((acc, fieldName) => {
        // Transform list of fiels to an object
        acc[fieldName] = TRACK_PROPERTY_VALUE;
        return acc;
    }, {});

    // Add metadata to class body
    if (trackDecorators.length) {
        klass.get('body').pushContainer(
            'body',
            staticClassProperty(
                t,
                RAPTOR_COMPONENT_PROPERTIES.TRACK,
                t.valueToNode(trackConfig)
            )
        );
    }
}

module.exports = {
    name: TRACK_DECORATOR,
    transform,
    validate
}
