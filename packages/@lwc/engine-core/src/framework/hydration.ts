/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    ArrayJoin,
    assert,
    keys,
    isNull,
    isArray,
    arrayEvery,
    ArrayFilter,
    ArrayIncludes,
    isTrue,
    isString,
    StringToLowerCase,
    APIFeature,
    isAPIFeatureEnabled,
} from '@lwc/shared';

import { logError, logWarn } from '../shared/logger';

import { RendererAPI } from './renderer';
import { cloneAndOmitKey, parseStyleText } from './utils';
import { allocateChildren, mount, removeNode } from './rendering';
import {
    createVM,
    runConnectedCallback,
    VMState,
    RenderMode,
    LwcDomMode,
    VM,
    runRenderedCallback,
    resetRefVNodes,
} from './vm';
import {
    VNodes,
    VBaseElement,
    VNode,
    VNodeType,
    VText,
    VComment,
    VElement,
    VCustomElement,
    VStatic,
    VFragment,
    isVCustomElement,
} from './vnodes';

import { patchProps } from './modules/props';
import { applyEventListeners } from './modules/events';
import { applyStaticParts } from './modules/static-parts';
import { getScopeTokenClass, getStylesheetTokenHost } from './stylesheet';
import { renderComponent } from './component';
import { applyRefs } from './modules/refs';

// These values are the ones from Node.nodeType (https://developer.mozilla.org/en-US/docs/Web/API/Node/nodeType)
const enum EnvNodeTypes {
    ELEMENT = 1,
    TEXT = 3,
    COMMENT = 8,
}

// A function that indicates whether an attribute with the given name should be validated.
type AttrValidationPredicate = (attrName: string) => boolean;

// flag indicating if the hydration recovered from the DOM mismatch
let hasMismatch = false;
export function hydrateRoot(vm: VM) {
    hasMismatch = false;

    runConnectedCallback(vm);
    hydrateVM(vm);

    if (hasMismatch && process.env.NODE_ENV !== 'production') {
        logError('Hydration completed with errors.', vm);
    }
}

function hydrateVM(vm: VM) {
    const children = renderComponent(vm);
    vm.children = children;

    // reset the refs; they will be set during `hydrateChildren`
    resetRefVNodes(vm);

    const {
        renderRoot: parentNode,
        renderer: { getFirstChild },
    } = vm;
    hydrateChildren(getFirstChild(parentNode), children, parentNode, vm, false);
    runRenderedCallback(vm);
}

function hydrateNode(node: Node, vnode: VNode, renderer: RendererAPI): Node | null {
    let hydratedNode;
    switch (vnode.type) {
        case VNodeType.Text:
            // VText has no special capability, fallback to the owner's renderer
            hydratedNode = hydrateText(node, vnode, renderer);
            break;

        case VNodeType.Comment:
            // VComment has no special capability, fallback to the owner's renderer
            hydratedNode = hydrateComment(node, vnode, renderer);
            break;

        case VNodeType.Static:
            // VStatic are cacheable and cannot have custom renderer associated to them
            hydratedNode = hydrateStaticElement(node, vnode, renderer);
            break;

        case VNodeType.Fragment:
            // a fragment does not represent any element, therefore there is no need to use a custom renderer.
            hydratedNode = hydrateFragment(node, vnode, renderer);
            break;

        case VNodeType.Element:
            hydratedNode = hydrateElement(node, vnode, vnode.data.renderer ?? renderer);
            break;

        case VNodeType.CustomElement:
            hydratedNode = hydrateCustomElement(node, vnode, vnode.data.renderer ?? renderer);
            break;
    }
    return renderer.nextSibling(hydratedNode);
}

const NODE_VALUE_PROP = 'nodeValue';

