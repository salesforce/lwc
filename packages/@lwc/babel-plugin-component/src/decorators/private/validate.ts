/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { DecoratorErrors } from '@lwc/errors';
import { generateError } from '../../utils';
import type { LwcBabelPluginPass } from '../../types';
import type { DecoratorMeta } from '../index';

function isPrivateDecorator(decorator: DecoratorMeta) {
    return decorator.name === 'privateField';
}

function validate(decorators: DecoratorMeta[], state: LwcBabelPluginPass) {
    decorators.filter(isPrivateDecorator).forEach(({ path, decoratedNodeType }) => {
        // @privateField can only be used on class properties and methods
        if (decoratedNodeType !== 'property' && decoratedNodeType !== 'method') {
            throw generateError(
                path,
                {
                    errorInfo: DecoratorErrors.INVALID_DECORATOR,
                    messageArgs: ['@privateField', 'class properties and methods'],
                },
                state
            );
        }
    });
}

export default validate;
