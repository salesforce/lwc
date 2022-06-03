/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { invariant, TemplateErrors } from '@lwc/errors';
import State from '../state';
import { BaseElement } from './types';

/**
 * Config to specify which elements and directives require a customizable renderer.
 */
export interface CustomRendererConfig {
    elements: {
        tagName: string;
        attributes?: string[];
    }[];
    directives: string[];
    rendererModule?: string;
}

/**
 * Mapping of Directive.name to string literals used in template
 */
export const LWC_DIRECTIVES: { [type: string]: string } = {
    Dom: 'lwc:dom',
    Dynamic: 'lwc:dynamic',
    InnerHTML: 'lwc:inner-html',
};

export function isCustomRendererHookRequired(element: BaseElement, state: State): boolean {
    let addSanitizationHook = false;
    if (state.config.provideCustomRendererHooks) {
        const { attributes, directives } = element;
        if (directives.length) {
            // If any directives require custom renderer
            addSanitizationHook = directives.some((dir) => {
                return state.directivesReqCustomRenderer.has(LWC_DIRECTIVES[dir.name]);
            });
            if (addSanitizationHook) {
                // Directives that require custom renderer are not allowed on custom elements
                // Custom element cannot be allowed to have a custom renderer hook
                // The renderer is cascaded down from the owner(custom element) to all its child nodes who
                // do not have a renderer specified.
                invariant(
                    element.type !== 'Component',
                    TemplateErrors.DIRECTIVE_DISALLOWED_ON_CUSTOM_ELEMENT,
                    [element.name, state.config.customRendererConfig.directives.join(', ')]
                );
            }
        }
        const customRendererAttributes = state.elementsReqCustomRenderer[element.name];
        // If element requires custom renderer
        if (customRendererAttributes) {
            // If no attributes are specified, then consider the element requires custom renderer
            if (
                customRendererAttributes.size === 0 ||
                attributes.some((attribute) => customRendererAttributes.has(attribute.name))
            ) {
                addSanitizationHook = true;
            }
        }
    }
    return addSanitizationHook;
}
