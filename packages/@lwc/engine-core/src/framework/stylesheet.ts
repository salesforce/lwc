/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayMap,
    ArrayPush,
    isArray,
    isNull,
    isTrue,
    isUndefined,
    KEY__NATIVE_ONLY_CSS,
    KEY__SCOPED_CSS,
} from '@lwc/shared';

import { logError } from '../shared/logger';

import api from './api';
import { RenderMode, ShadowMode } from './vm';
import { computeHasScopedStyles, hasStyles } from './template';
import { getStyleOrSwappedStyle } from './hot-swaps';
import { checkVersionMismatch } from './check-version-mismatch';
import { getComponentInternalDef } from './def';
import { assertNotProd, EmptyArray } from './utils';
import type { VCustomElement, VNode } from './vnodes';
import type { Template } from './template';
import type { VM } from './vm';
import type { Stylesheet, Stylesheets } from '@lwc/shared';

// These are only used for HMR in dev mode
// The "pure" annotations are so that Rollup knows for sure it can remove these from prod mode
let stylesheetsToCssContent: WeakMap<Stylesheet, Set<string>> = /*@__PURE__@*/ new WeakMap();
let cssContentToAbortControllers: Map<string, AbortController> = /*@__PURE__@*/ new Map();

// Only used in LWC's Karma tests
if (process.env.NODE_ENV === 'test-karma-lwc') {
    // Used to reset the global state between test runs
    (window as any).__lwcResetStylesheetCache = () => {
        stylesheetsToCssContent = new WeakMap();
        cssContentToAbortControllers = new Map();
    };
}

function linkStylesheetToCssContentInDevMode(stylesheet: Stylesheet, cssContent: string) {
    // Should never leak to prod; only used for HMR
    assertNotProd();
    let cssContents = stylesheetsToCssContent.get(stylesheet);
    if (isUndefined(cssContents)) {
        cssContents = new Set();
        stylesheetsToCssContent.set(stylesheet, cssContents);
    }
    cssContents.add(cssContent);
}

function getOrCreateAbortControllerInDevMode(cssContent: string) {
    // Should never leak to prod; only used for HMR
    assertNotProd();
    let abortController = cssContentToAbortControllers.get(cssContent);
    if (isUndefined(abortController)) {
        abortController = new AbortController();
        cssContentToAbortControllers.set(cssContent, abortController);
    }
    return abortController;
}

