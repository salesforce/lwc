/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
export const HostTypeAttr = Symbol();

export enum HostNodeType {
    Text = 'text',
    Comment = 'comment',
    Raw = 'raw',
    Element = 'element',
    ShadowRoot = 'shadow-root',
}

export interface HostText {
    [HostTypeAttr]: HostNodeType.Text;
    parent: HostElement | null;
    value: string;
}

export interface HostComment {
    [HostTypeAttr]: HostNodeType.Comment;
    parent: HostElement | null;
    value: string;
}

export interface HostRaw {
    [HostTypeAttr]: HostNodeType.Raw;
    parent: HostElement | null;
    value: string;
}

export interface HostAttribute {
    name: string;
    namespace: string | null;
    value: string;
}

export interface HostShadowRoot {
    [HostTypeAttr]: HostNodeType.ShadowRoot;
    children: HostChildNode[];
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
}

export interface HostElement {
    [HostTypeAttr]: HostNodeType.Element;
    tagName: string;
    namespace: string;
    parent: HostElement | null;
    shadowRoot: HostShadowRoot | null;
    children: HostChildNode[];
    attributes: HostAttribute[];
    eventListeners: Record<string, Function[]>;
}

export type HostNode = HostText | HostElement | HostComment;
export type HostChildNode = HostElement | HostText | HostComment | HostRaw;