function textNodeContentsAreEqual(node: Node, vnode: VText, renderer: RendererAPI): boolean {
    const { getProperty } = renderer;
    const nodeValue = getProperty(node, NODE_VALUE_PROP);

    if (nodeValue === vnode.text) {
        return true;
    }

    // Special case for empty text nodes – these are serialized differently on the server
    // See https://github.com/salesforce/lwc/pull/2656
    if (nodeValue === '\u200D' && vnode.text === '') {
        return true;
    }

    return false;
}

// The validationOptOut static property can be an array of attribute names.
// Any attribute names specified in that array will not be validated, and the
// LWC runtime will assume that VDOM attrs and DOM attrs are in sync.
function getValidationPredicate(
    optOutStaticProp: string[] | true | undefined
): AttrValidationPredicate {
    if (isUndefined(optOutStaticProp)) {
        return (_attrName: string) => true;
    }
    // If validationOptOut is true, no attributes will be checked for correctness
    // and the runtime will assume VDOM attrs and DOM attrs are in sync.
    if (isTrue(optOutStaticProp)) {
        return (_attrName: string) => false;
    }
    // If validationOptOut is an array of strings, attributes specified in the
    // array will be "opted out". Attributes not specified in the array will still
    // be validated.
    if (isArray(optOutStaticProp) && arrayEvery<string>(optOutStaticProp, isString)) {
        return (attrName: string) => !ArrayIncludes.call(optOutStaticProp, attrName);
    }
    if (process.env.NODE_ENV !== 'production') {
        logWarn(
            'Validation opt out must be `true` or an array of attributes that should not be validated.'
        );
    }
    return (_attrName: string) => true;
}

function hydrateText(node: Node, vnode: VText, renderer: RendererAPI): Node | null {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.TEXT, renderer)) {
        return handleMismatch(node, vnode, renderer);
    }
    if (process.env.NODE_ENV !== 'production') {
        if (!textNodeContentsAreEqual(node, vnode, renderer)) {
            logWarn(
                'Hydration mismatch: text values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }
    const { setText } = renderer;
    setText(node, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateComment(node: Node, vnode: VComment, renderer: RendererAPI): Node | null {
    if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.COMMENT, renderer)) {
        return handleMismatch(node, vnode, renderer);
    }
    if (process.env.NODE_ENV !== 'production') {
        const { getProperty } = renderer;
        const nodeValue = getProperty(node, NODE_VALUE_PROP);

        if (nodeValue !== vnode.text) {
            logWarn(
                'Hydration mismatch: comment values do not match, will recover from the difference',
                vnode.owner
            );
        }
    }

    const { setProperty } = renderer;
    setProperty(node, NODE_VALUE_PROP, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateStaticElement(elm: Node, vnode: VStatic, renderer: RendererAPI): Node | null {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT, renderer) ||
        !areCompatibleNodes(vnode.fragment, elm, vnode, renderer)
    ) {
        return handleMismatch(elm, vnode, renderer);
    }

    vnode.elm = elm;

    applyStaticParts(elm, vnode, renderer, true);

    return elm;
}

function hydrateFragment(elm: Node, vnode: VFragment, renderer: RendererAPI): Node | null {
    const { children, owner } = vnode;

    hydrateChildren(elm, children, renderer.getProperty(elm, 'parentNode'), owner, true);

    return (vnode.elm = children[children.length - 1]!.elm as Node);
}

function hydrateElement(elm: Node, vnode: VElement, renderer: RendererAPI): Node | null {
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT, renderer) ||
        !isMatchingElement(vnode, elm, renderer)
    ) {
        return handleMismatch(elm, vnode, renderer);
    }

    vnode.elm = elm;

    const { owner } = vnode;
    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === LwcDomMode.Manual
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const {
            data: { props },
        } = vnode;
        const { getProperty } = renderer;
        if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
            if (getProperty(elm, 'innerHTML') === props.innerHTML) {
                // Do a shallow clone since VNodeData may be shared across VNodes due to hoist optimization
                vnode.data = {
                    ...vnode.data,
                    props: cloneAndOmitKey(props, 'innerHTML'),
                };
            } else {
                if (process.env.NODE_ENV !== 'production') {
                    logWarn(
                        `Mismatch hydrating element <${getProperty(
                            elm,
                            'tagName'
                        ).toLowerCase()}>: innerHTML values do not match for element, will recover from the difference`,
                        owner
                    );
                }
            }
        }
    }

    patchElementPropsAndAttrsAndRefs(vnode, renderer);

    if (!isDomManual) {
        const { getFirstChild } = renderer;
        hydrateChildren(getFirstChild(elm), vnode.children, elm, owner, false);
    }

    return elm;
}

