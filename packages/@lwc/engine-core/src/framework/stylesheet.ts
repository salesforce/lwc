/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { isArray, isUndefined, ArrayJoin } from '@lwc/shared';

import * as api from './api';
import { VNode } from '../3rdparty/snabbdom/types';
import { VM } from './vm';
import { Template } from './template';

/**
 * Function producing style based on a host and a shadow selector. This function is invoked by
 * the engine with different values depending on the mode that the component is running on.
 */
export type StylesheetFactory = (
    hostSelector: string,
    shadowSelector: string,
    nativeShadow: boolean
) => string;

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

export function getStylesheetsContent(vm: VM, template: Template): string[] {
    const { stylesheets: factories, stylesheetTokens: tokens } = template;
    const { syntheticShadow: useSyntheticShadow } = vm.renderer;

    const stylesheets: string[] = [];

    if (!isUndefined(factories) && !isUndefined(tokens)) {
        const hostSelector = useSyntheticShadow ? `[${tokens.hostAttribute}]` : '';
        const shadowSelector = useSyntheticShadow ? `[${tokens.shadowAttribute}]` : '';

        for (let i = 0; i < factories.length; i++) {
            const factory = factories[i];

            if (isArray(factory)) {
                for (let j = 0; j < factory.length; j++) {
                    stylesheets.push(factory[j](hostSelector, shadowSelector, !useSyntheticShadow));
                }
            } else {
                stylesheets.push(factory(hostSelector, shadowSelector, !useSyntheticShadow));
            }
        }
    }

    return stylesheets;
}

export function createStylesheet(vm: VM, stylesheets: string[]): VNode | null {
    const { renderer } = vm;

    if (renderer.syntheticShadow) {
        for (let i = 0; i < stylesheets.length; i++) {
            renderer.insertGlobalStylesheet(stylesheets[i]);
        }

        return null;
    } else {
        const shadowStyleSheetContent = ArrayJoin.call(stylesheets, '\n');
        return createShadowStyleVNode(shadowStyleSheetContent);
    }
}
