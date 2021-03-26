/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { DecoratorErrors } = require('@lwc/errors');
const {
    LWC_COMPONENT_PROPERTIES,
    LWC_PACKAGE_EXPORTS: { TRACK_DECORATOR },
} = require('../../constants');
const { generateError } = require('../../utils');

const TRACK_PROPERTY_VALUE = 1;

function isTrackDecorator(decorator) {
    return decorator.name === TRACK_DECORATOR;
}

function validate(decorators) {
    decorators.filter(isTrackDecorator).forEach(({ path }) => {
        if (!path.parentPath.isClassProperty()) {
            throw generateError(path, {
                errorInfo: DecoratorErrors.TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES,
            });
        }
    });
}

function transform(t, decoratorMetas) {
    const objectProperties = [];
    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const config = trackDecoratorMetas.reduce((acc, meta) => {
            acc[meta.propertyName] = TRACK_PROPERTY_VALUE;
            return acc;
        }, {});
        objectProperties.push(
            t.objectProperty(t.identifier(LWC_COMPONENT_PROPERTIES.TRACK), t.valueToNode(config))
        );
    }
    return objectProperties;
}

module.exports = {
    name: TRACK_DECORATOR,
    transform,
    validate,
};
