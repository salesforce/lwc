/*
 * Copyright (c) 2024, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

let signalIdentity: symbol | undefined;

export function setSignalIdentity(identity: symbol) {
    signalIdentity = identity;
}

export function getSignalIdentity(): symbol | undefined {
    return signalIdentity;
}
