/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, isUndefined, LWC_VERSION } from '@lwc/shared';
import { Template } from './template';
import { getComponentTag } from '../shared/format';
import { VM } from './vm';
import { StylesheetFactory } from './stylesheet';
import { LightningElementConstructor } from './base-lightning-element';

let warned = false;

if (process.env.NODE_ENV === 'development') {
    // @ts-ignore
    window.__lwcResetWarnedOnVersionMismatch = () => {
        warned = false;
    };
}

/**
 * Validate a template, stylesheet, or component to make sure that its compiled version matches
 * the version used by the LWC engine at runtime.
 */
export function checkVersionMismatch(
    func: Template | StylesheetFactory | LightningElementConstructor,
    vm?: VM
) {
    const versionMatcher = func.toString().match(/\/\*LWC compiler v([\d.]+)\*\//);
    if (!isNull(versionMatcher) && !warned) {
        const version = versionMatcher[1];
        const [major, minor] = version.split('.');
        const [expectedMajor, expectedMinor] = LWC_VERSION.split('.');
        if (major !== expectedMajor || minor !== expectedMinor) {
            warned = true; // only warn once to avoid flooding the console
            // eslint-disable-next-line no-console
            console.error(
                `LWC WARNING: current engine is v${LWC_VERSION}, but ${
                    isUndefined(vm) ? func.name : getComponentTag(vm)
                } was compiled with v${version}.\nPlease update your compiled code or LWC engine so that the versions match.\nNo further warnings will appear.`
            );
        }
    }
}
