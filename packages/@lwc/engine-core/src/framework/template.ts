/*
 * Copyright (c) 2024, Salesforce, Inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    ArrayUnshift,
    assert,
    create,
    htmlEscape,
    isArray,
    isNull,
    isString,
    isTrue,
    isUndefined,
    KEY__SCOPED_CSS,
    keys,
    StringCharAt,
    STATIC_PART_TOKEN_ID,
    toString,
} from '@lwc/shared';

import { logError } from '../shared/logger';
import { getComponentTag } from '../shared/format';
import api, { RenderAPI } from './api';
import {
    RenderMode,
    resetComponentRoot,
    runWithBoundaryProtection,
    ShadowMode,
    SlotSet,
    TemplateCache,
    VM,
} from './vm';
import { assertNotProd, EmptyObject } from './utils';
import { defaultEmptyTemplate, isTemplateRegistered } from './secure-template';
import {
    createStylesheet,
    getStylesheetsContent,
    Stylesheets,
    updateStylesheetToken,
} from './stylesheet';
import { logOperationEnd, logOperationStart, OperationId } from './profiler';
import { getTemplateOrSwappedTemplate, setActiveVM } from './hot-swaps';
import { MutableVNodes, VNodes, VStaticPart, VStaticPartElement, VStaticPartText } from './vnodes';
import { RendererAPI } from './renderer';
import { getMapFromClassName } from './modules/computed-class-attr';
import { FragmentCacheKey, getFromFragmentCache, setInFragmentCache } from './fragment-cache';
import { isReportingEnabled, report, ReportingEventId } from './reporting';

export interface Template {
    (api: RenderAPI, cmp: object, slotSet: SlotSet, cache: TemplateCache): VNodes;

    /** The list of slot names used in the template. */
    slots?: string[];
    /** The stylesheet associated with the template. */
    stylesheets?: Stylesheets;
    /** The string used for synthetic shadow style scoping and light DOM style scoping. */
    stylesheetToken?: string;
    /** Same as the above, but for legacy use cases (pre-LWC v3.0.0) */
    // TODO [#3733]: remove support for legacy scope tokens
    legacyStylesheetToken?: string;
    /** Render mode for the template. Could be light or undefined (which means it's shadow) */
    renderMode?: 'light';
    /** True if this template contains template refs, undefined or false otherwise */
    hasRefs?: boolean;
}

export let isUpdatingTemplate: boolean = false;

let vmBeingRendered: VM | null = null;
export function getVMBeingRendered(): VM | null {
    return vmBeingRendered;
}
export function setVMBeingRendered(vm: VM | null) {
    vmBeingRendered = vm;
}

const VALID_SCOPE_TOKEN_REGEX = /^[a-zA-Z0-9\-_.]+$/;

// See W-16614556
// TODO [#2826]: freeze the template object
function isValidScopeToken(token: any) {
    return isString(token) && VALID_SCOPE_TOKEN_REGEX.test(token);
}

function validateSlots(vm: VM) {
    assertNotProd(); // this method should never leak to prod

    const { cmpSlots } = vm;

    for (const slotName in cmpSlots.slotAssignments) {
        assert.isTrue(
            isArray(cmpSlots.slotAssignments[slotName]),
            `Slots can only be set to an array, instead received ${toString(
                cmpSlots.slotAssignments[slotName]
            )} for slot "${slotName}" in ${vm}.`
        );
    }
}

function checkHasMatchingRenderMode(template: Template, vm: VM) {
    // don't validate in prod environments where reporting is disabled
    if (process.env.NODE_ENV === 'production' && !isReportingEnabled()) {
        return;
    }
    // don't validate the default empty template - it is not inherently light or shadow
    if (template === defaultEmptyTemplate) {
        return;
    }
    // TODO [#4663]: `renderMode` mismatch between template and component causes `console.error` but no error
    // Note that `undefined` means shadow in this case, because shadow is the default.
    const vmIsLight = vm.renderMode === RenderMode.Light;
    const templateIsLight = template.renderMode === 'light';
    if (vmIsLight !== templateIsLight) {
        report(ReportingEventId.RenderModeMismatch, {
            tagName: vm.tagName,
            mode: vm.renderMode,
        });
        if (process.env.NODE_ENV !== 'production') {
            const tagName = getComponentTag(vm);
            const message = vmIsLight
                ? `Light DOM components can't render shadow DOM templates. Add an 'lwc:render-mode="light"' directive to the root template tag of ${tagName}.`
                : `Shadow DOM components template can't render light DOM templates. Either remove the 'lwc:render-mode' directive from ${tagName} or set it to 'lwc:render-mode="shadow"`;

            logError(message);
        }
    }
}

