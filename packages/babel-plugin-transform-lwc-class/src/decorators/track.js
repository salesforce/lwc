const { staticClassProperty } = require('../utils');

const TRACK_DECORATOR = 'track';
const TRACK_CLASS_PROPERTY = 'track';
const TRACK_PROPERTY_VALUE = 1;

module.exports = function apiVisitor({ types: t }) {
    const decoratorVisitor = {
        Decorator(path, { trackFields }) {
            const isTrackDecorator = path.get('expression').isIdentifier({
                name: TRACK_DECORATOR
            });

            if (isTrackDecorator) {
                path.remove();

                const { parentPath } = path;

                if (parentPath.isClassMethod()) {
                    throw parentPath.buildCodeFrameError(
                        `@track decorator can only be applied to class properties.`
                    );
                } else {
                    trackFields.push(parentPath);
                }
            }
        }
    };

    return {
        Class(path) {
            const classBody = path.get('body');

            const trackFields = [];
            path.traverse(decoratorVisitor, {
                trackFields
            });

            if (trackFields.length) {
                const trackConfig = {};

                for (let field of trackFields) {
                    const fieldName = field.get('key.name').node;
                    trackConfig[fieldName] = TRACK_PROPERTY_VALUE;
                }

                classBody.pushContainer(
                    'body',
                    staticClassProperty(
                        t,
                        TRACK_CLASS_PROPERTY,
                        t.valueToNode(trackConfig)
                    )
                );
            }
        }
    };
};
