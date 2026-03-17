/*
 * Copyright (c) 2026, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

/**
 * Mosaic Intermediate Representation (MIR) and JSON serialization types
 */
type JSONPrimitive = string | number | boolean | null | undefined;
type JSONValue = JSONPrimitive | JSONObject | JSONArray;
type JSONObject = { [key: string]: JSONValue };
type JSONArray = JSONValue[];

export interface MIRAction extends JSONObject {
    name: string;
    params?: JSONObject;
}
export interface MIRAttributes {
    action?: MIRAction;
    [key: string]: JSONValue;
}
export interface MIR {
    definition: string;
    children?: MIRNode[];
}
export interface MIRNode extends MIR {
    attributes?: MIRAttributes;
}

/**
 * Mosaic class definition and types
 */
type TargetHint = 'modal' | 'panel' | 'toast' | 'pip'; // Surface hint for push transitions
export interface MosaicActionParams {
    action: {
        value?: Record<string, JSONValue>; // data for the action handler
    };
    client: {
        views: {
            // componentRef is a Mosaic specifier, default: the current Mosaic
            update(args: { componentRef?: string; props?: Record<string, JSONValue> }): void;
            push(args: {
                componentRef: string;
                props?: Record<string, JSONValue>;
                target?: TargetHint;
            }): void;
            // error(err: { message: string; }): void; // use an explicit error type or just throw an error?
        };
    };
}
export type MosaicAction = (params: MosaicActionParams) => void;
export abstract class Mosaic {
    abstract render(): MIR;
}
