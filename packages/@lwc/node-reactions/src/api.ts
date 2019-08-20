/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ReactionCallback } from './types';
import { isUndefined } from './shared/language';
import assert from './shared/assert';
import { reactWhenConnected, reactWhenDisconnected } from './global/init';

/**
 * Redirecting after dev mode assertion.
 * In prod mode, the browser should be able to optimize this
 */

function reactWhenConnectedRedirect(elm: Element, callback: ReactionCallback): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(elm), 'Missing required node param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
        assert.invariant(elm instanceof Element, 'Expected to only register Elements');
    }

    reactWhenConnected(elm, callback);
}

function reactWhenDisconnectedRedirect(elm: Element, callback: ReactionCallback): void {
    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(!isUndefined(elm), 'Missing required node param');
        assert.invariant(!isUndefined(callback), 'Missing callback');
        assert.invariant(elm instanceof Element, 'Expected to only register Elements');
    }

    reactWhenDisconnected(elm, callback);
}

export {
    reactWhenConnectedRedirect as reactWhenConnected,
    reactWhenDisconnectedRedirect as reactWhenDisconnected,
};
