import State from '../state';
import { BaseElement } from './types';

export interface SanitizeConfig {
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

export function isSanitizationHookRequired(element: BaseElement, state: State): boolean {
    let addSanitizationHook = false;
    if (state.config.provideSanitizationHooks) {
        const { attributes } = element;
        // If any directives used are considered risky
        addSanitizationHook = element.directives.some((dir) => {
            return state.riskyDirectives.has(LWC_DIRECTIVES[dir.name]);
        });
        const riskyAttributes = state.riskyElements[element.name];
        // If element is considered risky
        if (riskyAttributes) {
            // If no attributes are specified, then consider the element risky
            if (
                riskyAttributes.size === 0 ||
                attributes.some((attribute) => riskyAttributes.has(attribute.name))
            ) {
                addSanitizationHook = true;
            }
        }
    }
    return addSanitizationHook;
}