function hydrateCustomElement(
    elm: Node,
    vnode: VCustomElement,
    renderer: RendererAPI
): Node | null {
    const { validationOptOut } = vnode.ctor;
    const shouldValidateAttr = getValidationPredicate(validationOptOut);

    // The validationOptOut static property can be an array of attribute names.
    // Any attribute names specified in that array will not be validated, and the
    // LWC runtime will assume that VDOM attrs and DOM attrs are in sync.
    //
    // If validationOptOut is true, no attributes will be checked for correctness
    // and the runtime will assume VDOM attrs and DOM attrs are in sync.
    //
    // Therefore, if validationOptOut is falsey or an array of strings, we need to
    // examine some or all of the custom element's attributes.
    if (
        !hasCorrectNodeType<Element>(vnode, elm, EnvNodeTypes.ELEMENT, renderer) ||
        !isMatchingElement(vnode, elm, renderer, shouldValidateAttr)
    ) {
        return handleMismatch(elm, vnode, renderer);
    }

    const { sel, mode, ctor, owner } = vnode;
    const { defineCustomElement, getTagName } = renderer;
    defineCustomElement(StringToLowerCase.call(getTagName(elm)));

    const vm = createVM(elm, ctor, renderer, {
        mode,
        owner,
        tagName: sel,
        hydrated: true,
    });

    vnode.elm = elm as Element;
    vnode.vm = vm;

    allocateChildren(vnode, vm);
    patchElementPropsAndAttrsAndRefs(vnode, renderer);

    // Insert hook section:
    if (process.env.NODE_ENV !== 'production') {
        assert.isTrue(vm.state === VMState.created, `${vm} cannot be recycled.`);
    }
    runConnectedCallback(vm);

    if (vm.renderMode !== RenderMode.Light) {
        const { getFirstChild } = renderer;
        // VM is not rendering in Light DOM, we can proceed and hydrate the slotted content.
        // Note: for Light DOM, this is handled while hydrating the VM
        hydrateChildren(getFirstChild(elm), vnode.children, elm as Element, vm, false);
    }

    hydrateVM(vm);
    return elm;
}

function hydrateChildren(
    node: Node | null,
    children: VNodes,
    parentNode: Element | ShadowRoot,
    owner: VM,
    // When rendering the children of a VFragment, additional siblings may follow the
    // last node of the fragment. Hydration should not fail if a trailing sibling is
    // found in this case.
    expectAddlSiblings: boolean
) {
    let hasWarned = false;
    let nextNode: Node | null = node;
    const { renderer } = owner;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            if (nextNode) {
                nextNode = hydrateNode(nextNode, childVnode, renderer);
            } else {
                hasMismatch = true;
                if (process.env.NODE_ENV !== 'production') {
                    if (!hasWarned) {
                        hasWarned = true;
                        logError(
                            `Hydration mismatch: incorrect number of rendered nodes. Client produced more nodes than the server.`,
                            owner
                        );
                    }
                }
                mount(childVnode, parentNode, renderer, nextNode);
                nextNode = renderer.nextSibling(childVnode.elm!);
            }
        }
    }

    const useCommentsForBookends = isAPIFeatureEnabled(
        APIFeature.USE_COMMENTS_FOR_FRAGMENT_BOOKENDS,
        owner.apiVersion
    );
    if (
        // If 1) comments are used for bookends, and 2) we're not expecting additional siblings,
        // and 3) there exists an additional sibling, that's a hydration failure.
        //
        // This preserves the previous behavior for text-node bookends where mismatches
        // would incorrectly occur but which is unfortunately baked into the SSR hydration
        // contract. It also preserves the behavior of valid hydration failures where the server
        // rendered more nodes than the client.
        (!useCommentsForBookends || !expectAddlSiblings) &&
        nextNode
    ) {
        hasMismatch = true;
        if (process.env.NODE_ENV !== 'production') {
            if (!hasWarned) {
                logError(
                    `Hydration mismatch: incorrect number of rendered nodes. Server rendered more nodes than the client.`,
                    owner
                );
            }
        }
        // nextSibling is mostly harmless, and since we don't have
        // a good reference to what element to act upon, we instead
        // rely on the vm's associated renderer for navigating to the
        // next node in the list to be hydrated.
        const { nextSibling } = renderer;
        do {
            const current = nextNode;
            nextNode = nextSibling(nextNode);
            removeNode(current, parentNode, renderer);
        } while (nextNode);
    }
}

