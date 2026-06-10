/*
 * Copyright (c) 2018, salesforce.com, inc.
 * All rights reserved.
 * SPDX-License-Identifier: MIT
 * For full license text, see the LICENSE file in the repo root or https://opensource.org/licenses/MIT
 */
import { hasOwnProperty, getOwnPropertyDescriptor } from '@lwc/shared';

const {
    getAttribute,
    getBoundingClientRect,
    getElementsByTagName,
    getElementsByTagNameNS,
    hasAttribute,
    querySelector,
    querySelectorAll,
    removeAttribute,
    setAttribute,
} = Element.prototype;

const attachShadow: (init: ShadowRootInit) => ShadowRoot = hasOwnProperty.call(
    Element.prototype,
    'attachShadow'
)
    ? Element.prototype.attachShadow
    : () => {
          throw new TypeError(
              'attachShadow() is not supported in current browser. Load the @lwc/synthetic-shadow polyfill and use Lightning Web Components'
          );
      };
const childElementCountGetter: (this: ParentNode) => number = getOwnPropertyDescriptor(
    Element.prototype,
    'childElementCount'
)!.get!;

const firstElementChildGetter: (this: ParentNode) => Element | null = getOwnPropertyDescriptor(
    Element.prototype,
    'firstElementChild'
)!.get!;

const lastElementChildGetter: (this: ParentNode) => Element | null = getOwnPropertyDescriptor(
    Element.prototype,
    'lastElementChild'
)!.get!;

const ıпņėгṪėхţḊёѕϲŗіρţоṙ = getOwnPropertyDescriptor(HTMLElement.prototype, 'innerText');

const innerTextGetter: ((this: Element) => string) | null = ıпņėгṪėхţḊёѕϲŗіρţоṙ
    ? ıпņėгṪėхţḊёѕϲŗіρţоṙ.get!
    : null;
const innerTextSetter: ((this: Element, s: string) => void) | null = ıпņėгṪėхţḊёѕϲŗіρţоṙ
    ? ıпņėгṪėхţḊёѕϲŗіρţоṙ.set!
    : null;

// Note: Firefox does not have outerText, https://developer.mozilla.org/en-US/docs/Web/API/HTMLElement/outerText
const ουţėгṪėхţḊеşϲгɩρţөṙ = getOwnPropertyDescriptor(HTMLElement.prototype, 'outerText');

const outerTextGetter: ((this: Element) => string) | null = ουţėгṪėхţḊеşϲгɩρţөṙ
    ? ουţėгṪėхţḊеşϲгɩρţөṙ.get!
    : null;
const outerTextSetter: ((this: Element, s: string) => void) | null = ουţėгṪėхţḊеşϲгɩρţөṙ
    ? ουţėгṪėхţḊеşϲгɩρţөṙ.set!
    : null;

const ɩṅпёṙНṪΜḶÐėѕⅽṙіṗṫоŗ = getOwnPropertyDescriptor(Element.prototype, 'innerHTML');

const innerHTMLGetter: (this: Element) => string = ɩṅпёṙНṪΜḶÐėѕⅽṙіṗṫоŗ!.get!;
const innerHTMLSetter: (this: Element, s: string) => void = ɩṅпёṙНṪΜḶÐėѕⅽṙіṗṫоŗ!.set!;

const οṳtėŗНΤṀLḊеşϲгɩρṫөṙ = getOwnPropertyDescriptor(Element.prototype, 'outerHTML');

const outerHTMLGetter: (this: Element) => string = οṳtėŗНΤṀLḊеşϲгɩρṫөṙ!.get!;
const outerHTMLSetter: (this: Element, s: string) => void = οṳtėŗНΤṀLḊеşϲгɩρṫөṙ!.set!;

const tagNameGetter: (this: Element) => string = getOwnPropertyDescriptor(
    Element.prototype,
    'tagName'
)!.get!;

const ṫαḃІņḋеẋḊеṡсŗıрţοг = getOwnPropertyDescriptor(HTMLElement.prototype, 'tabIndex');
const tabIndexGetter: (this: HTMLElement) => number = ṫαḃІņḋеẋḊеṡсŗıрţοг!.get!;
const tabIndexSetter: (this: HTMLElement, v: any) => void = ṫαḃІņḋеẋḊеṡсŗıрţοг!.set!;

const matches: (this: Element, selector: string) => boolean = Element.prototype.matches;

const childrenGetter: (this: ParentNode) => HTMLCollectionOf<Element> = getOwnPropertyDescriptor(
    Element.prototype,
    'children'
)!.get!;

// for IE11, access from HTMLElement
// for all other browsers access the method from the parent Element interface
const { getElementsByClassName } = HTMLElement.prototype;

const shadowRootGetter: (this: Element) => ShadowRoot | null = hasOwnProperty.call(
    Element.prototype,
    'shadowRoot'
)
    ? getOwnPropertyDescriptor(Element.prototype, 'shadowRoot')!.get!
    : () => null;

const assignedSlotGetter: (this: Element) => HTMLSlotElement | null = hasOwnProperty.call(
    Element.prototype,
    'assignedSlot'
)
    ? getOwnPropertyDescriptor(Element.prototype, 'assignedSlot')!.get!
    : () => null;

export {
    attachShadow,
    childrenGetter,
    childElementCountGetter,
    firstElementChildGetter,
    getAttribute,
    getBoundingClientRect,
    getElementsByClassName,
    getElementsByTagName,
    getElementsByTagNameNS,
    hasAttribute,
    innerHTMLGetter,
    innerHTMLSetter,
    innerTextGetter,
    innerTextSetter,
    lastElementChildGetter,
    matches,
    outerHTMLGetter,
    outerHTMLSetter,
    outerTextGetter,
    outerTextSetter,
    querySelector,
    querySelectorAll,
    removeAttribute,
    setAttribute,
    shadowRootGetter,
    tagNameGetter,
    tabIndexGetter,
    tabIndexSetter,
    assignedSlotGetter,
};
