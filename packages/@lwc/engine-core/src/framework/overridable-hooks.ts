/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert } from '@lwc/shared';
import { setSanitizeHtmlContentHook, SanitizeHtmlContentHook } from './api';

interface OverridableHooksDef {
    sanitizeHtmlContent: SanitizeHtmlContentHook;
}

let hooksAreSet = false;

export function setHooks(hooks: OverridableHooksDef) {
    assert.isFalse(hooksAreSet, 'Hooks are already overridden, only one definition is allowed.');

    hooksAreSet = true;

    setSanitizeHtmlContentHook(hooks.sanitizeHtmlContent);
}
