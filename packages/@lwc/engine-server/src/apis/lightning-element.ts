/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { freeze, seal } from '@lwc/shared';
import { LightningElement } from '@lwc/engine-core';

freeze(LightningElement);
seal(LightningElement.prototype);

export { LightningElement };
