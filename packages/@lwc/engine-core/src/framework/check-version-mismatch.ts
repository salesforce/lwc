/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isNull, LWC_VERSION, LWC_VERSION_COMMENT_REGEX } from '@lwc/shared';

import { logError } from '../shared/logger';

import { report, ReportingEventId } from './reporting';
import type { Template } from './template';
import type { LightningElementConstructor } from './base-lightning-element';
import type { Stylesheet } from '@lwc/shared';

let warned = false;

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    (window as any).__lwcResetWarnedOnVersionMismatch = () => {
        warned = false;
    };
}

/**
 * Validate a template, stylesheet, or component to make sure that its compiled version matches
 * the version used by the LWC engine at runtime. Note that this only works in dev mode because
 * it relies on code comments, which are stripped in production due to minification.
 * @param func
 * @param type
 */
export function checkVersionMismatch(func: Template, type: 'template'): void;
export function checkVersionMismatch(func: Stylesheet, type: 'stylesheet'): void;
export function checkVersionMismatch(func: LightningElementConstructor, type: 'component'): void;
export function checkVersionMismatch(
    func: Template | Stylesheet | LightningElementConstructor,
    type: 'template' | 'stylesheet' | 'component'
) {
    const versionMatcher = func.toString().match(LWC_VERSION_COMMENT_REGEX);
    if (!isNull(versionMatcher) && !warned) {
        if (
            typeof process === 'object' &&
            typeof process?.env === 'object' &&
            process.env &&
            process.env.SKIP_LWC_VERSION_MISMATCH_CHECK === 'true'
        ) {
            warned = true; // skip printing out version mismatch errors when env var is set
            return;
        }

        const version = versionMatcher[1];
        if (version !== LWC_VERSION) {
            warned = true; // only warn once to avoid flooding the console
            // stylesheets and templates do not have user-meaningful names, but components do
            const friendlyName = type === 'component' ? `${type} ${func.name}` : type;
            logError(
                `LWC WARNING: current engine is v${LWC_VERSION}, but ${friendlyName} was compiled with v${version}.\nPlease update your compiled code or LWC engine so that the versions match.\nNo further warnings will appear.`
            );
            report(ReportingEventId.CompilerRuntimeVersionMismatch, {
                compilerVersion: version,
                runtimeVersion: LWC_VERSION,
            });
        }
    }
}
