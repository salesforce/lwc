/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { ArrayJoin, ArrayPush, isArray, isNull, isUndefined, KEY__SCOPED_CSS } from '@lwc/shared';

import * as api from './api';
import { VNode } from '../3rdparty/snabbdom/types';
import { RenderMode, ShadowMode, VM } from './vm';
import { Template } from './template';
import { getStyleOrSwappedStyle } from './hot-swaps';

/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type StylesheetFactory = (
    useActualHostSelector: boolean,
    stylesheetToken: string | undefined
) => string;

/**
 * The list of stylesheets associated with a template. Each entry is either a StylesheetFactory or a
 * TemplateStylesheetFactory a given stylesheet depends on other external stylesheets (via the
 * @import CSS declaration).
 */
export type TemplateStylesheetFactories = Array<StylesheetFactory | TemplateStylesheetFactories>;

function makeHostToken(token: string) {
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

export function updateStylesheetToken(vm: VM, template: Template) {
    const { elm, context, renderer, renderMode, shadowMode } = vm;
    const { stylesheets: newStylesheets, stylesheetToken: newStylesheetToken } = template;
    const isSyntheticShadow =
        renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic;
    const { hasScopedStyles } = context;

    let newToken: string | undefined;
    let newHasTokenInClass: boolean | undefined;
    let newHasTokenInAttribute: boolean | undefined;

    // Reset the styling token applied to the host element.
    const {
        stylesheetToken: oldToken,
        hasTokenInClass: oldHasTokenInClass,
        hasTokenInAttribute: oldHasTokenInAttribute,
    } = context;
    if (oldHasTokenInClass) {
        renderer.getClassList(elm).remove(makeHostToken(oldToken!));
    }
    if (oldHasTokenInAttribute) {
        renderer.removeAttribute(elm, makeHostToken(oldToken!));
    }

    // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets. In the case of light DOM, also ensure there is at least one scoped stylesheet.
    if (!isUndefined(newStylesheets) && newStylesheets.length !== 0) {
        newToken = newStylesheetToken;
    }

    // Set the new styling token on the host element
    if (!isUndefined(newToken)) {
        if (hasScopedStyles) {
            renderer.getClassList(elm).add(makeHostToken(newToken));
            newHasTokenInClass = true;
        }
        if (isSyntheticShadow) {
            renderer.setAttribute(elm, makeHostToken(newToken), '');
            newHasTokenInAttribute = true;
        }
    }

    // Update the styling tokens present on the context object.
    context.stylesheetToken = newToken;
    context.hasTokenInClass = newHasTokenInClass;
    context.hasTokenInAttribute = newHasTokenInAttribute;
}

function evaluateStylesheetsContent(
    stylesheets: TemplateStylesheetFactories,
    stylesheetToken: string | undefined,
    vm: VM
): string[] {
    const content: string[] = [];

    for (let i = 0; i < stylesheets.length; i++) {
        let stylesheet = stylesheets[i];

        if (isArray(stylesheet)) {
            ArrayPush.apply(content, evaluateStylesheetsContent(stylesheet, stylesheetToken, vm));
        } else {
            if (process.env.NODE_ENV !== 'production') {
                // in dev-mode, we support hot swapping of stylesheet, which means that
                // the component instance might be attempting to use an old version of
                // the stylesheet, while internally, we have a replacement for it.
                stylesheet = getStyleOrSwappedStyle(stylesheet);
            }
            // Use the actual `:host` selector if we're rendering global CSS for light DOM, or if we're rendering
            // native shadow DOM. Synthetic shadow DOM never uses `:host`.
            const isScopedCss = (stylesheet as any)[KEY__SCOPED_CSS];
            const useActualHostSelector =
                vm.renderMode === RenderMode.Light
                    ? !isScopedCss
                    : vm.shadowMode === ShadowMode.Native;
            // Apply the scope token only if the stylesheet itself is scoped, or if we're rendering synthetic shadow.
            const scopeToken =
                isScopedCss ||
                (vm.shadowMode === ShadowMode.Synthetic && vm.renderMode === RenderMode.Shadow)
                    ? stylesheetToken
                    : undefined;
            ArrayPush.call(content, stylesheet(useActualHostSelector, scopeToken));
        }
    }

    return content;
}

export function getStylesheetsContent(vm: VM, template: Template): string[] {
    const { stylesheets, stylesheetToken } = template;

    let content: string[] = [];

    if (!isUndefined(stylesheets) && stylesheets.length !== 0) {
        content = evaluateStylesheetsContent(stylesheets, stylesheetToken, vm);
    }

    return content;
}

// It might be worth caching this to avoid doing the lookup repeatedly, but
// perf testing has not shown it to be a huge improvement yet:
// https://github.com/salesforce/lwc/pull/2460#discussion_r691208892
function getNearestNativeShadowComponent(vm: VM): VM | null {
    let owner: VM | null = vm;
    while (!isNull(owner)) {
        if (owner.renderMode === RenderMode.Shadow && owner.shadowMode === ShadowMode.Native) {
            return owner;
        }
        owner = owner.owner;
    }
    return owner;
}

export function createStylesheet(vm: VM, stylesheets: string[]): VNode | null {
    const { renderer, renderMode, shadowMode } = vm;
    if (renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic) {
        for (let i = 0; i < stylesheets.length; i++) {
            renderer.insertGlobalStylesheet(stylesheets[i]);
        }
    } else if (renderer.ssr) {
        // native shadow or light DOM, SSR
        const combinedStylesheetContent = ArrayJoin.call(stylesheets, '\n');
        return createInlineStyleVNode(combinedStylesheetContent);
    } else {
        // native shadow or light DOM, DOM renderer
        const root = getNearestNativeShadowComponent(vm);
        const isGlobal = isNull(root);
        for (let i = 0; i < stylesheets.length; i++) {
            if (isGlobal) {
                renderer.insertGlobalStylesheet(stylesheets[i]);
            } else {
                // local level
                renderer.insertStylesheet(stylesheets[i], root!.cmpRoot);
            }
        }
    }
    return null;
}
