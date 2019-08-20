/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from './types';
import { isUndefined } from './shared/language';
import assert from './shared/assert';
import { reactToConnectionCached, reactToDisconnectionCached } from './global/init';

export function reactToConnection(elm: Element, callback: ReactionCallback): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(elm), 'Missing required node param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
        assert.invariant(elm instanceof Element, 'Expected to only register Elements');
    }

    reactToConnectionCached(elm, callback);
}

export function reactToDisconnection(elm: Element, callback: ReactionCallback): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(elm), 'Missing required node param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
        assert.invariant(elm instanceof Element, 'Expected to only register Elements');
    }

    reactToDisconnectionCached(elm, callback);
}
