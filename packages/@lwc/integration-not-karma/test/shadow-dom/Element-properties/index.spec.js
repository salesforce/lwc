import { createElement } from 'lwc';

import Slotted from 'x/slotted';
import Nested from 'x/nested';
import NestedFallback from 'x/nestedFallback';
import TestWithDiv from 'x/testWithDiv';

describe('Element.querySelector', () => {
    it('should return null if no Element match', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        expect(elm.querySelector('.foo')).toBe(null);
        expect(elm.shadowRoot.querySelector('.foo')).toBe(null);
        expect(elm.shadowRoot.firstChild.querySelector('.foo')).toBe(null);
    });

    it('should return the first matching element', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const slotted1 = elm.shadowRoot.firstChild.firstChild;
        expect(elm.shadowRoot.querySelector('.slotted')).toBe(slotted1);
    });

    it('should return matching elements when are manually inserted in same shadow', () => {
        const elm = createElement('x-test-with-div', { is: TestWithDiv });
        document.body.appendChild(elm);

        const divInsideShadow = elm.shadowRoot.querySelector('div');
        const manuallyInsertedElement = document.createElement('span');

        spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"
        divInsideShadow.appendChild(manuallyInsertedElement);

        const qsResult = divInsideShadow.querySelector('span');

        expect(qsResult).toBe(manuallyInsertedElement);
    });
});

describe('Element.querySelectorAll', () => {
    it('should return an empty NodeList if no Elements match', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const hostQuery = elm.querySelectorAll('.foo');
        expect(hostQuery instanceof NodeList).toBe(true);
        expect(hostQuery.length).toBe(0);

        const shadowRootQuery = elm.shadowRoot.querySelectorAll('.foo');
        expect(shadowRootQuery instanceof NodeList).toBe(true);
        expect(shadowRootQuery.length).toBe(0);

        const shadowTreeQuery = elm.shadowRoot.firstChild.querySelectorAll('.foo');
        expect(shadowTreeQuery instanceof NodeList).toBe(true);
        expect(shadowTreeQuery.length).toBe(0);
    });

    it('should return the all the matching elements', () => {
        const elm = createElement('x-slotted', { is: Slotted });
        document.body.appendChild(elm);

        const slotted1 = elm.shadowRoot.firstChild.firstChild;
        const slotted2 = elm.shadowRoot.firstChild.lastChild;

        const nodeList = elm.shadowRoot.querySelectorAll('.slotted');
        expect(nodeList.length).toBe(2);
        expect(nodeList[0]).toBe(slotted1);
        expect(nodeList[1]).toBe(slotted2);
    });

    it('should return matching elements when are manually inserted in same shadow', () => {
        const elm = createElement('x-test-with-div', { is: TestWithDiv });
        document.body.appendChild(elm);

        const divInsideShadow = elm.shadowRoot.querySelector('div');
        const manuallyInsertedElement = document.createElement('span');

        spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"
        divInsideShadow.appendChild(manuallyInsertedElement);

        const qsResult = divInsideShadow.querySelectorAll('span');

        expect(qsResult.length).toBe(1);
        expect(qsResult[0]).toBe(manuallyInsertedElement);
    });
});

describe('Element.getElementsByTagName', () => {
    it('should return matching elements when are manually inserted in same shadow', () => {
        const elm = createElement('x-test-with-div', { is: TestWithDiv });
        document.body.appendChild(elm);

        const divInsideShadow = elm.shadowRoot.querySelector('div');
        const manuallyInsertedElement = document.createElement('span');

        spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"
        divInsideShadow.appendChild(manuallyInsertedElement);

        const qsResult = divInsideShadow.getElementsByTagName('span');

        expect(qsResult.length).toBe(1);
        expect(qsResult[0]).toBe(manuallyInsertedElement);
    });
});

describe('Element.getElementsByClassName', () => {
    it('should return matching elements when are manually inserted in same shadow', () => {
        const elm = createElement('x-test-with-div', { is: TestWithDiv });
        document.body.appendChild(elm);

        const divInsideShadow = elm.shadowRoot.querySelector('div');
        const manuallyInsertedElement = document.createElement('span');
        manuallyInsertedElement.className = 'test-class';

        spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"
        divInsideShadow.appendChild(manuallyInsertedElement);

        const qsResult = divInsideShadow.getElementsByClassName('test-class');

        expect(qsResult.length).toBe(1);
        expect(qsResult[0]).toBe(manuallyInsertedElement);
    });
});

