/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayMap, ArrayPush, isArray, isNull, isUndefined, KEY__SCOPED_CSS } from '@lwc/shared';

import { logError } from '../shared/logger';

import api from './api';
import { RenderMode, ShadowMode, VM } from './vm';
import { computeHasScopedStyles, hasStyles, Template } from './template';
import { getStyleOrSwappedStyle } from './hot-swaps';
import { VCustomElement, VNode } from './vnodes';
import { checkVersionMismatch } from './check-version-mismatch';
import { getComponentInternalDef } from './def';

/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type StylesheetFactory = (
    stylesheetToken: string | undefined,
    useActualHostSelector: boolean,
    useNativeDirPseudoclass: boolean
) => string;

/**
 * The list of stylesheets associated with a template. Each entry is either a StylesheetFactory or a
 * TemplateStylesheetFactory a given stylesheet depends on other external stylesheets (via the
 * @import CSS declaration).
 */
export type TemplateStylesheetFactories = Array<StylesheetFactory | TemplateStylesheetFactories>;

function makeHostToken(token: string) {
    // Note: if this ever changes, update the `cssScopeTokens` returned by `@lwc/compiler`
    return `${token}-host`;
}

function createInlineStyleVNode(content: string): VNode {
    return api.h(
        'style',
        {
            key: 'style', // special key
            attrs: {
                type: 'text/css',
            },
        },
        [api.t(content)]
    );
}

// TODO [#3733]: remove support for legacy scope tokens
export function updateStylesheetToken(vm: VM, template: Template, legacy: boolean) {
    const {
        elm,
        context,
        renderMode,
        shadowMode,
        renderer: { getClassList, removeAttribute, setAttribute },
    } = vm;
    const { stylesheets: newStylesheets } = template;
    const newStylesheetToken = legacy ? template.legacyStylesheetToken : template.stylesheetToken;
    const { stylesheets: newVmStylesheets } = vm;
    const isSyntheticShadow =
        renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic;
    const { hasScopedStyles } = context;

    let newToken: string | undefined;
    let newHasTokenInClass: boolean | undefined;
    let newHasTokenInAttribute: boolean | undefined;

    // Reset the styling token applied to the host element.
    let oldToken;
    let oldHasTokenInClass;
    let oldHasTokenInAttribute;
    if (legacy) {
        oldToken = context.legacyStylesheetToken;
        oldHasTokenInClass = context.hasLegacyTokenInClass;
        oldHasTokenInAttribute = context.hasLegacyTokenInAttribute;
    } else {
        oldToken = context.stylesheetToken;
        oldHasTokenInClass = context.hasTokenInClass;
        oldHasTokenInAttribute = context.hasTokenInAttribute;
    }
    if (!isUndefined(oldToken)) {
        if (oldHasTokenInClass) {
            getClassList(elm).remove(makeHostToken(oldToken));
        }
        if (oldHasTokenInAttribute) {
            removeAttribute(elm, makeHostToken(oldToken));
        }
    }

    // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets. In the case of light DOM, also ensure there is at least one scoped stylesheet.
    const hasNewStylesheets = hasStyles(newStylesheets);
    const hasNewVmStylesheets = hasStyles(newVmStylesheets);
    if (hasNewStylesheets || hasNewVmStylesheets) {
        newToken = newStylesheetToken;
    }

    // Set the new styling token on the host element
    if (!isUndefined(newToken)) {
        if (hasScopedStyles) {
            getClassList(elm).add(makeHostToken(newToken));
            newHasTokenInClass = true;
        }
        if (isSyntheticShadow) {
            setAttribute(elm, makeHostToken(newToken), '');
            newHasTokenInAttribute = true;
        }
    }

    // Update the styling tokens present on the context object.
    if (legacy) {
        context.legacyStylesheetToken = newToken;
        context.hasLegacyTokenInClass = newHasTokenInClass;
        context.hasLegacyTokenInAttribute = newHasTokenInAttribute;
    } else {
        context.stylesheetToken = newToken;
        context.hasTokenInClass = newHasTokenInClass;
        context.hasTokenInAttribute = newHasTokenInAttribute;
    }
}

