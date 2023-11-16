/*
 * Copyright (c) 2020, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */

import { WireContextSubscriptionCallback } from '@lwc/engine-core';

// We use Symbols as the keys for HostElement properties to avoid conflicting
// with public component properties defined by a component author.
export const HostNamespaceKey = Symbol('namespace');
export const HostTypeKey = Symbol('type');
export const HostParentKey = Symbol('parent');
export const HostShadowRootKey = Symbol('shadow-root');
export const HostChildrenKey = Symbol('children');
export const HostAttributesKey = Symbol('attributes');
export const HostValueKey = Symbol('value');
export const HostHostKey = Symbol('host');
export const HostContextProvidersKey = Symbol('context-providers');

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
    [HostValueKey]: string;
}

export interface HostComment {
    [HostTypeKey]: HostNodeType.Comment;
    [HostParentKey]: HostElement | null;
    [HostValueKey]: string;
}

export interface HostRaw {
    [HostTypeKey]: HostNodeType.Raw;
    [HostParentKey]: HostElement | null;
    [HostValueKey]: string;
}

export interface HostAttribute {
    name: string;
    [HostNamespaceKey]: string | null;
    value: string;
}

// During SSR, a `HostElement` object is the equivalent of an `Element` object in
// the DOM. `HostElement[HostParentKey]` can be thought of as `Element.prototype.parentNode`,
// which can be either another element or a shadow root.
export type HostParentNode = HostElement | HostShadowRoot;

export interface HostShadowRoot {
    [HostTypeKey]: HostNodeType.ShadowRoot;
    [HostChildrenKey]: HostChildNode[];
    mode: 'open' | 'closed';
    delegatesFocus: boolean;
    [HostHostKey]: HostElement;
}

export interface HostElement {
    [HostTypeKey]: HostNodeType.Element;
    // tagName cannot be used as a public component property as it is
    // explicitly given only a getter, so it doesn't need to be a Symbol.
    tagName: string;
    [HostNamespaceKey]: string;
    [HostParentKey]: HostParentNode | null;
    [HostShadowRootKey]: HostShadowRoot | null;
    [HostChildrenKey]: HostChildNode[];
    [HostAttributesKey]: HostAttribute[];
    [HostContextProvidersKey]: Map<string, WireContextSubscriptionCallback>;
}

export type HostNode = HostText | HostElement | HostComment;
export type HostChildNode = HostNode | HostRaw;
