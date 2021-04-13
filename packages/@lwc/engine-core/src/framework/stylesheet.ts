/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray, isUndefined, ArrayJoin, ArrayPush } from '@lwc/shared';

import * as api from './api';
import { VNode } from '../3rdparty/snabbdom/types';
import { VM } from './vm';
import { Template } from './template';
import { getStyleOrSwappedStyle } from './hot-swaps';
import { StylesheetFactory, StylesheetFactoryResult } from '../shared/stylesheet-factory';

const hasAdoptedStyleSheets =
    typeof ShadowRoot !== 'undefined' && 'adoptedStyleSheets' in ShadowRoot.prototype;

/**
 * The list of stylesheets associated with a template. Each entry is either a StylesheetFactory or a
 * TemplateStylesheetFactory a given stylesheet depends on other external stylesheets (via the
 * @import CSS declaration).
 */
export type TemplateStylesheetFactories = Array<StylesheetFactory | TemplateStylesheetFactories>;

function createShadowStyleVNode(content: string): VNode {
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
    const { elm, context, renderer } = vm;
    const { stylesheets: newStylesheets, stylesheetTokens: newStylesheetTokens } = template;

    let newHostAttribute: string | undefined;
    let newShadowAttribute: string | undefined;

    // Reset the styling token applied to the host element.
    const oldHostAttribute = context.hostAttribute;
    if (!isUndefined(oldHostAttribute)) {
        renderer.removeAttribute(elm, oldHostAttribute);
    }

    // Apply the new template styling token to the host element, if the new template has any
    // associated stylesheets.
    if (
        !isUndefined(newStylesheetTokens) &&
        !isUndefined(newStylesheets) &&
        newStylesheets.length !== 0
    ) {
        newHostAttribute = newStylesheetTokens.hostAttribute;
        newShadowAttribute = newStylesheetTokens.shadowAttribute;

        renderer.setAttribute(elm, newHostAttribute, '');
    }

    // Update the styling tokens present on the context object.
    context.hostAttribute = newHostAttribute;
    context.shadowAttribute = newShadowAttribute;
}

function evaluateStylesheetsContent(
    stylesheets: TemplateStylesheetFactories,
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean,
    hasAdoptedStyleSheets: boolean
): StylesheetFactoryResult[] {
    const content: StylesheetFactoryResult[] = [];

    for (let i = 0; i < stylesheets.length; i++) {
        let stylesheet = stylesheets[i];

        if (isArray(stylesheet)) {
            ArrayPush.apply(
                content,
                evaluateStylesheetsContent(
                    stylesheet,
                    hostSelector,
                    shadowSelector,
                    nativeShadow,
                    hasAdoptedStyleSheets
                )
            );
        } else {
            if (process.env.NODE_ENV !== 'production') {
                // in dev-mode, we support hot swapping of stylesheet, which means that
                // the component instance might be attempting to use an old version of
                // the stylesheet, while internally, we have a replacement for it.
                stylesheet = getStyleOrSwappedStyle(stylesheet);
            }
            ArrayPush.call(
                content,
                (stylesheet as StylesheetFactory)(
                    hostSelector,
                    shadowSelector,
                    nativeShadow,
                    hasAdoptedStyleSheets
                )
            );
        }
    }

    return content;
}

export function getStylesheetsContent(vm: VM, template: Template): StylesheetFactoryResult[] {
    const { stylesheets, stylesheetTokens: tokens } = template;
    const { syntheticShadow } = vm.renderer;

    let content: StylesheetFactoryResult[] = [];

    if (!isUndefined(stylesheets) && !isUndefined(tokens)) {
        const hostSelector = syntheticShadow ? `[${tokens.hostAttribute}]` : '';
        const shadowSelector = syntheticShadow ? `[${tokens.shadowAttribute}]` : '';

        content = evaluateStylesheetsContent(
            stylesheets,
            hostSelector,
            shadowSelector,
            !syntheticShadow,
            hasAdoptedStyleSheets
        );
    }

    return content;
}

export function createStylesheet(vm: VM, stylesheets: StylesheetFactoryResult[]): VNode | null {
    const { renderer, cmpRoot } = vm;

    if (renderer.syntheticShadow) {
        for (let i = 0; i < stylesheets.length; i++) {
            renderer.insertGlobalStylesheet(stylesheets[i] as 'string'); // always string if not hasAdoptedStyleSheets
        }

        return null;
    } else if (hasAdoptedStyleSheets) {
        // adoptedStyleSheets not in TypeScript yet: https://github.com/microsoft/TypeScript/issues/30022
        // @ts-ignore
        cmpRoot.adoptedStyleSheets = stylesheets as CSSStyleSheet[];
        return null;
    } else {
        const shadowStyleSheetContent = ArrayJoin.call(stylesheets as string[], '\n');
        return createShadowStyleVNode(shadowStyleSheetContent);
    }
}