const browserExpressionSerializer = (partToken: string, classAttrToken: string) => {
    // This will insert the scoped style token as a static class attribute in the fragment
    // bypassing the need to call applyStyleScoping when mounting static parts.
    const type = StringCharAt.call(partToken, 0);
    switch (type) {
        case STATIC_PART_TOKEN_ID.CLASS:
            return classAttrToken;
        case STATIC_PART_TOKEN_ID.TEXT:
            // Using a single space here gives us a single empty text node
            return ' ';
        default:
            return '';
    }
};
const serializerNoop = () => {
    throw new Error('LWC internal error, attempted to serialize partToken without static parts');
};
// This function serializes the expressions generated by static content optimization.
// Currently this is only needed for SSR.
// TODO [#4078]: Split the implementation between @lwc/engine-dom and @lwc/engine-server
function buildSerializeExpressionFn(parts?: VStaticPart[]) {
    if (process.env.IS_BROWSER) {
        return browserExpressionSerializer;
    }

    if (isUndefined(parts)) {
        // Technically this should not be reachable, if there are no parts there should be no partTokens
        // and this function should never be invoked.
        return serializerNoop;
    }

    const partIdsToParts = new Map<string, VStaticPart>();
    for (const staticPart of parts) {
        partIdsToParts.set(`${staticPart.partId}`, staticPart);
    }

    const parsePartToken = (partToken: string) => {
        // The partTokens are split into 3 section:
        // 1. The first character represents the expression type (attribute, class, style, or text).
        // 2. For attributes, the characters from index 1 to the first occurrence of a ':' is the partId.
        // 3. Everything after the first ':' represents the attribute name.
        // 4. For non-attributes everything from index 1 to the string length is the partId.
        // Ex, attribute: a0:data-name, a = an attribute, 0 = partId, data-name = attribute name.
        // Ex, style: s0, s = a style attribute, 0 = partId.
        // Note some attributes contain a `:`, e.g. `xlink:href` may be encoded as `a0:xlink:href`.
        const type = StringCharAt.call(partToken, 0);
        let delimiterIndex = partToken.length;
        let attrName = '';
        if (type === STATIC_PART_TOKEN_ID.ATTRIBUTE) {
            delimiterIndex = partToken.indexOf(':');
            // Only VStaticPartData.attrs have an attribute name
            attrName = partToken.substring(delimiterIndex + 1);
        }
        const partId = partToken.substring(1, delimiterIndex);
        const part = partIdsToParts.get(partId) ?? EmptyObject;

        return { type, part, attrName };
    };

    return (partToken: string, classToken: string) => {
        const { type, part, attrName } = parsePartToken(partToken);

        switch (type) {
            case STATIC_PART_TOKEN_ID.ATTRIBUTE:
                return serializeAttribute(part, attrName);
            case STATIC_PART_TOKEN_ID.CLASS: // class
                return serializeClassAttribute(part, classToken);
            case STATIC_PART_TOKEN_ID.STYLE: // style
                return serializeStyleAttribute(part);
            case STATIC_PART_TOKEN_ID.TEXT: // text
                return serializeTextContent(part);
            default:
                // This should not be reachable
                throw new Error(
                    `LWC internal error, unrecognized part token during serialization ${partToken}`
                );
        }
    };
}

function serializeTextContent(part: VStaticPartText) {
    const { text } = part;
    if (text === '') {
        return '\u200D'; // Special serialization for empty text nodes
    }
    // Note the serialization logic doesn't need to validate against the style tag as in serializeTextContent
    // because style tags are always inserted through the engine.
    // User input of style tags are blocked, furthermore, all dynamic text is escaped at this point.
    return htmlEscape(text);
}

function serializeStyleAttribute(part: VStaticPartElement) {
    const {
        data: { style },
    } = part;
    // This is designed to mirror logic patchStyleAttribute
    return isString(style) && style.length ? ` style="${htmlEscape(style, true)}"` : '';
}

function serializeAttribute(part: VStaticPartElement, name: string) {
    const {
        data: { attrs = {} },
    } = part;
    const rawValue = attrs[name];
    let value = '';
    // The undefined and null checks here are designed to match patchAttributes routine.
    if (!isUndefined(rawValue) && !isNull(rawValue)) {
        const stringifiedValue = String(rawValue);
        value = stringifiedValue.length
            ? ` ${name}="${htmlEscape(stringifiedValue, true)}"`
            : ` ${name}`;
    }
    return value;
}

function serializeClassAttribute(part: VStaticPartElement, classToken: string) {
    const classMap = getMapFromClassName(part.data?.className);
    // Trim the leading and trailing whitespace here because classToken contains a leading space and
    // there will be a trailing space if classMap is empty.
    const computedClassName = `${classToken} ${keys(classMap).join(' ')}`.trim();
    return computedClassName.length ? ` class="${htmlEscape(computedClassName, true)}"` : '';
}

