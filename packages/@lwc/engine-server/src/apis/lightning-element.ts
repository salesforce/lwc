/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { freeze, seal } from '@lwc/shared';
import { LightningElement, BaseLightningElement, MacroElement } from '@lwc/engine-core';

freeze(BaseLightningElement);
seal(BaseLightningElement.prototype);

freeze(LightningElement);
seal(LightningElement.prototype);

freeze(MacroElement);
seal(MacroElement.prototype);

export { BaseLightningElement, LightningElement, MacroElement };
