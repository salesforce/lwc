import assert from "../shared/assert";
import * as api from "./api";
import { isArray, isFunction, isObject, isUndefined, create, ArrayIndexOf, toString, hasOwnProperty, forEach } from "../shared/language";
import { VNode, VNodes } from "../3rdparty/snabbdom/types";
import { RenderAPI } from "./api";
import { Context } from "./context";
import { SlotSet, VM, resetShadowRoot } from "./vm";
import { EmptyArray } from "./utils";
import { ComponentInterface } from "./component";
import { removeAttribute, setAttribute } from "./dom-api";

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, ctx: Context): undefined | VNodes;

    /**
     * HTML attribute that need to be applied to the host element.
     * This attribute is used for the `:host` pseudo class CSS selector.
     */
    hostToken?: string;

    /**
     * HTML attribute that need to the applied to all the element that the template produces.
     * This attribute is used for style encapsulation when the engine runs in fallback mode.
     */
    shadowToken?: string;
}

const VERIFIED_TEMPLATE_SET = new Set();
const EmptySlots: SlotSet = create(null);

function validateSlots(vm: VM, html: any) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const { cmpSlots = EmptySlots } = vm;
    const { slots = EmptyArray } = html;
    for (const slotName in cmpSlots) {
        assert.isTrue(isArray(cmpSlots[slotName]), `Slots can only be set to an array, instead received ${toString(cmpSlots[slotName])} for slot "${slotName}" in ${vm}.`);
        if (ArrayIndexOf.call(slots, slotName) === -1) {
            // TODO: this should never really happen because the compiler should always validate
            assert.logWarning(`Ignoring unknown provided slot name "${slotName}" in ${vm}. This is probably a typo on the slot attribute.`, vm.elm);
        }
    }
}

function validateFields(vm: VM, html: any) {
    if (process.env.NODE_ENV === 'production') {
        // this method should never leak to prod
        throw new ReferenceError();
    }
    const component = vm.component as ComponentInterface;
    // validating identifiers used by template that should be provided by the component
    const { ids = [] } = html;
    forEach.call(ids, (propName: string) => {
        if (!(propName in component)) {
            assert.logWarning(`The template rendered by ${vm} references \`this.${propName}\`, which is not declared. This is likely a typo in the template.`, vm.elm);
        } else if (hasOwnProperty.call(component, propName)) {
            assert.fail(`${component}'s template is accessing \`this.${toString(propName)}\`, which is considered a non-reactive private field. Instead access it via a getter or make it reactive by decorating it with \`@track ${toString(propName)}\`.`);
        }
    });
}

/**
 * Apply/Update the styling token applied to the host element.
 */
function applyTokenToHost(vm: VM, html: Template): void {
    const { context, elm } = vm;

    const oldToken = context.hostToken;
    const newToken = html.hostToken;

    // Remove the token currently applied to the host element if different than the one associated
    // with the current template
    if (!isUndefined(oldToken)) {
        removeAttribute.call(elm, oldToken);
    }
    // If the template has a token apply the token to the host element
    if (!isUndefined(newToken)) {
        setAttribute.call(elm, newToken, '');
    }
    context.hostToken = html.hostToken;
    context.shadowToken = html.shadowToken;
}

export function registerTemplate(tmpl: Template) {
    VERIFIED_TEMPLATE_SET.add(tmpl);
}

function verifyTemplate(tmpl: Template) {
    if (!VERIFIED_TEMPLATE_SET.has(tmpl)) {
        throw new TypeError('Unknown template');
    }
    return tmpl;
}

export function evaluateTemplate(vm: VM, html: Template): Array<VNode|null> {
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm && "cmpRoot" in vm, `${vm} is not a vm.`);
        assert.isTrue(isFunction(html), `evaluateTemplate() second argument must be a function instead of ${html}`);
    }

    // TODO: add identity to the html functions
    const { component, context, cmpSlots, cmpTemplate } = vm;
    // reset the cache memoizer for template when needed
    if (html !== cmpTemplate) {
        if (!isUndefined(cmpTemplate)) {
            // It is important to reset the content to avoid reusing similar elements generated from a different
            // template, because they could have similar IDs, and snabbdom just rely on the IDs.
            resetShadowRoot(vm);
        }

        // Check that the template is built by the compiler
        verifyTemplate(html);

        vm.cmpTemplate = html;

        // Populate context with template information
        context.tplCache = create(null);

        // TODO: tokens are only needed in fallback mode
        applyTokenToHost(vm, html);

        if (process.env.NODE_ENV !== 'production') {
            // one time operation for any new template returned by render()
            // so we can warn if the template is attempting to use a binding
            // that is not provided by the component instance.
            validateFields(vm, html);
        }
    }

    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(isObject(context.tplCache), `vm.context.tplCache must be an object associated to ${cmpTemplate}.`);
        // validating slots in every rendering since the allocated content might change over time
        validateSlots(vm, html);
    }
    const vnodes = html.call(undefined, api, component, cmpSlots, context.tplCache);

    if (process.env.NODE_ENV !== 'production') {
        assert.invariant(isArray(vnodes), `Compiler should produce html functions that always return an array.`);
    }
    return vnodes;
}