function handleMismatch(node: Node, vnode: VNode, renderer: RendererAPI): Node | null {
    hasMismatch = true;
    const { getProperty } = renderer;
    const parentNode = getProperty(node, 'parentNode');
    mount(vnode, parentNode, renderer, node);
    removeNode(node, parentNode, renderer);

    return vnode.elm!;
}

function patchElementPropsAndAttrsAndRefs(vnode: VBaseElement, renderer: RendererAPI) {
    applyEventListeners(vnode, renderer);
    patchProps(null, vnode, renderer);
    // The `refs` object is blown away in every re-render, so we always need to re-apply them
    applyRefs(vnode, vnode.owner);
}

function hasCorrectNodeType<T extends Node>(
    vnode: VNode,
    node: Node,
    nodeType: number,
    renderer: RendererAPI
): node is T {
    const { getProperty } = renderer;
    if (getProperty(node, 'nodeType') !== nodeType) {
        if (process.env.NODE_ENV !== 'production') {
            logError('Hydration mismatch: incorrect node type received', vnode.owner);
        }
        return false;
    }

    return true;
}

function isMatchingElement(
    vnode: VBaseElement,
    elm: Element,
    renderer: RendererAPI,
    shouldValidateAttr: AttrValidationPredicate = () => true
) {
    const { getProperty } = renderer;
    if (vnode.sel.toLowerCase() !== getProperty(elm, 'tagName').toLowerCase()) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Hydration mismatch: expecting element with tag "${vnode.sel.toLowerCase()}" but found "${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}".`,
                vnode.owner
            );
        }

        return false;
    }

    const hasCompatibleAttrs = validateAttrs(vnode, elm, renderer, shouldValidateAttr);
    const hasCompatibleClass = shouldValidateAttr('class')
        ? validateClassAttr(vnode, elm, renderer)
        : true;
    const hasCompatibleStyle = shouldValidateAttr('style')
        ? validateStyleAttr(vnode, elm, renderer)
        : true;

    return hasCompatibleAttrs && hasCompatibleClass && hasCompatibleStyle;
}

function attributeValuesAreEqual(
    vnodeValue: string | number | boolean | null | undefined,
    value: string | null
) {
    const vnodeValueAsString = String(vnodeValue);

    if (vnodeValueAsString === value) {
        return true;
    }

    // If the expected value is null, this means that the attribute does not exist. In that case,
    // we accept any nullish value (undefined or null).
    if (isNull(value) && (isUndefined(vnodeValue) || isNull(vnodeValue))) {
        return true;
    }

    // In all other cases, the two values are not considered equal
    return false;
}

function validateAttrs(
    vnode: VBaseElement,
    elm: Element,
    renderer: RendererAPI,
    shouldValidateAttr: (attrName: string) => boolean
): boolean {
    const {
        data: { attrs = {} },
    } = vnode;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        if (!shouldValidateAttr(attrName)) {
            continue;
        }
        const { owner } = vnode;
        const { getAttribute } = renderer;
        const elmAttrValue = getAttribute(elm, attrName);
        if (!attributeValuesAreEqual(attrValue, elmAttrValue)) {
            if (process.env.NODE_ENV !== 'production') {
                const { getProperty } = renderer;
                logError(
                    `Mismatch hydrating element <${getProperty(
                        elm,
                        'tagName'
                    ).toLowerCase()}>: attribute "${attrName}" has different values, expected "${attrValue}" but found ${
                        isNull(elmAttrValue) ? 'null' : `"${elmAttrValue}"`
                    }`,
                    owner
                );
            }
            nodesAreCompatible = false;
        }
    }

    return nodesAreCompatible;
}

function validateClassAttr(vnode: VBaseElement, elm: Element, renderer: RendererAPI): boolean {
    const { data, owner } = vnode;
    let { className, classMap } = data;
    const { getProperty, getClassList, getAttribute } = renderer;
    // we don't care about legacy for hydration. it's a new use case
    const scopedToken = getScopeTokenClass(owner, /* legacy */ false);
    const stylesheetTokenHost = isVCustomElement(vnode) ? getStylesheetTokenHost(vnode) : null;

    // Classnames for scoped CSS are added directly to the DOM during rendering,
    // or to the VDOM on the server in the case of SSR. As such, these classnames
    // are never present in VDOM nodes in the browser.
    //
    // Consequently, hydration mismatches will occur if scoped CSS token classnames
    // are rendered during SSR. This needs to be accounted for when validating.
    if (!isNull(scopedToken) || !isNull(stylesheetTokenHost)) {
        if (!isUndefined(className)) {
            // The order of the className should be scopedToken className stylesheetTokenHost
            const classTokens = [scopedToken, className, stylesheetTokenHost];
            const classNames = ArrayFilter.call(classTokens, (token) => !isNull(token));
            className = ArrayJoin.call(classNames, ' ');
        } else if (!isUndefined(classMap)) {
            classMap = {
                ...classMap,
                ...(!isNull(scopedToken) ? { [scopedToken]: true } : {}),
                ...(!isNull(stylesheetTokenHost) ? { [stylesheetTokenHost]: true } : {}),
            };
        } else {
            // The order of the className should be scopedToken stylesheetTokenHost
            const classTokens = [scopedToken, stylesheetTokenHost];
            const classNames = ArrayFilter.call(classTokens, (token) => !isNull(token));
            if (classNames.length) {
                className = ArrayJoin.call(classNames, ' ');
            }
        }
    }

    let nodesAreCompatible = true;
    let readableVnodeClassname;

    const elmClassName = getAttribute(elm, 'class');

    if (!isUndefined(className) && String(className) !== elmClassName) {
        // className is used when class is bound to an expr.
        nodesAreCompatible = false;
        // stringify for pretty-printing
        readableVnodeClassname = JSON.stringify(className);
    } else if (!isUndefined(classMap)) {
        // classMap is used when class is set to static value.
        const classList = getClassList(elm);
        let computedClassName = '';

        // all classes from the vnode should be in the element.classList
        for (const name in classMap) {
            computedClassName += ' ' + name;
            if (!classList.contains(name)) {
                nodesAreCompatible = false;
            }
        }

        // stringify for pretty-printing
        readableVnodeClassname = JSON.stringify(computedClassName.trim());

        if (classList.length > keys(classMap).length) {
            nodesAreCompatible = false;
        }
    } else if (isUndefined(className) && !isNull(elmClassName)) {
        // SSR contains a className but client-side VDOM does not
        nodesAreCompatible = false;
        readableVnodeClassname = '""';
    }

    if (!nodesAreCompatible) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Mismatch hydrating element <${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}>: attribute "class" has different values, expected ${readableVnodeClassname} but found ${JSON.stringify(
                    elmClassName
                )}`,
                vnode.owner
            );
        }
    }

    return nodesAreCompatible;
}

