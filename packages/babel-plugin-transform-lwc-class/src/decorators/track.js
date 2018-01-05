const { staticClassProperty } = require('../utils');
const { RAPTOR_PACKAGE_EXPORTS } = require('../constants');

const TRACK_CLASS_PROPERTY = 'track';
const TRACK_PROPERTY_VALUE = 1;

// module.exports = function apiVisitor({ types: t }) {
//     const decoratorVisitor = {
//         Decorator(path, { trackFields }) {
//             if (isTrackDecorator(path)) {
//                 path.remove();

//                 const { parentPath } = path;

//                 if (parentPath.isClassMethod()) {
//                     throw parentPath.buildCodeFrameError(
//                         `@track decorator can only be applied to class properties.`
//                     );
//                 } else {
//                     trackFields.push(parentPath);
//                 }
//             }
//         }
//     };

//     return {
//         Class(path) {
//             const classBody = path.get('body');

//             const trackFields = [];
//             path.traverse(decoratorVisitor, {
//                 trackFields
//             });

//             if (trackFields.length) {
//                 const trackConfig = {};

//                 for (let field of trackFields) {
//                     const fieldName = field.get('key.name').node;
//                     trackConfig[fieldName] = TRACK_PROPERTY_VALUE;
//                 }

//                 classBody.pushContainer(
//                     'body',
//                     staticClassProperty(
//                         t,
//                         TRACK_CLASS_PROPERTY,
//                         t.valueToNode(trackConfig)
//                     )
//                 );
//             }
//         }
//     };
// };

function isTrackDecorator(decorator) {
    return decorator.type === RAPTOR_PACKAGE_EXPORTS.TRACK_DECORATOR;
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
                TRACK_CLASS_PROPERTY,
                t.valueToNode(trackConfig)
            )
        );
    }
}

module.exports = {
    transform,
    validate
}