function getOrCreateAbortSignal(cssContent: string): AbortSignal | undefined {
    // abort controller/signal is only used for HMR in development
    if (process.env.NODE_ENV !== 'production') {
        return getOrCreateAbortControllerInDevMode(cssContent).signal;
    }
    return undefined;
}

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
            const hostScopeTokenClass = makeHostToken(newToken);
            getClassList(elm).add(hostScopeTokenClass);
            if (!process.env.IS_BROWSER) {
                // This is only used in SSR to communicate to hydration that
                // this class should be treated specially for purposes of hydration mismatches.
                setAttribute(elm, 'data-lwc-host-scope-token', hostScopeTokenClass);
            }
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
    stylesheets: Stylesheets,
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
            const isScopedCss = isTrue(stylesheet[KEY__SCOPED_CSS]);
            const isNativeOnlyCss = isTrue(stylesheet[KEY__NATIVE_ONLY_CSS]);
            const { renderMode, shadowMode } = vm;

            if (
                lwcRuntimeFlags.DISABLE_LIGHT_DOM_UNSCOPED_CSS &&
                !isScopedCss &&
                renderMode === RenderMode.Light
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
                (shadowMode === ShadowMode.Synthetic && renderMode === RenderMode.Shadow)
                    ? stylesheetToken
                    : undefined;
            // Use the actual `:host` selector if we're rendering global CSS for light DOM, or if we're rendering
            // native shadow DOM. Synthetic shadow DOM never uses `:host`.
            const useActualHostSelector =
                renderMode === RenderMode.Light ? !isScopedCss : shadowMode === ShadowMode.Native;
            // Use the native :dir() pseudoclass only in native shadow DOM. Otherwise, in synthetic shadow,
            // we use an attribute selector on the host to simulate :dir().
            let useNativeDirPseudoclass;
            if (renderMode === RenderMode.Shadow) {
                useNativeDirPseudoclass = shadowMode === ShadowMode.Native;
            } else {
                // Light DOM components should only render `[dir]` if they're inside of a synthetic shadow root.
                // At the top level (root is null) or inside of a native shadow root, they should use `:dir()`.
                if (isUndefined(root)) {
                    // Only calculate the root once as necessary
                    root = getNearestShadowComponent(vm);
                }
                useNativeDirPseudoclass = isNull(root) || root.shadowMode === ShadowMode.Native;
            }

            let cssContent;
            if (
                isNativeOnlyCss &&
                renderMode === RenderMode.Shadow &&
                shadowMode === ShadowMode.Synthetic
            ) {
                // Native-only (i.e. disableSyntheticShadowSupport) CSS should be ignored entirely
                // in synthetic shadow. It's fine to use in either native shadow or light DOM, but in
                // synthetic shadow it wouldn't be scoped properly and so should be ignored.
                cssContent = '/* ignored native-only CSS */';
            } else {
                cssContent = stylesheet(scopeToken, useActualHostSelector, useNativeDirPseudoclass);
            }

            if (process.env.NODE_ENV !== 'production') {
                linkStylesheetToCssContentInDevMode(stylesheet, cssContent);
            }

            ArrayPush.call(content, cssContent);
        }
    }

    return content;
}

export function getStylesheetsContent(vm: VM, template: Template): ReadonlyArray<string> {
    const { stylesheets, stylesheetToken } = template;
    const { stylesheets: vmStylesheets } = vm;

    const hasTemplateStyles = hasStyles(stylesheets);
    const hasVmStyles = hasStyles(vmStylesheets);

    if (hasTemplateStyles) {
        const content = evaluateStylesheetsContent(stylesheets, stylesheetToken, vm);
        if (hasVmStyles) {
            // Slow path – merge the template styles and vm styles
            ArrayPush.apply(
                content,
                evaluateStylesheetsContent(vmStylesheets, stylesheetToken, vm)
            );
        }
        return content;
    }

    if (hasVmStyles) {
        // No template styles, so return vm styles directly
        return evaluateStylesheetsContent(vmStylesheets, stylesheetToken, vm);
    }

    // Fastest path - no styles, so return an empty array
    return EmptyArray;
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
 * @param owner
 * @param legacy
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
 * @param vnode
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

export function createStylesheet(vm: VM, stylesheets: ReadonlyArray<string>): VNode[] | null {
    const {
        renderMode,
        shadowMode,
        renderer: { insertStylesheet },
    } = vm;
    if (renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic) {
        for (let i = 0; i < stylesheets.length; i++) {
            const stylesheet = stylesheets[i];
            insertStylesheet(stylesheet, undefined, getOrCreateAbortSignal(stylesheet));
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
            const stylesheet = stylesheets[i];
            insertStylesheet(stylesheet, target, getOrCreateAbortSignal(stylesheet));
        }
    }
    return null;
}

export function unrenderStylesheet(stylesheet: Stylesheet) {
    // should never leak to prod; only used for HMR
    assertNotProd();
    const cssContents = stylesheetsToCssContent.get(stylesheet);
    /* istanbul ignore if */
    if (isUndefined(cssContents)) {
        throw new Error('Cannot unrender stylesheet which was never rendered');
    }
    for (const cssContent of cssContents) {
        const abortController = cssContentToAbortControllers.get(cssContent);
        if (isUndefined(abortController)) {
            // Two stylesheets with the same content will share an abort controller, in which case it only needs to be called once.
            continue;
        }
        abortController.abort();
        // remove association with AbortController in case stylesheet is rendered again
        cssContentToAbortControllers.delete(cssContent);
    }
}