function validateStyleAttr(vnode: VBaseElement, elm: Element, renderer: RendererAPI): boolean {
    const {
        data: { style, styleDecls },
    } = vnode;
    const { getAttribute } = renderer;
    const elmStyle = getAttribute(elm, 'style') || '';
    let vnodeStyle;
    let nodesAreCompatible = true;

    if (!isUndefined(style) && style !== elmStyle) {
        nodesAreCompatible = false;
        vnodeStyle = style;
    } else if (!isUndefined(styleDecls)) {
        const parsedVnodeStyle = parseStyleText(elmStyle);
        const expectedStyle = [];
        // styleMap is used when style is set to static value.
        for (let i = 0, n = styleDecls.length; i < n; i++) {
            const [prop, value, important] = styleDecls[i];
            expectedStyle.push(`${prop}: ${value + (important ? ' important!' : '')}`);

            const parsedPropValue = parsedVnodeStyle[prop];

            if (isUndefined(parsedPropValue)) {
                nodesAreCompatible = false;
            } else if (!parsedPropValue.startsWith(value)) {
                nodesAreCompatible = false;
            } else if (important && !parsedPropValue.endsWith('!important')) {
                nodesAreCompatible = false;
            }
        }

        if (keys(parsedVnodeStyle).length > styleDecls.length) {
            nodesAreCompatible = false;
        }

        vnodeStyle = ArrayJoin.call(expectedStyle, ';');
    }

    if (!nodesAreCompatible) {
        if (process.env.NODE_ENV !== 'production') {
            const { getProperty } = renderer;
            logError(
                `Mismatch hydrating element <${getProperty(
                    elm,
                    'tagName'
                ).toLowerCase()}>: attribute "style" has different values, expected "${vnodeStyle}" but found "${elmStyle}".`,
                vnode.owner
            );
        }
    }

    return nodesAreCompatible;
}

