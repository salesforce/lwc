/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { assert } from '@lwc/shared';

let signalIdentity: symbol | undefined;

export function setSignalIdentity(identity: symbol) {
    assert.isFalse(signalIdentity, 'signalIdentity is already set');

    signalIdentity = identity;
}

export function getSignalIdentity(): symbol | undefined {
    return signalIdentity;
}
