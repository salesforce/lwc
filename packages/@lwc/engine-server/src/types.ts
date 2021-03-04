/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

export enum HostNodeType {
    Text = 'text',
    Comment = 'comment',
    Element = 'element',
    ShadowRoot = 'shadow-root',
}

export interface HostText {
    type: HostNodeType.Text;
    parent: HostElement | null;
    value: string;
}

export interface HostComment {
    type: HostNodeType.Comment;
    parent: HostElement | null;
    value: string;
}

export interface HostAttribute {
    name: string;
    namespace: string | null;
    value: string;
}

export interface HostShadowRoot {
    type: HostNodeType.ShadowRoot;
    children: HostChildNode[];
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
}

export interface HostElement {
    type: HostNodeType.Element;
    name: string;
    parent: HostElement | null;
    shadowRoot: HostShadowRoot | null;
    namespace?: string;
    children: HostChildNode[];
    attributes: HostAttribute[];
    eventListeners: Record<string, Function[]>;
}

export type HostNode = HostText | HostElement | HostComment;
export type HostChildNode = HostElement | HostText | HostComment;
