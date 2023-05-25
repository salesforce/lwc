/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { LWC_COMPONENT_PROPERTIES, LWC_PACKAGE_EXPORTS } from '../../constants';
import { generateError } from '../../utils';
import { BabelTypes, LwcBabelPluginPass } from '../../types';
import { DecoratorMeta } from '../index';

const { TRACK_DECORATOR } = LWC_PACKAGE_EXPORTS;

const TRACK_PROPERTY_VALUE = 1;

function isTrackDecorator(decorator: DecoratorMeta) {
    return decorator.name === TRACK_DECORATOR;
}

function validate(decorators: DecoratorMeta[], state: LwcBabelPluginPass) {
    decorators.filter(isTrackDecorator).forEach(({ path }) => {
        if (!path.parentPath.isClassProperty()) {
            throw generateError(
                path,
                {
                    errorInfo: DecoratorErrors.TRACK_ONLY_ALLOWED_ON_CLASS_PROPERTIES,
                },
                state
            );
        }
    });
}

function transform(t: BabelTypes, decoratorMetas: DecoratorMeta[]) {
    const objectProperties = [];
    const trackDecoratorMetas = decoratorMetas.filter(isTrackDecorator);
    if (trackDecoratorMetas.length) {
        const config = trackDecoratorMetas.reduce((acc, meta) => {
            acc[meta.propertyName] = TRACK_PROPERTY_VALUE;
            return acc;
        }, {} as { [key: string]: number });
        objectProperties.push(
            t.objectProperty(t.identifier(LWC_COMPONENT_PROPERTIES.TRACK), t.valueToNode(config))
        );
    }
    return objectProperties;
}

export default {
    name: TRACK_DECORATOR,
    transform,
    validate,
};
