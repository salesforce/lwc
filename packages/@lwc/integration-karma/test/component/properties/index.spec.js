import { createElement } from 'lwc';
import { ariaProperties } from 'test-utils';

import Component from 'x/component';

// This list can grow as we add more properties to the base LightningElement
const expectedEnumerableProps = [
    'accessKey',
    'addEventListener',
    'attachInternals',
    'childNodes',
    'children',
    'classList',
    'dir',
    'dispatchEvent',
    'draggable',
    'firstChild',
    'firstElementChild',
    'getAttribute',
    'getAttributeNS',
    'getBoundingClientRect',
    'getElementsByClassName',
    'getElementsByTagName',
    'hasAttribute',
    'hasAttributeNS',
    'hidden',
    'id',
    'isConnected',
    'lang',
    'lastChild',
    'lastElementChild',
    'ownerDocument',
    'querySelector',
    'querySelectorAll',
    'refs',
    'removeAttribute',
    'removeAttributeNS',
    'removeEventListener',
    'render',
    'setAttribute',
    'setAttributeNS',
    'shadowRoot',
    'spellcheck',
    'tabIndex',
    'tagName',
    'template',
    'title',
    'toString',
    ...ariaProperties,
].sort();

const expectedEnumerableAndWritableProps = [
    'addEventListener',
    'attachInternals',
    'dispatchEvent',
    'getAttribute',
    'getAttributeNS',
    'getBoundingClientRect',
    'getElementsByClassName',
    'getElementsByTagName',
    'hasAttribute',
    'hasAttributeNS',
    'querySelector',
    'querySelectorAll',
    'removeAttribute',
    'removeAttributeNS',
    'removeEventListener',
    'render',
    'setAttribute',
    'setAttributeNS',
    'toString',
];

describe('properties', () => {
    let elm;

    beforeEach(() => {
        elm = createElement('x-component', { is: Component });
        document.body.appendChild(elm);
    });

    it('has expected enumerable properties', () => {
        const props = elm.getEnumerableProps();
        expect(props).toEqual(expectedEnumerableProps);
    });

    it('has expected writable properties', () => {
        const props = elm.getEnumerableAndWritableProps();
        expect(props).toEqual(expectedEnumerableAndWritableProps);
    });

    it('has expected configurable properties', () => {
        const props = elm.getEnumerableAndConfigurableProps();
        expect(props).toEqual([]);
    });
});
