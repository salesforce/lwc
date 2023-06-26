/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import State from '../state';
import { BaseElement, ElementDirectiveName } from './types';

/**
 * Config representing criteria for an element match.
 * All conditions specified must be satisfied to be considered a match.
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
     * This field is optional.
     * If undefined or empty, attribute matching is skipped.
     */
    attributes?: string[];
}

/**
 * Config to specify which elements and directives require a customizable renderer.
 * An element is qualified if it matches the CustomRendererElementConfig OR the directives.
 */
export interface CustomRendererConfig {
    /**
     * Element matching criteria. Element much satisfy all conditions of the CustomRendererElementConfig
     */
    elements: CustomRendererElementConfig[];
    /**
     * List of lwc directives that qualify an element. An element must use at least 1
     * directive to be considered a match.
     * If empty, elements matching is not done based on directives.
     */
    directives: string[];
}

function shouldAddCustomRenderer(element: BaseElement, state: State): boolean {
    // Elements of type `ExternalComponent` (e.g., elements with the lwc:external directive)
    if (state.crDirectives.has('lwc:external') && element.type === 'ExternalComponent') {
        return true;
    }

    // Elements of type `Component` are not allowed to have custom renderer hooks.
    // The renderer is cascaded down from the owner(custom element) to all its child nodes who
    // do not have a renderer specified.
    // lwc:component will resolve to a custom element at runtime.
    if (element.type === 'Component' || element.name === 'lwc:component') {
        return false;
    }

    const { attributes, directives } = element;
    if (directives.length) {
        let directiveMatched = false;
        // If any directives require custom renderer
        directiveMatched = directives.some((dir) => {
            return state.crDirectives.has(ElementDirectiveName[dir.name]);
        });
        if (directiveMatched) {
            return true;
        }
    }
    const elementConfig = state.crElmToConfigMap[element.name];
    // If element requires custom renderer
    if (elementConfig) {
        const { namespace, attributes: attrConfig } = elementConfig;
        // if element config has namespace, then namespace has to be a match
        if (namespace && element.namespace !== namespace) {
            return false;
        }
        // If no attributes are specified, then consider the element requires custom renderer
        if (
            attrConfig.size === 0 ||
            attributes.some((attribute) => attrConfig.has(attribute.name))
        ) {
            return true;
        }
    }
    return false;
}

export function isCustomRendererHookRequired(element: BaseElement, state: State): boolean {
    let addCustomRenderer = false;
    if (state.config.customRendererConfig) {
        const cachedResult = state.crCheckedElements.get(element);
        if (cachedResult !== undefined) {
            return cachedResult;
        } else {
            addCustomRenderer = shouldAddCustomRenderer(element, state);
            state.crCheckedElements.set(element, addCustomRenderer);
        }
    }
    return addCustomRenderer;
}
