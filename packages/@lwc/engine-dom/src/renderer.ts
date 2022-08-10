/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { htmlPropertyToAttribute, globalThis } from '@lwc/shared';
import { insertStylesheet } from './styles';
import { createFragment } from './createFragment';

import { rendererFactory } from './renderer-factory';

export const renderer = rendererFactory(
    createFragment,
    globalThis,
    insertStylesheet,
    htmlPropertyToAttribute
);
