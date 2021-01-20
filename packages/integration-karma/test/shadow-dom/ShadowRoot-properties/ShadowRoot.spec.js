import { createElement } from 'lwc';

import Test from 'x/test';

it('ShadowRoot should throw a TypeError when invoking its constructor', () => {
    expect(() => new ShadowRoot()).toThrowError(TypeError);
});

it('ShadowRoot should be a DocumentFragment', () => {
    const elm = createElement('x-test', { is: Test });
    document.body.appendChild(elm);

    const { shadowRoot } = elm;
    expect(shadowRoot.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
    expect(shadowRoot.nodeName).toBe('#document-fragment');
});

describe('Properties overrides', () => {
    describe('Node.previousSibling', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.previousSibling).toBe(null);
        });
    });

    describe('Node.nextSibling', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nextSibling).toBe(null);
        });
    });

    describe('Node.nodeType', () => {
        it('should always return the DocumentFragment type', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
        });
    });

    describe('Node.nodeValue', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.nodeValue).toBe(null);
        });
    });

    describe('Node.ownerDocument', () => {
        it('should return the document the node belong to', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.ownerDocument).toBe(document);
        });
    });

    describe('Node.parentElement', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.parentElement).toBe(null);
        });
    });

    describe('Node.parentNode', () => {
        it('should always return null', () => {
            const elm = createElement('x-test', { is: Test });
            expect(elm.shadowRoot.parentNode).toBe(null);
        });
    });
});

const SHADOW_ROOT_RESTRICTED = ['cloneNode', 'getElementById'];

describe('restrictions', () => {
    let elm;

    beforeAll(() => {
        elm = createElement('x-test', { is: Test });
    });

    for (const methodName of SHADOW_ROOT_RESTRICTED) {
        it(`should throw when accessing ShadowRoot.${methodName} in dev mode`, () => {
            expect(() => elm.shadowRoot[methodName]).toThrowErrorDev(
                Error,
                `Disallowed method "${methodName}" in ShadowRoot.`
            );
        });
    }
});

if (!process.env.NATIVE_SHADOW) {
    describe('synthetic-shadow restrictions', () => {
        let elm;

        beforeAll(() => {
            elm = createElement('x-test', { is: Test });
        });

        it(`should throw when invoking ShadowRoot.elementsFromPoint`, () => {
            expect(() => elm.shadowRoot.elementsFromPoint(0, 0)).toThrowError(
                `Disallowed method "elementsFromPoint" on ShadowRoot.`
            );
        });

        it(`should throw when invoking ShadowRoot.getSelection`, () => {
            expect(() => elm.shadowRoot.getSelection()).toThrowError(
                `Disallowed method "getSelection" on ShadowRoot.`
            );
        });
    });
}
