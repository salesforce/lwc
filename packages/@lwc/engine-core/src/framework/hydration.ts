/*
 * Copyright (c) 2022, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import {
    isUndefined,
    ArrayJoin,
    arrayEvery,
    assert,
    keys,
    isNull,
    isArray,
    isTrue,
    isString,
    StringToLowerCase,
    APIFeature,
    isAPIFeatureEnabled,
    isFalse,
    StringSplit,
    parseStyleText,
    ArrayFrom,
    ArraySort,
    ArrayFilter,
} from '@lwc/shared';

import { cloneAndOmitKey, shouldBeFormAssociated } from './utils';
import { allocateChildren, mount, removeNode } from './rendering';
import {
    createVM,
    runConnectedCallback,
    VMState,
    RenderMode,
    runRenderedCallback,
    resetRefVNodes,
} from './vm';
import { VNodeType, isVStaticPartElement } from './vnodes';

import { patchProps } from './modules/props';
import { applyEventListeners } from './modules/events';
import { hydrateStaticParts, traverseAndSetElements } from './modules/static-parts';
import { getScopeTokenClass } from './stylesheet';
import { renderComponent } from './component';
import { applyRefs } from './modules/refs';
import { unwrapIfNecessary } from './sanitized-html-content';
import type {
    VNodes,
    VBaseElement,
    VNode,
    VText,
    VComment,
    VElement,
    VCustomElement,
    VStatic,
    VFragment,
    VElementData,
    VStaticPartData,
    VStaticPartText,
} from './vnodes';
import type { VM } from './vm';
import type { RendererAPI } from './renderer';

type Classes = Omit<Set<string>, 'add'>;

// Used as a perf optimization to avoid creating and discarding sets unnecessarily.
const EMPTY_SET: Classes = new Set<string>();

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

// Errors queued during hydration process. Flushed after the node has been mounted.
let hydrationErrors: Array<HydrationError> = [];

class HydrationError {
    errorType: string;
    serverRendered: any;
    clientExpected: any;

    constructor(errorType: string, serverRendered?: any, clientExpected?: any) {
        this.errorType = errorType;
        this.serverRendered = serverRendered;
        this.clientExpected = clientExpected;
    }

    log(context?: Node | null) {
        logHydrationMismatch(this.errorType, this.serverRendered, this.clientExpected, context);
    }
}

class NodeHydrationError extends HydrationError {
    constructor(serverRendered?: any) {
        super('node', serverRendered);
    }

    log(context?: Node | null) {
        logHydrationMismatch(this.errorType, this.serverRendered, context, context);
    }
}

class AttributeHydrationError extends HydrationError {
    log(context?: Node | null) {
        logHydrationMismatch(
            'attribute',
            `${this.errorType}=${this.serverRendered}`,
            `${this.errorType}=${this.clientExpected}`,
            context
        );
    }
}

function logHydrationMismatch(
    errorType: string,
    serverRendered: any,
    clientExpected: any,
    context?: Node | null
) {
    if (process.env.NODE_ENV !== 'production') {
        logWarn(
            `Hydration ${errorType} mismatch on:`,
            context,
            `\n- rendered on server:`,
            serverRendered,
            `\n- expected on client:`,
            clientExpected
        );
    }
}

function isTypeElement(node?: Node): node is Element {
    if (node?.nodeType !== EnvNodeTypes.ELEMENT) {
        queueHydrationError(new NodeHydrationError(node));
        return false;
    }
    return true;
}

/*
    logger.ts converts all args to a string, losing object referenences and has
    legacy bloat which would have meant more pathing.
*/
function logWarn(...args: any) {
    /* eslint-disable-next-line no-console */
    console.warn('[LWC warn:', ...args);
}

