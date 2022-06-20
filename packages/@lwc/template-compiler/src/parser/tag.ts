/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { BaseElement } from '../shared/types';
import { TAGS_THAT_CANNOT_BE_PARSED_AS_TOP_LEVEL } from './constants';

export function isUnsafeTopLevelSerializableElement(element: BaseElement) {
    return TAGS_THAT_CANNOT_BE_PARSED_AS_TOP_LEVEL.has(element.name);
}
