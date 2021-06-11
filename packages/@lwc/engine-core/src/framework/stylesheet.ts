/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray, isUndefined, ArrayJoin, ArrayPush, isNull } from '@lwc/shared';

import * as api from './api';
import { VNode } from '../3rdparty/snabbdom/types';
import { RenderMode, ShadowMode, VM } from './vm';
import { Template, TemplateStylesheetTokens } from './template';
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

export function updateSyntheticShadowAttributes(vm: VM, template: Template) {
    const { elm, context, renderer, renderMode } = vm;
    const { stylesheets: newStylesheets, stylesheetTokens: newStylesheetTokens } = template;

    let newTokens: TemplateStylesheetTokens | undefined;

    // Reset the styling token applied to the host element.
    const oldHostAttribute = context.hostAttribute;
    if (!isUndefined(oldHostAttribute)) {
        renderer.removeAttribute(elm, oldHostAttribute);
    }

    // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets.
    if (
        !isUndefined(newStylesheets) &&
        newStylesheets.length !== 0 &&
        renderMode === RenderMode.Shadow
    ) {
        newTokens = newStylesheetTokens;
    }

    if (!isUndefined(newTokens)) {
        renderer.setAttribute(elm, newTokens.hostAttribute, '');
    }

    // Update the styling tokens present on the context object.
    context.hostAttribute = newTokens?.hostAttribute;
    context.shadowAttribute = newTokens?.shadowAttribute;
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
    const { stylesheets, stylesheetTokens } = template;
    const { renderMode, shadowMode } = vm;

    let content: string[] = [];

    if (!isUndefined(stylesheets) && stylesheets.length !== 0) {
        let hostSelector;
        let shadowSelector;

        // Scoping with the tokens is only necessary for synthetic shadow. For both
        // light DOM elements and native shadow, we just render the CSS as-is.
        if (
            renderMode === RenderMode.Shadow &&
            shadowMode === ShadowMode.Synthetic &&
            !isUndefined(stylesheetTokens)
        ) {
            hostSelector = `[${stylesheetTokens.hostAttribute}]`;
            shadowSelector = `[${stylesheetTokens.shadowAttribute}]`;
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
