/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { noop } from '@lwc/shared';

import { ShadowMode } from './vm';

export const enum ReportingEventId {
    CrossRootAriaInSyntheticShadow = 'CrossRootAriaInSyntheticShadow',
    CompilerRuntimeVersionMismatch = 'CompilerRuntimeVersionMismatch',
    NonStandardAriaReflection = 'NonStandardAriaReflection',
    TemplateMutation = 'TemplateMutation',
    StylesheetMutation = 'StylesheetMutation',
    ConnectedCallbackWhileDisconnected = 'ConnectedCallbackWhileDisconnected',
    ShadowModeUsage = 'ShadowModeUsage',
}

export interface BasePayload {
    tagName?: string;
}

export interface CrossRootAriaInSyntheticShadowPayload extends BasePayload {
    attributeName: string;
}

export interface CompilerRuntimeVersionMismatchPayload extends BasePayload {
    compilerVersion: string;
    runtimeVersion: string;
}

export interface NonStandardAriaReflectionPayload extends BasePayload {
    propertyName: string;
    isSetter: boolean;
    setValueType: string | undefined;
}

export interface TemplateMutationPayload extends BasePayload {
    propertyName: string;
}

export interface StylesheetMutationPayload extends BasePayload {
    propertyName: string;
}

export interface ConnectedCallbackWhileDisconnectedPayload extends BasePayload {}

export interface ShadowModeUsagePayload extends BasePayload {
    mode: ShadowMode;
}

export type ReportingPayloadMapping = {
    [ReportingEventId.CrossRootAriaInSyntheticShadow]: CrossRootAriaInSyntheticShadowPayload;
    [ReportingEventId.CompilerRuntimeVersionMismatch]: CompilerRuntimeVersionMismatchPayload;
    [ReportingEventId.NonStandardAriaReflection]: NonStandardAriaReflectionPayload;
    [ReportingEventId.TemplateMutation]: TemplateMutationPayload;
    [ReportingEventId.StylesheetMutation]: StylesheetMutationPayload;
    [ReportingEventId.ConnectedCallbackWhileDisconnected]: ConnectedCallbackWhileDisconnectedPayload;
    [ReportingEventId.ShadowModeUsage]: ShadowModeUsagePayload;
};

export type ReportingDispatcher<T extends ReportingEventId = ReportingEventId> = (
    reportingEventId: T,
    payload: ReportingPayloadMapping[T]
) => void;

/** Callbacks to invoke when reporting is enabled **/
type OnReportingEnabledCallback = () => void;
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
        onReportingEnabledCallbacks.push(callback);
    }
}

/**
 * Report to the current dispatcher, if there is one.
 * @param reportingEventId
 * @param payload - data to report
 */
export function report<T extends ReportingEventId>(
    reportingEventId: T,
    payload: ReportingPayloadMapping[T]
) {
    if (enabled) {
        currentDispatcher(reportingEventId, payload);
    }
}

/**
 * Return true if reporting is enabled
 */
export function isReportingEnabled() {
    return enabled;
}
