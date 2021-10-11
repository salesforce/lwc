/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { assert, isUndefined } from '@lwc/shared';
import { setSanitizeHtmlContentHook, SanitizeHtmlContentHook } from './api';

export enum OverridableHooks {
    SanitizeHtmlContent = 'sanitizeHtmlContent',
}

interface OverridableHooksDef {
    [OverridableHooks.SanitizeHtmlContent]: SanitizeHtmlContentHook;
}

let hooksAreSet = false;

function overrideHooks(hooks: Partial<OverridableHooksDef>): Partial<OverridableHooksDef> {
    const oldHooks: Partial<OverridableHooksDef> = {};

    if (!isUndefined(hooks[OverridableHooks.SanitizeHtmlContent])) {
        oldHooks[OverridableHooks.SanitizeHtmlContent] = setSanitizeHtmlContentHook(
            hooks[OverridableHooks.SanitizeHtmlContent]!
        );
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
