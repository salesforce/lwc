/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isUndefined } from '@lwc/shared';

import { VM } from '../framework/vm';
import { getComponentStack } from './format';

export function logError(message: string, vm?: VM) {
    let msg = `[LWC error]: ${message}`;

    if (!isUndefined(vm)) {
        msg = `${msg}\n${getComponentStack(vm)}`;
    }

    if (process.env.NODE_ENV === 'test') {
        /* eslint-disable-next-line no-console */
        console.error(msg);
        return;
    }

    try {
        throw new Error(msg);
    } catch (e) {
        /* eslint-disable-next-line no-console */
        console.error(e);
    }
}
