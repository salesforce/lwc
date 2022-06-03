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
 * Config representing criteria for an element match.
 */
export interface CustomRendererElementConfig {
    /**
     * Tag name to use to match an element.
     */
    tagName: string;
    /**
     * Optional namespace to match an element.
     */
    namespace?: string;
    /**
     * Specify attributes that need to be matched.
     * This field is optional. When not set, the element is matched based on tag name and namespace.
     */
    attributes?: string[];
}

/**
 * Config to specify which elements and directives require a customizable renderer.
 */
export interface CustomRendererConfig {
    elements: CustomRendererElementConfig[];
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
    let addCustomRenderer = false;
    if (state.config.customRendererConfig) {
        const { attributes, directives } = element;
        if (directives.length) {
            // If any directives require custom renderer
            addCustomRenderer = directives.some((dir) => {
                return state.directivesReqCustomRenderer.has(LWC_DIRECTIVES[dir.name]);
            });
            if (addCustomRenderer) {
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
        const elementConfig = state.elementsReqCustomRenderer[element.name];
        // If element requires custom renderer
        if (elementConfig) {
            // if element config has namespace, then namespace has to be a match
            if (elementConfig.namespace && element.namespace !== elementConfig.namespace) {
                return false;
            }
            // If no attributes are specified, then consider the element requires custom renderer
            if (
                elementConfig.attributes === undefined ||
                attributes.some((attribute) => elementConfig.attributes!.includes(attribute.name))
            ) {
                addCustomRenderer = true;
            }
        }
    }
    return addCustomRenderer;
}
