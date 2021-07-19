import { createElement, setFeatureFlagForTest } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightContainer from 'x/lightContainer';
import ShadowContainer from 'x/shadowContainer';

describe('Light DOM + Synthetic Shadow DOM', () => {
    beforeEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', true);
    });
    afterEach(() => {
        setFeatureFlagForTest('ENABLE_LIGHT_DOM_COMPONENTS', false);
    });

    describe('light -> shadow', () => {
        let elm, nodes;
        beforeEach(() => {
            elm = createElement('x-light-container', {
                is: LightContainer,
            });
            document.body.appendChild(elm);
            nodes = extractDataIds(elm);
        });

        it('assignedNodes', () => {
            expect(nodes.slot.assignedNodes()).toEqual([nodes.p, nodes.p.nextSibling]);
        });
        it('assignedElements', () => {
            expect(nodes.slot.assignedElements()).toEqual([nodes.p]);
        });
        it('assignedSlot', () => {
            expect(nodes.p.assignedSlot).toEqual(nodes.slot);
        });
        it('childNodes', () => {
            expect(Array.from(nodes.slot.childNodes)).toEqual([]);
        });
        it('parentNode', () => {
            expect(nodes.p.parentNode).toEqual(nodes.consumer);
            expect(nodes.consumer.parentNode).toEqual(elm);
        });
        it('parentElement', () => {
            expect(nodes.p.parentElement).toEqual(nodes.consumer);
            expect(nodes.consumer.parentElement).toEqual(elm);
        });
        xit('getRootNode', () => {
            expect(nodes.p.getRootNode()).toEqual(document);
            expect(nodes.consumer.getRootNode()).toEqual(document);
        });
        it('textContent', () => {
            expect(nodes.consumer.textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
        });
        xit('innerHTML', () => {
            expect(nodes.consumer.innerHTML).toEqual(
                '<p data-id="p">I am an assigned element.</p>I am an assigned text.'
            );
        });
        it('outerHTML', () => {
            expect(nodes.consumer.outerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
        });
    });

    describe('shadow -> light -> shadow', () => {
        let elm, nodes;
        beforeEach(() => {
            elm = createElement('x-shadow-container', {
                is: ShadowContainer,
            });
            document.body.appendChild(elm);
            nodes = extractDataIds(elm);
        });

        it('assignedNodes', () => {
            expect(nodes.slot.assignedNodes()).toEqual([nodes.p, nodes.p.nextSibling]);
        });
        it('assignedElements', () => {
            expect(nodes.slot.assignedElements()).toEqual([nodes.p]);
        });
        it('assignedSlot', () => {
            expect(nodes.p.assignedSlot).toEqual(nodes.slot);
        });
        it('childNodes', () => {
            expect(Array.from(nodes.slot.childNodes)).toEqual([]);
        });
        it('parentNode', () => {
            expect(nodes.p.parentNode).toEqual(nodes.consumer);
            expect(nodes.consumer.parentNode).toEqual(nodes['light-container']);
        });
        it('parentElement', () => {
            expect(nodes.p.parentElement).toEqual(nodes.consumer);
            expect(nodes.consumer.parentElement).toEqual(nodes['light-container']);
        });
        it('getRootNode', () => {
            expect(nodes.p.getRootNode()).toEqual(elm.shadowRoot);
            expect(nodes.consumer.getRootNode()).toEqual(elm.shadowRoot);
        });
        it('textContent', () => {
            expect(nodes.consumer.textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
        });
        it('innerHTML', () => {
            expect(nodes.consumer.innerHTML).toEqual(
                '<p data-id="p">I am an assigned element.</p>I am an assigned text.'
            );
        });
        it('outerHTML', () => {
            expect(nodes.consumer.outerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
        });
    });
});
