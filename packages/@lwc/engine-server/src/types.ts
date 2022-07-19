/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export const HostNamespaceKey = Symbol();
export const HostTypeKey = Symbol();
export const HostParentKey = Symbol();
export const HostEventListenersKey = Symbol();

export enum HostNodeType {
    Text = 'text',
    Comment = 'comment',
    Raw = 'raw',
    Element = 'element',
    ShadowRoot = 'shadow-root',
}

export interface HostText {
    [HostTypeKey]: HostNodeType.Text;
    [HostParentKey]: HostElement | null;
    value: string;
}

export interface HostComment {
    [HostTypeKey]: HostNodeType.Comment;
    [HostParentKey]: HostElement | null;
    value: string;
}

export interface HostRaw {
    [HostTypeKey]: HostNodeType.Raw;
    [HostParentKey]: HostElement | null;
    value: string;
}

export interface HostAttribute {
    name: string;
    [HostNamespaceKey]: string | null;
    value: string;
}

export interface HostShadowRoot {
    [HostTypeKey]: HostNodeType.ShadowRoot;
    children: HostChildNode[];
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
}

export interface HostElement {
    [HostTypeKey]: HostNodeType.Element;
    tagName: string;
    [HostNamespaceKey]: string;
    [HostParentKey]: HostElement | null;
    shadowRoot: HostShadowRoot | null;
    children: HostChildNode[];
    attributes: HostAttribute[];
    [HostEventListenersKey]: Record<string, Function[]>;
}

export type HostNode = HostText | HostElement | HostComment;
export type HostChildNode = HostElement | HostText | HostComment | HostRaw;