it('should not match on elements in a different shadow tree', () => {
    const elm = createElement('x-slotted', { is: Slotted });
    document.body.appendChild(elm);

    expect(elm.querySelector('x-slot')).toBe(null);
    expect([...elm.querySelectorAll('x-slot')]).toEqual([]);

    expect(elm.shadowRoot.querySelector('slot')).toBe(null);
    expect([...elm.shadowRoot.querySelectorAll('slot')]).toEqual([]);
});

it('should match on elements in the same shadow tree', () => {
    const elm = createElement('x-slotted', { is: Slotted });
    document.body.appendChild(elm);

    const slotHost = elm.shadowRoot.firstChild;
    const slotted1 = elm.shadowRoot.firstChild.firstChild;
    const slotted2 = elm.shadowRoot.firstChild.lastChild;

    expect(elm.shadowRoot.querySelector('x-slot')).toBe(slotHost);
    expect([...elm.shadowRoot.querySelectorAll('x-slot')]).toEqual([slotHost]);

    expect(elm.shadowRoot.querySelector('.slotted')).toBe(slotted1);
    expect([...elm.shadowRoot.querySelectorAll('.slotted')]).toEqual([slotted1, slotted2]);

    expect(slotHost.querySelector('.slotted')).toBe(slotted1);
    expect([...slotHost.querySelectorAll('.slotted')]).toEqual([slotted1, slotted2]);
});

it('should not match on slotted content', () => {
    const elm = createElement('x-slotted', { is: Slotted });
    document.body.appendChild(elm);

    const slotHost = elm.shadowRoot.firstChild;
    const slot = slotHost.shadowRoot.firstChild.firstChild;

    expect(slotHost.shadowRoot.querySelector('.slotted')).toBe(null);
    expect([...slotHost.shadowRoot.querySelectorAll('.slotted')]).toEqual([]);

    expect(slot.querySelector('.slotted')).toBe(null);
    expect([...slot.querySelectorAll('.slotted')]).toEqual([]);
});

it('should support chaining querySelectors', () => {
    const elm = createElement('x-slotted', { is: Slotted });
    document.body.appendChild(elm);

    const slotted = elm.shadowRoot.firstChild.firstChild;

    expect(elm.shadowRoot.querySelector('x-slot').querySelector('.slotted')).toBe(slotted);
});

it('should support nested slots - multi-level', () => {
    const elm = createElement('x-nested', { is: Nested });
    document.body.appendChild(elm);

    const slotHost = elm.shadowRoot.firstChild;
    const slotsInSlotsHost = slotHost.firstChild;
    const slotted = slotsInSlotsHost.firstChild;

    expect(elm.shadowRoot.querySelector('.slotted')).toBe(slotted);
    expect(slotHost.querySelector('.slotted')).toBe(slotted);
    expect(slotsInSlotsHost.querySelector('.slotted')).toBe(slotted);

    expect(elm.querySelector('.slotted')).toBe(null);
    expect(slotHost.shadowRoot.querySelector('.slotted')).toBe(null);
    expect(slotsInSlotsHost.shadowRoot.querySelector('.slotted')).toBe(null);
});

it('should support nested slots - slotted fallback content', () => {
    const elm = createElement('x-nested-fallback', { is: NestedFallback });
    document.body.appendChild(elm);

    const slotHost = elm.shadowRoot.firstChild;
    const slot = slotHost.firstChild;
    const slotFallback = slot.firstChild;

    expect(elm.shadowRoot.querySelector('.slotted-fallback')).toBe(slotFallback);
    expect(slotHost.querySelector('.slotted-fallback')).toBe(slotFallback);
    expect(slot.querySelector('.slotted-fallback')).toBe(slotFallback);

    expect(elm.querySelector('.slotted-fallback')).toBe(null);
    expect(slotHost.shadowRoot.querySelector('.slotted-fallback')).toBe(null);
});
