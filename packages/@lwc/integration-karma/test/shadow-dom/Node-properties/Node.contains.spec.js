import { createElement } from 'lwc';

import Slotted from 'x/slotted';
import Test from 'x/test';

describe('Node.contains', () => {
    it('should return the right value for node outside the shadow tree', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.contains(div)).toBe(false);
    });

    it('should return the right value for standard html elements inside the shadow tree', () => {
        const elm = createElement('x-foo', { is: Test });
        document.body.appendChild(elm);
        const root = elm.shadowRoot;
        const div = root.querySelector('div');
        const p = root.querySelector('p');
        expect(div.contains(p)).toBe(false);

        const span = root.querySelector('span');
        expect(div.contains(span)).toBe(true);
    });

    it('should return the right value for nodes in the same shadow tree', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(shadowRoot.contains(shadowRoot)).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.outer'))).toBe(true);
        expect(shadowRoot.contains(container)).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.slotted'))).toBe(true);
        expect(shadowRoot.contains(shadowRoot.querySelector('.slotted').firstChild)).toBe(true);

        expect(shadowRoot.querySelector('.outer').contains(shadowRoot)).toBe(false);
        expect(shadowRoot.querySelector('.outer').contains(container)).toBe(true);
        expect(
            shadowRoot.querySelector('.outer').contains(shadowRoot.querySelector('.slotted'))
        ).toBe(true);
    });

    it('should return the right value for slotted node', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const { shadowRoot } = elm;
        const container = shadowRoot.querySelector('x-container');

        expect(container.contains(container.shadowRoot)).toBe(false);
        expect(container.contains(container.shadowRoot.firstChild)).toBe(false);

        expect(
            container.shadowRoot
                .querySelector('.container')
                .contains(shadowRoot.querySelector('.slotted'))
        ).toBe(false);
        expect(
            container.shadowRoot
                .querySelector('slot')
                .contains(shadowRoot.querySelector('.slotted'))
        ).toBe(false);
    });

    it('should return false when argument is null or undefined', () => {
        const div = document.createElement('div');
        document.body.appendChild(div);

        expect(div.contains(undefined)).toBe(false);
        expect(div.contains(null)).toBe(false);
    });

    describe('connected nodes', () => {
        it('should return true for self, when self is a simple dom node', () => {
            const div = document.createElement('div');
            document.body.appendChild(div);
            expect(div.contains(div)).toBe(true);
        });

        it('should return true for self, when self is a shadowed node', () => {
            const elm = createElement('x-foo', { is: Test });
            document.body.appendChild(elm);
            const div = elm.shadowRoot.querySelector('div');
            expect(div.contains(div)).toBe(true);
        });

        it('should return true for self, when self is a custom element', () => {
            const elm = createElement('x-foo', { is: Test });
            document.body.appendChild(elm);
            expect(elm.contains(elm)).toBe(true);
        });

        it('should return true for self, when self is a shadowRoot', () => {
            const elm = createElement('x-foo', { is: Test });
            document.body.appendChild(elm);
            const shadowRoot = elm.shadowRoot;
            expect(shadowRoot.contains(shadowRoot)).toBe(true);
        });
    });

    describe('disconnected nodes', () => {
        it('should return true for self, when self is a simple dom node', () => {
            const div = document.createElement('div');
            expect(div.contains(div)).toBe(true);
        });

        it('should return true for self, when self is a custom element', () => {
            const elm = createElement('x-foo', { is: Test });
            expect(elm.contains(elm)).toBe(true);
        });

        it('should return true for self, when self is a shadowRoot', () => {
            const elm = createElement('x-foo', { is: Test });
            const shadowRoot = elm.shadowRoot;
            expect(shadowRoot.contains(shadowRoot)).toBe(true);
        });
    });
});
