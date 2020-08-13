/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
const { DecoratorErrors } = require('@lwc/errors');

const { generateError, staticClassProperty, markAsLWCNode } = require('../../utils');
const {
    LWC_PACKAGE_EXPORTS: { TRACK_DECORATOR },
    LWC_COMPONENT_PROPERTIES,
} = require('../../constants');

const TRACK_PROPERTY_VALUE = 1;

function isTrackDecorator(decorator) {
    return decorator.name === TRACK_DECORATOR;
}

function validate(klass, decorators) {
    decorators.filter(isTrackDecorator).forEach(({ path }) => {
        if (!path.parentPath.isClassProperty()) {
            throw generateError(path, {
                errorInfo: DecoratorErrors.TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES,
            });
        }
    });
}

function transform(t, klass, decorators) {
    const trackDecorators = decorators.filter(isTrackDecorator);
    // Add metadata to class body
    if (trackDecorators.length) {
        const trackProperties = trackDecorators.map(
            ({ path }) =>
                // Get tracked field names
                path.parentPath.get('key.name').node
        );

        const trackConfig = trackProperties.reduce((acc, fieldName) => {
            // Transform list of fields to an object
            acc[fieldName] = TRACK_PROPERTY_VALUE;
            return acc;
        }, {});

        const staticProp = staticClassProperty(
            t,
            LWC_COMPONENT_PROPERTIES.TRACK,
            t.valueToNode(trackConfig)
        );
        markAsLWCNode(staticProp);

        klass.get('body').pushContainer('body', staticProp);
    }
}

module.exports = {
    name: TRACK_DECORATOR,
    transform,
    validate,
};
