/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayPush, noop } from '@lwc/shared';
import { VM } from './vm';

export const enum ReportingEventId {
    CrossRootAriaInSyntheticShadow = 0,
    CompilerRuntimeVersionMismatch = 1,
    NonStandardAriaReflection = 2,
    TemplateMutation = 3,
    StylesheetMutation = 4,
}

type ReportingDispatcher = (
    reportingEventId: ReportingEventId,
    tagName?: string,
    vmIndex?: number
) => void;

type OnReportingEnabledCallback = () => void;

/** Callbacks to invoke when reporting is enabled **/
const onReportingEnabledCallbacks: OnReportingEnabledCallback[] = [];

/** The currently assigned reporting dispatcher. */
let currentDispatcher: ReportingDispatcher = noop;

/**
 * Whether reporting is enabled.
 *
 * Note that this may seem redundant, given you can just check if the currentDispatcher is undefined,
 * but it turns out that Terser only strips out unused code if we use this explicit boolean.
 */
let enabled = false;

export const reportingControl = {
    /**
     * Attach a new reporting control (aka dispatcher).
     *
     * @param dispatcher - reporting control
     */
    attachDispatcher(dispatcher: ReportingDispatcher): void {
        enabled = true;
        currentDispatcher = dispatcher;
        for (const callback of onReportingEnabledCallbacks) {
            try {
                callback();
            } catch (err) {
                // This should never happen. But if it does, we don't want one callback to cause another to fail
                // eslint-disable-next-line no-console
                console.error('Could not invoke callback', err);
            }
        }
        onReportingEnabledCallbacks.length = 0; // clear the array
    },

    /**
     * Detach the current reporting control (aka dispatcher).
     */
    detachDispatcher(): void {
        enabled = false;
        currentDispatcher = noop;
    },
};

/**
 * Call a callback when reporting is enabled, or immediately if reporting is already enabled.
 * Will only ever be called once.
 * @param callback
 */
export function onReportingEnabled(callback: OnReportingEnabledCallback) {
    if (enabled) {
        // call immediately
        callback();
    } else {
        // call later
        ArrayPush.call(onReportingEnabledCallbacks, callback);
    }
}

/**
 * Report to the current dispatcher, if there is one.
 * @param reportingEventId
 * @param vm
 */
export function report(reportingEventId: ReportingEventId, vm?: VM) {
    if (enabled) {
        currentDispatcher(reportingEventId, vm?.tagName, vm?.idx);
    }
}
