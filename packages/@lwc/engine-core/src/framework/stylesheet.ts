/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray, isUndefined, ArrayJoin, ArrayPush } from '@lwc/shared';

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
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean
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
    const isLightDom = renderMode === RenderMode.Light;

    if (!isSyntheticShadow && !isLightDom) {
        return; // nothing to do for native shadow DOM
    }

    let newToken: string | undefined;

    // Reset the styling token applied to the host element.
    const oldToken = context.stylesheetToken;
    if (!isUndefined(oldToken)) {
        if (isLightDom) {
            renderer.getClassList(elm).remove(makeHostToken(oldToken));
        } else {
            // synthetic shadow
            renderer.removeAttribute(elm, makeHostToken(oldToken));
        }
    }

    // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets. In the case of light DOM, also ensure there is at least one scoped stylesheet.
    if (
        !isUndefined(newStylesheets) &&
        newStylesheets.length !== 0 &&
        (isSyntheticShadow || context.hasScopedStyles)
    ) {
        newToken = newStylesheetToken;
    }

    // Set the new styling token on the host element
    if (!isUndefined(newToken)) {
        if (isLightDom) {
            renderer.getClassList(elm).add(makeHostToken(newToken));
        } else {
            // synthetic shadow
            renderer.setAttribute(elm, makeHostToken(newToken), '');
        }
    }

    // Update the styling tokens present on the context object.
    context.stylesheetToken = newToken;
}

function evaluateStylesheetsContent(
    stylesheets: TemplateStylesheetFactories,
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean
): string[] {
    const content: string[] = [];

    for (let i = 0; i < stylesheets.length; i++) {
        let stylesheet = stylesheets[i];

        if (isArray(stylesheet)) {
            ArrayPush.apply(
                content,
                evaluateStylesheetsContent(stylesheet, hostSelector, shadowSelector, nativeShadow)
            );
        } else {
            if (process.env.NODE_ENV !== 'production') {
                // in dev-mode, we support hot swapping of stylesheet, which means that
                // the component instance might be attempting to use an old version of
                // the stylesheet, while internally, we have a replacement for it.
                stylesheet = getStyleOrSwappedStyle(stylesheet);
            }
            ArrayPush.call(content, stylesheet(hostSelector, shadowSelector, nativeShadow));
        }
    }

    return content;
}

export function getStylesheetsContent(vm: VM, template: Template): string[] {
    const { stylesheets, stylesheetToken } = template;
    const { renderMode, shadowMode } = vm;

    let content: string[] = [];

    if (!isUndefined(stylesheets) && stylesheets.length !== 0) {
        let hostSelector;
        let shadowSelector;

        // Scoping with the tokens is only necessary for synthetic shadow. For both
        // light DOM elements and native shadow, we just render the CSS as-is.
        if (
            shadowMode === ShadowMode.Synthetic &&
            renderMode === RenderMode.Shadow &&
            !isUndefined(stylesheetToken)
        ) {
            hostSelector = `[${makeHostToken(stylesheetToken)}]`;
            shadowSelector = `[${stylesheetToken}]`;
        } else {
            hostSelector = '';
            shadowSelector = '';
        }

        content = evaluateStylesheetsContent(
            stylesheets,
            hostSelector,
            shadowSelector,
            shadowMode === ShadowMode.Native
        );
    }

    return content;
}

export function createStylesheet(vm: VM, stylesheets: string[]): VNode | null {
    const { renderer, renderMode, shadowMode } = vm;
    if (renderMode === RenderMode.Shadow && shadowMode === ShadowMode.Synthetic) {
        for (let i = 0; i < stylesheets.length; i++) {
            renderer.insertGlobalStylesheet(stylesheets[i]);
        }
        return null;
    } else {
        // native shadow or light DOM
        const combinedStylesheetContent = ArrayJoin.call(stylesheets, '\n');
        return createInlineStyleVNode(combinedStylesheetContent);
    }
}
