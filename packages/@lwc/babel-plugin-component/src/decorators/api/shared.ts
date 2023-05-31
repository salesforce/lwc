/*
 * Copyright (c) 2023, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { LWC_PACKAGE_EXPORTS } from '../../constants';
import { DecoratorMeta } from '../index';

const { API_DECORATOR } = LWC_PACKAGE_EXPORTS;

function isApiDecorator(decorator: DecoratorMeta) {
    return decorator.name === API_DECORATOR;
}

export { isApiDecorator };
