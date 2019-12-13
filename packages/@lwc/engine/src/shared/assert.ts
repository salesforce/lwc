/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArrayPush, isNull, StringToLowerCase } from '@lwc/shared';

import { VM } from '../framework/vm';

const INDENT_CHAR = '\t';

function getFormattedComponentStack(vm: VM): string {
    const stack: string[] = [];
    let indentation = '';

    let current: VM | null = vm;

    while (!isNull(current)) {
        // TODO: clean this up not to access the elm.tagName getter and rather add some property on
        // on the VM with the name.
        ArrayPush.call(stack, `${indentation}<${StringToLowerCase.call(current.elm.tagName)}>`);

        indentation += INDENT_CHAR;
        current = current.owner;
    }

    return ArrayJoin.call(stack, '\n');
}

export function logError(message: string, vm?: VM) {
    let msg = `[LWC error]: ${message}`;

    if (vm) {
        msg = `${msg}\n${getFormattedComponentStack(vm)}`;
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