export function hydrateRoot(vm: VM) {
    hasMismatch = false;

    runConnectedCallback(vm);
    hydrateVM(vm);
    flushHydrationErrors(vm.renderRoot);
    if (hasMismatch && process.env.NODE_ENV !== 'production') {
        logWarn('Hydration completed with errors.');
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

    flushHydrationErrors(hydratedNode);
    return renderer.nextSibling(hydratedNode);
}

/*
    Log all hydration warnings using the hydrated node so that the objects match.
    When the user hovers over the object in the console it will link to the correct node in the DOM and higlight it.
*/
function flushHydrationErrors(hydratedNode?: Node | null): void {
    hydrationErrors.forEach((error) => error.log(hydratedNode));
    hydrationErrors = [];
}

function queueHydrationError(error: HydrationError): void {
    if (process.env.NODE_ENV !== 'production') {
        hydrationErrors.push(error);
    }
}

const NODE_VALUE_PROP = 'nodeValue';

function validateEqualTextNodeContent(
    node: Node,
    vnode: VText | VStaticPartText,
    renderer: RendererAPI
): boolean {
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

    queueHydrationError(new HydrationError('text content', nodeValue, vnode.text));
    return false;
}

// The validationOptOut static property can be an array of attribute names.
// Any attribute names specified in that array will not be validated, and the
// LWC runtime will assume that VDOM attrs and DOM attrs are in sync.
function getValidationPredicate(
    elm: Node,
    renderer: RendererAPI,
    optOutStaticProp: string[] | true | undefined
): AttrValidationPredicate {
    // `data-lwc-host-mutated` is a special attribute added by the SSR engine itself, which automatically detects
    // host mutations during `connectedCallback`.
    const hostMutatedValue = renderer.getAttribute(elm, 'data-lwc-host-mutated');
    const detectedHostMutations = isString(hostMutatedValue)
        ? new Set(StringSplit.call(hostMutatedValue, / /))
        : undefined;

    // If validationOptOut is true, no attributes will be checked for correctness
    // and the runtime will assume VDOM attrs and DOM attrs are in sync.
    const fullOptOut = isTrue(optOutStaticProp);

    // If validationOptOut is an array of strings, attributes specified in the array will be "opted out". Attributes
    // not specified in the array will still be validated.
    const isValidArray = isArray(optOutStaticProp) && arrayEvery(optOutStaticProp, isString);
    const conditionalOptOut = isValidArray ? new Set(optOutStaticProp) : undefined;

    if (
        process.env.NODE_ENV !== 'production' &&
        !isUndefined(optOutStaticProp) &&
        !isTrue(optOutStaticProp) &&
        !isValidArray
    ) {
        logWarn(
            '`validationOptOut` must be `true` or an array of attributes that should not be validated.'
        );
    }

    return (attrName: string) => {
        // Component wants to opt out of all validation
        if (fullOptOut) {
            return false;
        }
        // Mutations were automatically detected and should be ignored
        if (!isUndefined(detectedHostMutations) && detectedHostMutations.has(attrName)) {
            return false;
        }
        // Component explicitly wants to opt out of certain validations, regardless of auto-detection
        if (!isUndefined(conditionalOptOut) && conditionalOptOut.has(attrName)) {
            return false;
        }
        // Attribute must be validated
        return true;
    };
}

function hydrateText(node: Node, vnode: VText, renderer: RendererAPI): Node | null {
    if (node?.nodeType !== EnvNodeTypes.TEXT) {
        hydrationErrors.push(new NodeHydrationError(node));
        return handleMismatch(node, vnode, renderer);
    }
    return updateTextContent(node, vnode, renderer);
}

function updateTextContent(
    node: Node,
    vnode: VText | VStaticPartText,
    renderer: RendererAPI
): Node | null {
    if (process.env.NODE_ENV !== 'production') {
        validateEqualTextNodeContent(node, vnode, renderer);
    }
    const { setText } = renderer;
    setText(node, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateComment(node: Node, vnode: VComment, renderer: RendererAPI): Node | null {
    //if (!hasCorrectNodeType(vnode, node, EnvNodeTypes.COMMENT, renderer)) {
    if (node?.nodeType !== EnvNodeTypes.COMMENT) {
        hydrationErrors.push(new NodeHydrationError(node));
        return handleMismatch(node, vnode, renderer);
    }
    if (process.env.NODE_ENV !== 'production') {
        const { getProperty } = renderer;
        const nodeValue = getProperty(node, NODE_VALUE_PROP);

        if (nodeValue !== vnode.text) {
            queueHydrationError(new HydrationError('comment', nodeValue, vnode.text));
        }
    }

    const { setProperty } = renderer;
    // We only set the `nodeValue` property here (on a comment), so we don't need
    // to sanitize the content as HTML using `safelySetProperty`
    setProperty(node as Element, NODE_VALUE_PROP, vnode.text ?? null);
    vnode.elm = node;

    return node;
}

function hydrateStaticElement(node: Node, vnode: VStatic, renderer: RendererAPI): Node | null {
    if (
        isTypeElement(node) &&
        isTypeElement(vnode.fragment) &&
        areStaticNodesCompatible(vnode.fragment, node, vnode, renderer)
    ) {
        return hydrateStaticElementParts(node, vnode, renderer);
    }
    return handleMismatch(node, vnode, renderer);
}

function hydrateStaticElementParts(elm: Element, vnode: VStatic, renderer: RendererAPI) {
    const { parts } = vnode;

    if (!isUndefined(parts)) {
        // Elements must first be set on the static part to validate against.
        traverseAndSetElements(elm, parts, renderer);
    }

    if (!haveCompatibleStaticParts(vnode, renderer)) {
        return handleMismatch(elm, vnode, renderer);
    }

    vnode.elm = elm;

    // Hydration only requires applying event listeners and refs.
    // All other expressions should be applied during SSR or through the handleMismatch routine.
    hydrateStaticParts(vnode, renderer);

    return elm;
}

function hydrateFragment(elm: Node, vnode: VFragment, renderer: RendererAPI): Node | null {
    const { children, owner } = vnode;

    hydrateChildren(elm, children, renderer.getProperty(elm, 'parentNode'), owner, true);

    return (vnode.elm = children[children.length - 1]!.elm as Node);
}

function hydrateElement(elm: Node, vnode: VElement, renderer: RendererAPI): Node | null {
    if (!isTypeElement(elm) || !isMatchingElement(vnode, elm, renderer)) {
        return handleMismatch(elm, vnode, renderer);
    }

    vnode.elm = elm;

    const { owner } = vnode;
    const { context } = vnode.data;
    const isDomManual = Boolean(
        !isUndefined(context) && !isUndefined(context.lwc) && context.lwc.dom === 'manual'
    );

    if (isDomManual) {
        // it may be that this element has lwc:inner-html, we need to diff and in case are the same,
        // remove the innerHTML from props so it reuses the existing dom elements.
        const {
            data: { props },
        } = vnode;
        const { getProperty } = renderer;
        if (!isUndefined(props) && !isUndefined(props.innerHTML)) {
            const unwrappedServerInnerHTML = unwrapIfNecessary(getProperty(elm, 'innerHTML'));
            const unwrappedClientInnerHTML = unwrapIfNecessary(props.innerHTML);
            if (unwrappedServerInnerHTML === unwrappedClientInnerHTML) {
                // Do a shallow clone since VNodeData may be shared across VNodes due to hoist optimization
                vnode.data = {
                    ...vnode.data,
                    props: cloneAndOmitKey(props, 'innerHTML'),
                };
            } else {
                queueHydrationError(
                    new HydrationError(
                        'innerHTML',
                        unwrappedServerInnerHTML,
                        unwrappedClientInnerHTML
                    )
                );
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
    const shouldValidateAttr = getValidationPredicate(elm, renderer, validationOptOut);

    // The validationOptOut static property can be an array of attribute names.
    // Any attribute names specified in that array will not be validated, and the
    // LWC runtime will assume that VDOM attrs and DOM attrs are in sync.
    //
    // If validationOptOut is true, no attributes will be checked for correctness
    // and the runtime will assume VDOM attrs and DOM attrs are in sync.
    //
    // Therefore, if validationOptOut is falsey or an array of strings, we need to
    // examine some or all of the custom element's attributes.
    if (!isTypeElement(elm) || !isMatchingElement(vnode, elm, renderer, shouldValidateAttr)) {
        return handleMismatch(elm, vnode, renderer);
    }

    const { sel, mode, ctor, owner } = vnode;
    const { defineCustomElement, getTagName } = renderer;
    const isFormAssociated = shouldBeFormAssociated(ctor);
    defineCustomElement(StringToLowerCase.call(getTagName(elm)), isFormAssociated);

    const vm = createVM(elm, ctor, renderer, {
        mode,
        owner,
        tagName: sel,
        hydrated: true,
    });

    vnode.elm = elm;
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
        hydrateChildren(getFirstChild(elm), vnode.children, elm, vm, false);
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
    let nodeDelta = false;
    let nextNode: Node | null = node;
    const serverNodes =
        process.env.NODE_ENV !== 'production'
            ? Array.from(parentNode?.children).map((c) => c.cloneNode(true))
            : null;
    const { renderer } = owner;
    for (let i = 0; i < children.length; i++) {
        const childVnode = children[i];

        if (!isNull(childVnode)) {
            if (nextNode) {
                nextNode = hydrateNode(nextNode, childVnode, renderer);
            } else {
                nodeDelta = true;
                mount(childVnode, parentNode, renderer, nextNode);
                nextNode = renderer.nextSibling(
                    childVnode.type === VNodeType.Fragment ? childVnode.trailing : childVnode.elm!
                );
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
        nodeDelta = true;
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

    if (nodeDelta) {
        hasMismatch = true;
        // We can't know exactly which node(s) caused the delta, but we can provide context (parent) and the mismatched sets
        if (process.env.NODE_ENV !== 'production') {
            const clientNodes = children.map((c) => c?.elm);
            queueHydrationError(new HydrationError('child node', serverNodes, clientNodes));
        }
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

function isMatchingElement(
    vnode: VBaseElement,
    elm: Element,
    renderer: RendererAPI,
    shouldValidateAttr: AttrValidationPredicate = () => true
) {
    const { getProperty } = renderer;
    if (vnode.sel.toLowerCase() !== getProperty(elm, 'tagName').toLowerCase()) {
        queueHydrationError(new NodeHydrationError(elm));
        return false;
    }

    const { data } = vnode;
    const hasCompatibleAttrs = validateAttrs(vnode, elm, data, renderer, shouldValidateAttr);
    const hasCompatibleClass = shouldValidateAttr('class')
        ? validateClassAttr(vnode, elm, data, renderer)
        : true;
    const hasCompatibleStyle = shouldValidateAttr('style')
        ? validateStyleAttr(vnode, elm, data, renderer)
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
    vnode: VBaseElement | VStatic,
    elm: Element,
    data: VElementData | VStaticPartData,
    renderer: RendererAPI,
    shouldValidateAttr: (attrName: string) => boolean
): boolean {
    const { attrs = {} } = data;

    let nodesAreCompatible = true;

    // Validate attributes, though we could always recovery from those by running the update mods.
    // Note: intentionally ONLY matching vnodes.attrs to elm.attrs, in case SSR is adding extra attributes.
    for (const [attrName, attrValue] of Object.entries(attrs)) {
        if (!shouldValidateAttr(attrName)) {
            continue;
        }
        const { getAttribute } = renderer;
        const elmAttrValue = getAttribute(elm, attrName);
        if (!attributeValuesAreEqual(attrValue, elmAttrValue)) {
            queueHydrationError(
                new AttributeHydrationError(
                    attrName,
                    isNull(elmAttrValue) ? elmAttrValue : `"${elmAttrValue}"`,
                    isNull(attrValue) ? attrValue : `"${attrValue}"`
                )
            );
            nodesAreCompatible = false;
        }
    }

    return nodesAreCompatible;
}

function checkClassesCompatibility(first: Classes, second: Classes): boolean {
    if (first.size !== second.size) {
        return false;
    }
    for (const f of first) {
        if (!second.has(f)) {
            return false;
        }
    }
    for (const s of second) {
        if (!first.has(s)) {
            return false;
        }
    }
    return true;
}

function validateClassAttr(
    vnode: VBaseElement | VStatic,
    elm: Element,
    data: VElementData | VStaticPartData,
    renderer: RendererAPI
): boolean {
    const { owner } = vnode;
    // classMap is never available on VStaticPartData so it can default to undefined
    // casting to prevent TS error.
    const { className, classMap } = data as VElementData;

    // ---------- Step 1: get the classes from the element and the vnode

    // Use a Set because we don't care to validate mismatches for 1) different ordering in SSR vs CSR, or 2)
    // duplicated class names. These don't have an effect on rendered styles.
    const elmClasses = elm.classList.length ? new Set(ArrayFrom(elm.classList)) : EMPTY_SET;
    let vnodeClasses: Classes;

    if (!isUndefined(className)) {
        // ignore empty spaces entirely, filter them out using `filter(..., Boolean)`
        const classes = ArrayFilter.call(StringSplit.call(className, /\s+/), Boolean);
        vnodeClasses = classes.length ? new Set(classes) : EMPTY_SET;
    } else if (!isUndefined(classMap)) {
        const classes = keys(classMap);
        vnodeClasses = classes.length ? new Set(classes) : EMPTY_SET;
    } else {
        vnodeClasses = EMPTY_SET;
    }

    // ---------- Step 2: handle the scope tokens

    // we don't care about legacy for hydration. it's a new use case
    const scopeToken = getScopeTokenClass(owner, /* legacy */ false);

    // Classnames for scoped CSS are added directly to the DOM during rendering,
    // or to the VDOM on the server in the case of SSR. As such, these classnames
    // are never present in VDOM nodes in the browser.
    //
    // Consequently, hydration mismatches will occur if scoped CSS token classnames
    // are rendered during SSR. This needs to be accounted for when validating.
    if (!isNull(scopeToken)) {
        if (vnodeClasses === EMPTY_SET) {
            vnodeClasses = new Set([scopeToken]);
        } else {
            (vnodeClasses as Set<string>).add(scopeToken);
        }
    }

    // This tells us which `*-host` scope token was rendered to the element's class.
    // For now we just ignore any mismatches involving this class.
    // TODO [#4866]: correctly validate the host scope token class
    const elmHostScopeToken = renderer.getAttribute(elm, 'data-lwc-host-scope-token');
    if (!isNull(elmHostScopeToken)) {
        elmClasses.delete(elmHostScopeToken);
        vnodeClasses.delete(elmHostScopeToken);
    }

    // ---------- Step 3: check for compatibility

    const classesAreCompatible = checkClassesCompatibility(vnodeClasses, elmClasses);

    if (process.env.NODE_ENV !== 'production' && !classesAreCompatible) {
        const prettyPrint = (set: Classes) =>
            JSON.stringify(ArrayJoin.call(ArraySort.call(ArrayFrom(set)), ' '));
        queueHydrationError(
            new AttributeHydrationError('class', prettyPrint(elmClasses), prettyPrint(vnodeClasses))
        );
    }

    return classesAreCompatible;
}

function validateStyleAttr(
    vnode: VBaseElement | VStatic,
    elm: Element,
    data: VElementData | VStaticPartData,
    renderer: RendererAPI
): boolean {
    // Note styleDecls is always undefined for VStaticPartData, casting here to default it to undefined
    const { style, styleDecls } = data as VElementData;
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
            expectedStyle.push(`${prop}: ${value + (important ? ' !important' : '')};`);

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

        vnodeStyle = ArrayJoin.call(expectedStyle, ' ');
    }

    if (!nodesAreCompatible) {
        queueHydrationError(
            new AttributeHydrationError('style', `"${elmStyle}"`, `"${vnodeStyle}"`)
        );
    }

    return nodesAreCompatible;
}

function areStaticNodesCompatible(
    clientNode: Node,
    serverNode: Node,
    vnode: VStatic,
    renderer: RendererAPI
) {
    const { getProperty, getAttribute } = renderer;
    const { parts } = vnode;
    let isCompatibleElements = true;

    if (getProperty(clientNode, 'tagName') !== getProperty(serverNode, 'tagName')) {
        queueHydrationError(new NodeHydrationError(serverNode));
        return false;
    }

    const clientAttrsNames: string[] = getProperty(clientNode, 'getAttributeNames').call(
        clientNode
    );

    clientAttrsNames.forEach((attrName) => {
        const clientAttributeValue = getAttribute(clientNode, attrName);
        const serverAttributeValue = getAttribute(serverNode, attrName);
        if (clientAttributeValue !== serverAttributeValue) {
            // Check if the root element attributes have expressions, if it does then we need to delegate hydration
            // validation to haveCompatibleStaticParts.
            // Note if there are no parts then it is a fully static fragment.
            // partId === 0 will always refer to the root element, this is guaranteed by the compiler.
            if (parts?.[0].partId !== 0) {
                queueHydrationError(
                    new AttributeHydrationError(
                        attrName,
                        `"${serverAttributeValue}"`,
                        `"${clientAttributeValue}"`
                    )
                );
                isCompatibleElements = false;
            }
        }
    });

    return isCompatibleElements;
}

function haveCompatibleStaticParts(vnode: VStatic, renderer: RendererAPI) {
    const { parts } = vnode;

    if (isUndefined(parts)) {
        return true;
    }

    const shouldValidateAttr = (data: VStaticPartData, attrName: string) => attrName in data;
    // The validation here relies on 2 key invariants:
    // 1. It's never the case that `parts` is undefined on the server but defined on the client (or vice-versa)
    // 2. It's never the case that `parts` has one length on the server but another on the client
    for (const part of parts) {
        const { elm } = part;
        if (isVStaticPartElement(part)) {
            // !hasCorrectNodeType<Element>(vnode, elm!, EnvNodeTypes.ELEMENT, renderer)
            if (!isTypeElement(elm)) {
                return false;
            }
            const { data } = part;
            const hasMatchingAttrs = validateAttrs(vnode, elm, data, renderer, () => true);
            // Explicitly skip hydration validation when static parts don't contain `style` or `className`.
            // This means the style/class attributes are either static or don't exist on the element and
            // cannot be affected by hydration.
            // We need to do class first, style second to match the ordering of non-static-optimized nodes,
            // otherwise the ordering of console errors is different between the two.
            const hasMatchingClass = shouldValidateAttr(data, 'className')
                ? validateClassAttr(vnode, elm, data, renderer)
                : true;
            const hasMatchingStyleAttr = shouldValidateAttr(data, 'style')
                ? validateStyleAttr(vnode, elm, data, renderer)
                : true;
            if (isFalse(hasMatchingAttrs && hasMatchingClass && hasMatchingStyleAttr)) {
                return false;
            }
        } else {
            // VStaticPartText
            if (elm?.nodeType !== EnvNodeTypes.TEXT) {
                queueHydrationError(new NodeHydrationError(elm));
                return false;
            }
            updateTextContent(elm, part as VStaticPartText, renderer);
        }
    }
    return true;
}