function evaluateStylesheetsContent(
    stylesheets: TemplateStylesheetFactories,
    stylesheetToken: string | undefined,
    vm: VM
): string[] {
    const content: string[] = [];

    let root: VM | null | undefined;

    for (let i = 0; i < stylesheets.length; i++) {
        let stylesheet = stylesheets[i];

        if (isArray(stylesheet)) {
            ArrayPush.apply(content, evaluateStylesheetsContent(stylesheet, stylesheetToken, vm));
        } else {
            if (process.env.NODE_ENV !== 'production') {
                // Check for compiler version mismatch in dev mode only
                checkVersionMismatch(stylesheet, 'stylesheet');
                // in dev-mode, we support hot swapping of stylesheet, which means that
                // the component instance might be attempting to use an old version of
                // the stylesheet, while internally, we have a replacement for it.
                stylesheet = getStyleOrSwappedStyle(stylesheet);
            }
            const isScopedCss = (stylesheet as any)[KEY__SCOPED_CSS];

            if (
                lwcRuntimeFlags.DISABLE_LIGHT_DOM_UNSCOPED_CSS &&
                !isScopedCss &&
                vm.renderMode === RenderMode.Light
            ) {
                logError(
                    'Unscoped CSS is not supported in Light DOM in this environment. Please use scoped CSS ' +
                        '(*.scoped.css) instead of unscoped CSS (*.css). See also: https://sfdc.co/scoped-styles-light-dom'
                );
                continue;
            }
            // Apply the scope token only if the stylesheet itself is scoped, or if we're rendering synthetic shadow.
            const scopeToken =
                isScopedCss ||
                (vm.shadowMode === ShadowMode.Synthetic && vm.renderMode === RenderMode.Shadow)
                    ? stylesheetToken
                    : undefined;
            // Use the actual `:host` selector if we're rendering global CSS for light DOM, or if we're rendering
            // native shadow DOM. Synthetic shadow DOM never uses `:host`.
            const useActualHostSelector =
                vm.renderMode === RenderMode.Light
                    ? !isScopedCss
                    : vm.shadowMode === ShadowMode.Native;
            // Use the native :dir() pseudoclass only in native shadow DOM. Otherwise, in synthetic shadow,
            // we use an attribute selector on the host to simulate :dir().
            let useNativeDirPseudoclass;
            if (vm.renderMode === RenderMode.Shadow) {
                useNativeDirPseudoclass = vm.shadowMode === ShadowMode.Native;
            } else {
                // Light DOM components should only render `[dir]` if they're inside of a synthetic shadow root.
                // At the top level (root is null) or inside of a native shadow root, they should use `:dir()`.
                if (isUndefined(root)) {
                    // Only calculate the root once as necessary
                    root = getNearestShadowComponent(vm);
                }
                useNativeDirPseudoclass = isNull(root) || root.shadowMode === ShadowMode.Native;
            }
            ArrayPush.call(
                content,
                stylesheet(scopeToken, useActualHostSelector, useNativeDirPseudoclass)
            );
        }
    }

    return content;
}

export function getStylesheetsContent(vm: VM, template: Template): string[] {
    const { stylesheets, stylesheetToken } = template;
    const { stylesheets: vmStylesheets } = vm;

    let content: string[] = [];

    if (hasStyles(stylesheets)) {
        content = evaluateStylesheetsContent(stylesheets, stylesheetToken, vm);
    }

    // VM (component) stylesheets apply after template stylesheets
    if (hasStyles(vmStylesheets)) {
        ArrayPush.apply(content, evaluateStylesheetsContent(vmStylesheets, stylesheetToken, vm));
    }

    return content;
}

// It might be worth caching this to avoid doing the lookup repeatedly, but
// perf testing has not shown it to be a huge improvement yet:
// https://github.com/salesforce/lwc/pull/2460#discussion_r691208892
function getNearestShadowComponent(vm: VM): VM | null {
    let owner: VM | null = vm;
    while (!isNull(owner)) {
        if (owner.renderMode === RenderMode.Shadow) {
            return owner;
        }
        owner = owner.owner;
    }
    return owner;
}

/**
 * If the component that is currently being rendered uses scoped styles,
 * this returns the unique token for that scoped stylesheet. Otherwise
 * it returns null.
 */
// TODO [#3733]: remove support for legacy scope tokens
export function getScopeTokenClass(owner: VM, legacy: boolean): string | null {
    const { cmpTemplate, context } = owner;
    return (
        (context.hasScopedStyles &&
            (legacy ? cmpTemplate?.legacyStylesheetToken : cmpTemplate?.stylesheetToken)) ||
        null
    );
}

/**
 * This function returns the host style token for a custom element if it
 * exists. Otherwise it returns null.
 *
 * A host style token is applied to the component if scoped styles are used.
 */
export function getStylesheetTokenHost(vnode: VCustomElement): string | null {
    const { template } = getComponentInternalDef(vnode.ctor);
    const { vm } = vnode;
    const { stylesheetToken } = template;
    return !isUndefined(stylesheetToken) && computeHasScopedStyles(template, vm)
        ? makeHostToken(stylesheetToken)
        : null;
}

function getNearestNativeShadowComponent(vm: VM): VM | null {
    const owner = getNearestShadowComponent(vm);
    if (!isNull(owner) && owner.shadowMode === ShadowMode.Synthetic) {
        // Synthetic-within-native is impossible. So if the nearest shadow component is
        // synthetic, we know we won't find a native component if we go any further.
        return null;
    }
    return owner;
}

export function createStylesheet(vm: VM, stylesheets: string[]): VNode[] | null {
    const {
        renderMode,
        shadowMode,
        renderer: { insertStylesheet },
    } = vm;
    if (renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic) {
        for (let i = 0; i < stylesheets.length; i++) {
            insertStylesheet(stylesheets[i]);
        }
    } else if (!process.env.IS_BROWSER || vm.hydrated) {
        // Note: We need to ensure that during hydration, the stylesheets method is the same as those in ssr.
        //       This works in the client, because the stylesheets are created, and cached in the VM
        //       the first time the VM renders.

        // native shadow or light DOM, SSR
        return ArrayMap.call(stylesheets, createInlineStyleVNode) as VNode[];
    } else {
        // native shadow or light DOM, DOM renderer
        const root = getNearestNativeShadowComponent(vm);
        // null root means a global style
        const target = isNull(root) ? undefined : root.shadowRoot!;
        for (let i = 0; i < stylesheets.length; i++) {
            insertStylesheet(stylesheets[i], target);
        }
    }
    return null;
}
