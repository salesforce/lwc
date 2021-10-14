/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined } from '@lwc/shared';
import { setSanitizeHtmlContentHook, SanitizeHtmlContentHook } from './api-helpers';

interface OverridableHooksDef {
    sanitizeHtmlContent: SanitizeHtmlContentHook;
}

let hooksAreSet = false;

function overrideHooks(hooks: Partial<OverridableHooksDef>): Partial<OverridableHooksDef> {
    const oldHooks: Partial<OverridableHooksDef> = {};

    if (!isUndefined(hooks.sanitizeHtmlContent)) {
        oldHooks.sanitizeHtmlContent = setSanitizeHtmlContentHook(hooks.sanitizeHtmlContent);
    }

    return oldHooks;
}

export function setHooks(hooks: OverridableHooksDef) {
    assert.isFalse(hooksAreSet, 'Hooks are already overridden, only one definition is allowed.');

    overrideHooks(hooks);

    hooksAreSet = true;
}

export function setHooksForTest(hooks: Partial<OverridableHooksDef>) {
    if (process.env.NODE_ENV !== 'production') {
        return overrideHooks(hooks);
    }
}