function buildParseFragmentFn(
    createFragmentFn: (html: string, renderer: RendererAPI) => Element
): (strings: string[], ...keys: (string | number)[]) => () => Element {
    return function parseFragment(strings: string[], ...keys: (string | number)[]) {
        return function applyFragmentParts(parts?: VStaticPart[]): Element {
            const {
                context: { hasScopedStyles, stylesheetToken, legacyStylesheetToken },
                shadowMode,
                renderer,
            } = getVMBeingRendered()!;
            const hasStyleToken = !isUndefined(stylesheetToken);
            const isSyntheticShadow = shadowMode === ShadowMode.Synthetic;
            const hasLegacyToken =
                lwcRuntimeFlags.ENABLE_LEGACY_SCOPE_TOKENS && !isUndefined(legacyStylesheetToken);

            let cacheKey = 0;
            if (hasStyleToken && hasScopedStyles) {
                cacheKey |= FragmentCacheKey.HAS_SCOPED_STYLE;
            }
            if (hasStyleToken && isSyntheticShadow) {
                cacheKey |= FragmentCacheKey.SHADOW_MODE_SYNTHETIC;
            }

            // Cache is only here to prevent calling innerHTML multiple times which doesn't happen on the server.
            if (process.env.IS_BROWSER) {
                // Disable this on the server to prevent cache poisoning when expressions are used.
                const cached = getFromFragmentCache(cacheKey, strings);
                if (!isUndefined(cached)) {
                    return cached;
                }
            }

            // See W-16614556
            if (
                (hasStyleToken && !isValidScopeToken(stylesheetToken)) ||
                (hasLegacyToken && !isValidScopeToken(legacyStylesheetToken))
            ) {
                throw new Error('stylesheet token must be a valid string');
            }

            // If legacy stylesheet tokens are required, then add them to the rendered string
            const stylesheetTokenToRender =
                stylesheetToken + (hasLegacyToken ? ` ${legacyStylesheetToken}` : '');

            const classToken =
                hasScopedStyles && hasStyleToken ? ' ' + stylesheetTokenToRender : '';
            const classAttrToken =
                hasScopedStyles && hasStyleToken ? ` class="${stylesheetTokenToRender}"` : '';
            const attrToken =
                hasStyleToken && isSyntheticShadow ? ' ' + stylesheetTokenToRender : '';
            // In the browser, we provide the entire class attribute as a perf optimization to avoid applying it on mount.
            // The remaining class expression will be applied when the static parts are mounted.
            // In SSR, the entire class attribute (expression included) is assembled along with the fragment.
            // This is why in the browser we provide the entire class attribute and in SSR we only provide the class token.
            const exprClassToken = process.env.IS_BROWSER ? classAttrToken : classToken;

            // TODO [#3624]: The implementation of this function should be specific to @lwc/engine-dom and @lwc/engine-server.
            // Find a way to split this in a future refactor.
            const serializeExpression = buildSerializeExpressionFn(parts);

            let htmlFragment = '';
            for (let i = 0, n = keys.length; i < n; i++) {
                switch (keys[i]) {
                    case 0: // styleToken in existing class attr
                        htmlFragment += strings[i] + classToken;
                        break;
                    case 1: // styleToken for added class attr
                        htmlFragment += strings[i] + classAttrToken;
                        break;
                    case 2: // styleToken as attr
                        htmlFragment += strings[i] + attrToken;
                        break;
                    case 3: // ${1}${2}
                        htmlFragment += strings[i] + classAttrToken + attrToken;
                        break;
                    default: // expressions ${partId:attributeName/textId}
                        htmlFragment +=
                            strings[i] + serializeExpression(keys[i] as string, exprClassToken);
                        break;
                }
            }

            htmlFragment += strings[strings.length - 1];

            const element = createFragmentFn(htmlFragment, renderer);

            // Cache is only here to prevent calling innerHTML multiple times which doesn't happen on the server.
            if (process.env.IS_BROWSER) {
                setInFragmentCache(cacheKey, strings, element);
            }

            return element;
        };
    };
}

// Note: at the moment this code executes, we don't have a renderer yet.
export const parseFragment = buildParseFragmentFn((html, renderer) => {
    const { createFragment } = renderer;
    return createFragment(html);
});

export const parseSVGFragment = buildParseFragmentFn((html, renderer) => {
    const { createFragment, getFirstChild } = renderer;
    const fragment = createFragment('<svg>' + html + '</svg>');
    return getFirstChild(fragment);
});

