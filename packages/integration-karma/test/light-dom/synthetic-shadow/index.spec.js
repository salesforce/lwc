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

        if (!process.env.MIXED_SHADOW) {
            it('assignedSlot', () => {
                expect(nodes.p.assignedSlot).toEqual(nodes.slot);
            });
        }

        it('childNodes', () => {
            // TreeWalker is just a convenient way of getting text nodes without using childNodes
            const textNodes = {};
            const walker = document.createTreeWalker(elm, NodeFilter.SHOW_TEXT);
            let node;
            while ((node = walker.nextNode())) {
                textNodes[node.wholeText] = node;
            }
            expect(Array.from(nodes.slot.childNodes)).toEqual([]);
            expect(Array.from(nodes.p.childNodes)).toEqual([
                textNodes['I am an assigned element.'],
            ]);
            expect(Array.from(nodes.consumer.childNodes)).toEqual([
                nodes.p,
                textNodes['I am an assigned text.'],
            ]);
            expect(Array.from(elm.childNodes)).toEqual([nodes.consumer]);
            expect(Array.from(nodes['consumer.shadowRoot'].childNodes)).toEqual([
                nodes.pInShadow,
                nodes.slot,
            ]);
            expect(Array.from(nodes.slot)).toEqual([]);
        });
        it('parentNode', () => {
            expect(nodes.p.parentNode).toEqual(nodes.consumer);
            expect(nodes.consumer.parentNode).toEqual(elm);
        });
        it('parentElement', () => {
            expect(nodes.p.parentElement).toEqual(nodes.consumer);
            expect(nodes.consumer.parentElement).toEqual(elm);
        });
        // TODO [#2424]: Fails because the <p> doesn't have an owner key.
        xit('getRootNode', () => {
            expect(nodes.p.getRootNode()).toEqual(document);
            expect(nodes.consumer.getRootNode()).toEqual(document);
        });
        it('textContent', () => {
            expect(nodes.p.textContent).toEqual('I am an assigned element.');
            expect(nodes.consumer.textContent).toEqual(
                'I am an assigned element.I am an assigned text.'
            );
            expect(elm.textContent).toEqual('I am an assigned element.I am an assigned text.');
        });
        it('innerHTML', () => {
            expect(nodes.p.innerHTML).toEqual('I am an assigned element.');
            expect(nodes.consumer.innerHTML).toEqual(
                '<p data-id="p">I am an assigned element.</p>I am an assigned text.'
            );
            expect(elm.innerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
        });
        it('outerHTML', () => {
            expect(nodes.p.outerHTML).toEqual('<p data-id="p">I am an assigned element.</p>');
            expect(nodes.consumer.outerHTML).toEqual(
                '<x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer>'
            );
            expect(elm.outerHTML).toEqual(
                '<x-light-container><x-consumer data-id="consumer"><p data-id="p">I am an assigned element.</p>I am an assigned text.</x-consumer></x-light-container>'
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

        if (!process.env.MIXED_SHADOW) {
            it('assignedSlot', () => {
                expect(nodes.p.assignedSlot).toEqual(nodes.slot);
            });
        }

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
    });
});