function areCompatibleNodes(client: Node, ssr: Node, vnode: VNode, renderer: RendererAPI) {
    const { getProperty, getAttribute } = renderer;
    if (getProperty(client, 'nodeType') === EnvNodeTypes.TEXT) {
        if (!hasCorrectNodeType(vnode, ssr, EnvNodeTypes.TEXT, renderer)) {
            return false;
        }

        return getProperty(client, NODE_VALUE_PROP) === getProperty(ssr, NODE_VALUE_PROP);
    }

    if (getProperty(client, 'nodeType') === EnvNodeTypes.COMMENT) {
        if (!hasCorrectNodeType(vnode, ssr, EnvNodeTypes.COMMENT, renderer)) {
            return false;
        }

        return getProperty(client, NODE_VALUE_PROP) === getProperty(ssr, NODE_VALUE_PROP);
    }

    if (!hasCorrectNodeType(vnode, ssr, EnvNodeTypes.ELEMENT, renderer)) {
        return false;
    }

    let isCompatibleElements = true;
    if (getProperty(client, 'tagName') !== getProperty(ssr, 'tagName')) {
        if (process.env.NODE_ENV !== 'production') {
            logError(
                `Hydration mismatch: expecting element with tag "${getProperty(
                    client,
                    'tagName'
                ).toLowerCase()}" but found "${getProperty(ssr, 'tagName').toLowerCase()}".`,
                vnode.owner
            );
        }

        return false;
    }

    const clientAttrsNames: string[] = getProperty(client, 'getAttributeNames').call(client);

    clientAttrsNames.forEach((attrName) => {
        if (getAttribute(client, attrName) !== getAttribute(ssr, attrName)) {
            if (process.env.NODE_ENV !== 'production') {
                logError(
                    `Mismatch hydrating element <${getProperty(
                        client,
                        'tagName'
                    ).toLowerCase()}>: attribute "${attrName}" has different values, expected "${getAttribute(
                        client,
                        attrName
                    )}" but found "${getAttribute(ssr, attrName)}"`,
                    vnode.owner
                );
            }
            isCompatibleElements = false;
        }
    });

    return isCompatibleElements;
}