export function evaluateTemplate(vm: VM, html: Template): VNodes {
    if (process.env.NODE_ENV !== 'production') {
        // in dev-mode, we support hot swapping of templates, which means that
        // the component instance might be attempting to use an old version of
        // the template, while internally, we have a replacement for it.
        html = getTemplateOrSwappedTemplate(html);
    }
    const isUpdatingTemplateInception = isUpdatingTemplate;
    const vmOfTemplateBeingUpdatedInception = vmBeingRendered;
    let vnodes: MutableVNodes = [];

    runWithBoundaryProtection(
        vm,
        vm.owner,
        () => {
            // pre
            vmBeingRendered = vm;
            logOperationStart(OperationId.Render, vm);
        },
        () => {
            // job
            const { component, context, cmpSlots, cmpTemplate, tro } = vm;
            tro.observe(() => {
                // Reset the cache memoizer for template when needed.
                if (html !== cmpTemplate) {
                    // Check that the template was built by the compiler.
                    if (!isTemplateRegistered(html)) {
                        throw new TypeError(
                            `Invalid template returned by the render() method on ${
                                vm.tagName
                            }. It must return an imported template (e.g.: \`import html from "./${
                                vm.def.name
                            }.html"\`), instead, it has returned: ${toString(html)}.`
                        );
                    }

                    checkHasMatchingRenderMode(html, vm);

                    // Perf opt: do not reset the shadow root during the first rendering (there is
                    // nothing to reset).
                    if (!isNull(cmpTemplate)) {
                        // It is important to reset the content to avoid reusing similar elements
                        // generated from a different template, because they could have similar IDs,
                        // and snabbdom just rely on the IDs.
                        resetComponentRoot(vm);
                    }

                    vm.cmpTemplate = html;

                    // Create a brand new template cache for the swapped templated.
                    context.tplCache = create(null);

                    // Set the computeHasScopedStyles property in the context, to avoid recomputing it repeatedly.
                    context.hasScopedStyles = computeHasScopedStyles(html, vm);

                    // Update the scoping token on the host element.
                    updateStylesheetToken(vm, html, /* legacy */ false);
                    if (lwcRuntimeFlags.ENABLE_LEGACY_SCOPE_TOKENS) {
                        updateStylesheetToken(vm, html, /* legacy */ true);
                    }

                    // Evaluate, create stylesheet and cache the produced VNode for future
                    // re-rendering.
                    const stylesheetsContent = getStylesheetsContent(vm, html);
                    context.styleVNodes =
                        stylesheetsContent.length === 0
                            ? null
                            : createStylesheet(vm, stylesheetsContent);
                }

                if (process.env.NODE_ENV !== 'production') {
                    // validating slots in every rendering since the allocated content might change over time
                    validateSlots(vm);
                    // add the VM to the list of host VMs that can be re-rendered if html is swapped
                    setActiveVM(vm);
                }

                // right before producing the vnodes, we clear up all internal references
                // to custom elements from the template.
                vm.velements = [];
                // Set the global flag that template is being updated
                isUpdatingTemplate = true;

                vnodes = html.call(
                    undefined,
                    api,
                    component,
                    cmpSlots,
                    context.tplCache
                ) as MutableVNodes;
                const { styleVNodes } = context;
                if (!isNull(styleVNodes)) {
                    ArrayUnshift.apply(vnodes, styleVNodes);
                }
            });
        },
        () => {
            // post
            isUpdatingTemplate = isUpdatingTemplateInception;
            vmBeingRendered = vmOfTemplateBeingUpdatedInception;

            logOperationEnd(OperationId.Render, vm);
        }
    );

    if (process.env.NODE_ENV !== 'production') {
        if (!isArray(vnodes)) {
            logError(`Compiler should produce html functions that always return an array.`);
        }
    }
    return vnodes;
}

function computeHasScopedStylesInStylesheets(stylesheets: Stylesheets | undefined | null): boolean {
    if (hasStyles(stylesheets)) {
        for (let i = 0; i < stylesheets.length; i++) {
            if (isTrue((stylesheets[i] as any)[KEY__SCOPED_CSS])) {
                return true;
            }
        }
    }
    return false;
}

export function computeHasScopedStyles(template: Template, vm: VM | undefined): boolean {
    const { stylesheets } = template;
    const vmStylesheets = !isUndefined(vm) ? vm.stylesheets : null;

    return (
        computeHasScopedStylesInStylesheets(stylesheets) ||
        computeHasScopedStylesInStylesheets(vmStylesheets)
    );
}

export function hasStyles(stylesheets: Stylesheets | undefined | null): stylesheets is Stylesheets {
    return !isUndefined(stylesheets) && !isNull(stylesheets) && stylesheets.length > 0;
}
