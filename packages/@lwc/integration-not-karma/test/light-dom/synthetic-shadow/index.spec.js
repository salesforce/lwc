import { createElement } from 'lwc';
import { extractDataIds } from 'test-utils';

import LightContainer from 'x/lightContainer';
import ShadowContainer from 'x/shadowContainer';

describe('Light DOM + Synthetic Shadow DOM', () => {
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

        it('getRootNode', () => {
            expect(nodes.p.getRootNode()).toEqual(document);
            expect(nodes.consumer.getRootNode()).toEqual(document);
        });
        // TODO [#2425]: Incorrect serialization
        xit('textContent', () => {
            expect(nodes.p.textContent).toEqual('I am an assigned element.');
            expect(nodes.consumer.textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
            expect(elm.textContent).toEqual('I am an assigned element.I am an assigned text.');
        });
        // TODO [#2425]: Incorrect serialization
        xit('innerHTML', () => {
            expect(nodes.p.innerHTML).toEqual('I am an assigned element.');
            expect(nodes.consumer.innerHTML).toEqual(
                '<p data-id="p">I am an assigned element.</p>I am an assigned text.'
            );
            expect(elm.innerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
        });
        // TODO [#2425]: Incorrect serialization
        xit('outerHTML', () => {
            expect(nodes.p.outerHTML).toEqual('<p data-id="p">I am an assigned element.</p>');
            expect(nodes.consumer.outerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
            expect(elm.outerHTML).toEqual(
                '<x-light-container><x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer></x-light-container>'
            );
        });

        describe('light -> shadow getRootNode()', () => {
            let elm, nodes;
            beforeEach(() => {
                elm = createElement('x-light-container', {
                    is: LightContainer,
                });
                document.body.appendChild(elm);
                nodes = extractDataIds(elm);
            });
            it('with getRootNode', () => {
                expect(nodes.p.getRootNode()).toEqual(document);
                expect(nodes.consumer.getRootNode()).toEqual(document);
            });
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
            expect(nodes.p.textContent).toEqual('I am an assigned element.');
            expect(nodes.consumer.textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
            expect(nodes['light-container'].textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
        });
        it('innerHTML', () => {
            expect(nodes.p.innerHTML).toEqual('I am an assigned element.');
            expect(nodes.consumer.innerHTML).toEqual(
                '<p data-id="p">I am an assigned element.</p>I am an assigned text.'
            );
            expect(nodes['light-container'].innerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
        });
        it('outerHTML', () => {
            expect(nodes.p.outerHTML).toEqual('<p data-id="p">I am an assigned element.</p>');
            expect(nodes.consumer.outerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
            expect(nodes['light-container'].outerHTML).toEqual(
                '<x-light-container data-id="light-container"><x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer></x-light-container>'
            );
        });

        it('static content is with correct shadow', () => {
            const p = elm.shadowRoot.querySelector('p');
            expect(p.contains(p.firstChild)).toBe(true);
        });
    });
});
