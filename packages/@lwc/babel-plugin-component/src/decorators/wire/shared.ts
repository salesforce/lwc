/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_PACKAGE_EXPORTS } from '../../constants';
import { DecoratorMeta } from '../index';

const { WIRE_DECORATOR } = LWC_PACKAGE_EXPORTS;

function isWireDecorator(decorator: DecoratorMeta) {
    return decorator.name === WIRE_DECORATOR;
}

export { isWireDecorator };
