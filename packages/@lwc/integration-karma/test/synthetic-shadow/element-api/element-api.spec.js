import { createElement } from 'lwc';

import Container from 'x/container';
import ParentSpecialized from 'x/parentSpecialized';

/**
 <div>
     <x-container>
         <p>ctx first text</p>
         <div>
             <x-slot-container>
                 <p>slot-container text</p>
                 <x-with-slot>
                     <p>with-slot text</p>
                     <slot>
                         <div class="slotted">
                            <p>slotted text</p>
                        </div>
                     </slot>
                 </x-with-slot>
             </x-slot-container>
             <div class="manual-ctx">
                 <x-manually-inserted>
                     <p>slot-container text</p>
                     <x-with-slot>
                         <p>with-slot text</p>
                         <slot>
                             <div class="slotted">
                                <p>slotted text</p>
                             </div>
                         </slot>
                     </x-with-slot>
                 </x-manually-inserted>
             </div>
         </div>
         <p>ctx last text</p>
     </x-container>
 </div>
 */
if (!process.env.NATIVE_SHADOW) {
    describe('synthetic shadow with patch flags OFF', () => {
        let lwcElementInsideShadow,
            divManuallyApendedToShadow,
            elementInShadow,
            slottedComponent,
            slottedNode,
            elementOutsideLWC,
            rootLwcElement,
            cmpShadow;
        beforeEach(() => {
            spyOn(console, 'warn'); // ignore warning about manipulating node without lwc:dom="manual"
            const elm = createElement('x-container', { is: Container });

            elementOutsideLWC = document.createElement('div');
            elementOutsideLWC.appendChild(elm);

            document.body.appendChild(elementOutsideLWC);

            rootLwcElement = elm;
            lwcElementInsideShadow = elm;
            divManuallyApendedToShadow = elm.shadowRoot.querySelector('div.manual-ctx');
            cmpShadow = elm.shadowRoot.querySelector('x-slot-container').shadowRoot;
            elementInShadow = rootLwcElement.shadowRoot.querySelector('div');
            slottedComponent = cmpShadow.querySelector('x-with-slot');
            slottedNode = cmpShadow.querySelector('.slotted');
        });

        describe('Element.prototype API', () => {
            it('should keep behavior for innerHTML', () => {
                expect(elementOutsideLWC.innerHTML.length).toBe(455);
                expect(rootLwcElement.innerHTML.length).toBe(0);
                expect(lwcElementInsideShadow.innerHTML.length).toBe(0);

                expect(divManuallyApendedToShadow.innerHTML.length).toBe(176); // <x-manually-inserted><p>slot-container text</p><x-with-slot><p>with

                expect(cmpShadow.innerHTML.length).toBe(99);

                expect(slottedComponent.innerHTML.length).toBe(46);
                expect(slottedNode.innerHTML.length).toBe(19);
            });

            it('should keep behavior for outerHTML', () => {
                expect(elementOutsideLWC.outerHTML.length).toBe(466);
                expect(rootLwcElement.outerHTML.length).toBe(27);
                expect(lwcElementInsideShadow.outerHTML.length).toBe(27);

                expect(divManuallyApendedToShadow.outerHTML.length).toBe(206); // <div class="manual-ctx"><x-manually-inserted><p>slot-container text</p><x-with-slot><p>wi ....

                expect(cmpShadow.outerHTML).toBe(undefined);

                expect(slottedComponent.outerHTML.length).toBe(73);
                expect(slottedNode.outerHTML.length).toBe(46);
            });

            it('should keep behavior for children', () => {
                expect(elementOutsideLWC.children.length).toBe(1);
                expect(rootLwcElement.children.length).toBe(0);
                expect(lwcElementInsideShadow.children.length).toBe(0);

                expect(divManuallyApendedToShadow.children.length).toBe(1);

                expect(cmpShadow.children.length).toBe(2);

                expect(slottedComponent.children.length).toBe(1);
                expect(slottedNode.children.length).toBe(1);
            });

            it('should keep behavior for firstElementChild', () => {
                expect(elementOutsideLWC.firstElementChild.tagName).toBe('X-CONTAINER');
                expect(rootLwcElement.firstElementChild).toBe(null);
                expect(lwcElementInsideShadow.firstElementChild).toBe(null);

                expect(divManuallyApendedToShadow.firstElementChild.tagName).toBe(
                    'X-MANUALLY-INSERTED'
                );

                expect(cmpShadow.firstElementChild.tagName).toBe('P');

                expect(slottedComponent.firstElementChild.tagName).toBe('DIV');
                expect(slottedNode.firstElementChild.tagName).toBe('P');
            });

            it('should keep behavior for lastElementChild', () => {
                expect(elementOutsideLWC.lastElementChild.tagName).toBe('X-CONTAINER');
                expect(rootLwcElement.lastElementChild).toBe(null);
                expect(lwcElementInsideShadow.lastElementChild).toBe(null);

                expect(divManuallyApendedToShadow.lastElementChild.tagName).toBe(
                    'X-MANUALLY-INSERTED'
                );

                expect(cmpShadow.lastElementChild.tagName).toBe('X-WITH-SLOT');

                expect(slottedComponent.lastElementChild.tagName).toBe('DIV');
                expect(slottedNode.lastElementChild.tagName).toBe('P');
            });

            describe('querySelector', () => {
                it('should preserve element outside lwc boundary behavior', () => {
                    expect(elementOutsideLWC.querySelector('p').innerText).toBe('ctx first text');
                    expect(elementOutsideLWC.querySelector('x-with-slot p').innerText).toBe(
                        'with-slot text'
                    );
                    expect(
                        elementOutsideLWC.querySelector('.manual-ctx x-with-slot p').innerText
                    ).toBe('with-slot text');
                    expect(elementOutsideLWC.querySelector('div.slotted')).not.toBe(null);
                });

                it('should preserve root custom element behavior', () => {
                    expect(rootLwcElement.querySelector('p')).toBe(null);
                    expect(rootLwcElement.querySelector('x-with-slot p')).toBe(null);
                    expect(rootLwcElement.querySelector('.manual-ctx x-with-slot p')).toBe(null);
                });

                it('should preserve behavior for element inside shadow', () => {
                    const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');

                    expect(elemInShadow.querySelector('x-slot-container')).not.toBe(null);
                    expect(elemInShadow.querySelector('x-with-slot p')).toBe(null);
                });

                it('should preserve behavior for shadowRoot', () => {
                    expect(cmpShadow.querySelector('p').innerText).toBe('slot-container text');
                    expect(cmpShadow.querySelector('x-with-slot p').innerText).toBe('slotted text'); // skipped the one in the shadow of x-with-slot.
                });

                it('should preserve behavior for manually inserted element in shadow and with lwc components', () => {
                    expect(divManuallyApendedToShadow.querySelector('p').innerText).toBe(
                        'slot-container text'
                    );
                    expect(
                        divManuallyApendedToShadow.querySelector('x-with-slot p').innerText
                    ).toBe('with-slot text');
                    expect(divManuallyApendedToShadow.querySelector('div.slotted')).not.toBe(null);
                });
            });

            it('should preserve behavior for querySelectorAll', () => {
                expect(elementOutsideLWC.querySelectorAll('p').length).toBe(8);
                expect(rootLwcElement.querySelectorAll('p').length).toBe(0);

                const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');

                // everything is inside a shadow, :+1:
                expect(elemInShadow.querySelectorAll('p').length).toBe(0);

                expect(cmpShadow.querySelectorAll('p').length).toBe(2); // slotted elements
                expect(slottedComponent.querySelectorAll('p').length).toBe(1);
                expect(divManuallyApendedToShadow.querySelectorAll('p').length).toBe(3);
            });

            it('should preserve behavior for getElementsByTagName', () => {
                expect(elementOutsideLWC.getElementsByTagName('p').length).toBe(8);
                // This is an exception: not patching root lwc elements
                expect(rootLwcElement.getElementsByTagName('p').length).toBe(8);

                // f, same, restricting this.
                // const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
                // expect(elemInShadow.getElementsByTagName('p').length).toBe(6);

                // getElementsByTagName is not supported in the shadowRoot
                // expect(cmpShadow.getElementsByTagName('p').length).toBe(2);

                // f: restricting, you should only get 1, that is inside the slot
                // expect(slottedComponent.getElementsByTagName('p').length).toBe(2);
                expect(slottedComponent.getElementsByTagName('p').length).toBe(1);

                expect(divManuallyApendedToShadow.getElementsByTagName('p').length).toBe(3);
            });

            it('should preserve behavior for getElementsByClassName', () => {
                expect(elementOutsideLWC.getElementsByClassName('slotted').length).toBe(2);
                // This is an exception: not patching root lwc elements
                expect(rootLwcElement.getElementsByClassName('slotted').length).toBe(2);

                // f: inside shadow
                // const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
                // expect(elemInShadow.getElementsByClassName('slotted').length).toBe(2);

                // getElementsByTagName is not supported in the shadowRoot
                // expect(cmpShadow.getElementsByTagName('p').length).toBe(2);

                expect(slottedComponent.getElementsByClassName('slotted').length).toBe(1);

                expect(divManuallyApendedToShadow.getElementsByClassName('slotted').length).toBe(1);
            });
        });

        describe('Node.prototype API', () => {
            it('should preserve behaviour for firstChild', () => {
                expect(elementOutsideLWC.firstChild.tagName).toBe('X-CONTAINER');
                expect(rootLwcElement.firstChild).toBe(null);
                expect(lwcElementInsideShadow.firstChild).toBe(null);

                expect(elementInShadow.firstChild.tagName).toBe('X-SLOT-CONTAINER');
                expect(divManuallyApendedToShadow.firstChild.tagName).toBe('X-MANUALLY-INSERTED');

                expect(cmpShadow.firstChild.tagName).toBe('P');

                expect(slottedComponent.firstChild.tagName).toBe('DIV');
                expect(slottedNode.firstChild.tagName).toBe('P');
            });

            it('should preserve behaviour for lastChild', () => {
                expect(elementOutsideLWC.lastChild.tagName).toBe('X-CONTAINER');
                expect(rootLwcElement.lastChild).toBe(null);
                expect(lwcElementInsideShadow.lastChild).toBe(null);

                expect(elementInShadow.lastChild.tagName).toBe('DIV');
                expect(divManuallyApendedToShadow.lastChild.tagName).toBe('X-MANUALLY-INSERTED');

                expect(cmpShadow.lastChild.tagName).toBe('X-WITH-SLOT');

                expect(slottedComponent.lastChild.tagName).toBe('DIV');
                expect(slottedNode.lastChild.tagName).toBe('P');
            });

            it('should preserve behaviour for textContent', () => {
                expect(elementOutsideLWC.textContent.length).toBe(117);
                expect(rootLwcElement.textContent.length).toBe(0);
                expect(lwcElementInsideShadow.textContent.length).toBe(0);

                expect(elementInShadow.textContent.length).toBe(0);
                expect(divManuallyApendedToShadow.textContent.length).toBe(45);

                expect(cmpShadow.textContent.length).toBe(31);

                expect(slottedComponent.textContent.length).toBe(12);
                expect(slottedNode.textContent.length).toBe(12);
            });

            it('should preserve behaviour for parentNode', () => {
                expect(elementOutsideLWC.parentNode.tagName).toBe('BODY');
                expect(rootLwcElement.parentNode.tagName).toBe('DIV');
                expect(lwcElementInsideShadow.parentNode.tagName).toBe('DIV');

                expect(elementInShadow.parentNode).toBe(rootLwcElement.shadowRoot);
                expect(divManuallyApendedToShadow.parentNode.tagName).toBe('DIV');

                expect(cmpShadow.parentNode).toBe(null);

                const slotContainer = rootLwcElement.shadowRoot.querySelector('x-slot-container');
                expect(slottedComponent.parentNode).toBe(slotContainer.shadowRoot);

                // Note: check, but this is may be difference with the native shadow
                expect(slottedNode.parentNode.tagName).toBe('X-WITH-SLOT');
            });

            it('should preserve parentNode behavior when node was manually inserted', () => {
                // this is a specialized test only for parentNode and parentElement
                const lwcElem = createElement('x-parent-specialized', { is: ParentSpecialized });
                const containingElement = document.createElement('div');
                containingElement.appendChild(lwcElem);
                document.body.appendChild(containingElement);

                const lwcRenderedNode = lwcElem.shadowRoot.querySelector('.lwc-rendered');
                const manualRenderedNode = lwcElem.shadowRoot.querySelector('.manual-rendered');

                expect(lwcRenderedNode.parentNode).toBe(lwcElem.shadowRoot);
                // is returning the custom element instead of the shadow root
                expect(manualRenderedNode.parentNode).toBe(lwcElem);
            });

            it('should preserve behaviour for parentElement', () => {
                expect(elementOutsideLWC.parentElement.tagName).toBe('BODY');
                expect(rootLwcElement.parentElement.tagName).toBe('DIV');
                expect(lwcElementInsideShadow.parentElement.tagName).toBe('DIV');

                expect(elementInShadow.parentElement).toBe(null);
                expect(divManuallyApendedToShadow.parentElement.tagName).toBe('DIV');

                expect(cmpShadow.parentElement).toBe(null);

                expect(slottedComponent.parentElement).toBe(null);

                // Note: check, but this is may be difference with the native shadow
                expect(slottedNode.parentElement.tagName).toBe('X-WITH-SLOT');
            });

            it('should preserve parentElement behavior when node was manually inserted', () => {
                // this is a specialized test only for parentNode and parentElement
                const lwcElem = createElement('x-parent-specialized', { is: ParentSpecialized });
                const containingElement = document.createElement('div');
                containingElement.appendChild(lwcElem);
                document.body.appendChild(containingElement);

                const lwcRenderedNode = lwcElem.shadowRoot.querySelector('.lwc-rendered');
                const manualRenderedNode = lwcElem.shadowRoot.querySelector('.manual-rendered');

                expect(lwcRenderedNode.parentElement).toBe(null);
                // is returning the custom element instead of the shadow root
                expect(manualRenderedNode.parentElement).toBe(lwcElem);
            });

            it('should preserve childNodes behavior', () => {
                expect(elementOutsideLWC.childNodes.length).toBe(1);

                expect(rootLwcElement.childNodes.length).toBe(0);
                expect(lwcElementInsideShadow.childNodes.length).toBe(0);
                expect(slottedComponent.childNodes.length).toBe(1);

                expect(divManuallyApendedToShadow.childNodes.length).toBe(1);

                expect(cmpShadow.childNodes.length).toBe(2);

                expect(slottedNode.childNodes.length).toBe(1);
            });

            it('should preserve hasChildNodes behavior', () => {
                expect(elementOutsideLWC.hasChildNodes()).toBe(true);
                expect(rootLwcElement.hasChildNodes()).toBe(false);
                expect(lwcElementInsideShadow.hasChildNodes()).toBe(false);

                expect(divManuallyApendedToShadow.hasChildNodes()).toBe(true);

                expect(cmpShadow.hasChildNodes()).toBe(true);

                expect(slottedComponent.hasChildNodes()).toBe(true);
                expect(slottedNode.hasChildNodes()).toBe(true);
            });

            it('should preserve compareDocumentPosition behavior', () => {
                expect(
                    elementOutsideLWC.compareDocumentPosition(lwcElementInsideShadow) &
                        Node.DOCUMENT_POSITION_CONTAINED_BY
                ).toBeGreaterThan(0);

                expect(
                    rootLwcElement.compareDocumentPosition(elementOutsideLWC) &
                        Node.DOCUMENT_POSITION_CONTAINS
                ).toBeGreaterThan(0);
                expect(
                    lwcElementInsideShadow.compareDocumentPosition(divManuallyApendedToShadow) &
                        Node.DOCUMENT_POSITION_FOLLOWING
                ).toBeGreaterThan(0);

                expect(
                    divManuallyApendedToShadow.compareDocumentPosition(elementOutsideLWC) &
                        Node.DOCUMENT_POSITION_CONTAINS
                ).toBeGreaterThan(0);

                expect(
                    cmpShadow.compareDocumentPosition(slottedNode) &
                        Node.DOCUMENT_POSITION_CONTAINED_BY
                ).toBeGreaterThan(0);
            });

            it('should preserve contains behavior', () => {
                expect(elementOutsideLWC.contains(lwcElementInsideShadow)).toBe(true);

                expect(rootLwcElement.contains(elementOutsideLWC)).toBe(false);
                expect(lwcElementInsideShadow.contains(divManuallyApendedToShadow)).toBe(true);

                expect(divManuallyApendedToShadow.contains(elementOutsideLWC)).toBe(false);

                expect(cmpShadow.contains(slottedNode)).toBe(true);
            });
        });
    });
}

describe('synthetic shadow for mixed mode', () => {
    describe('Element.prototype API', () => {
        it('should preseve assignedSlot behavior', () => {
            const div = document.createElement('div');
            document.body.appendChild(div);

            div.attachShadow({ mode: 'open' }).innerHTML = `
                    <slot></slot>
                `;

            const slotted = document.createElement('div');
            slotted.textContent = 'slotted';
            div.appendChild(slotted);

            const assignedSlot = div.shadowRoot.querySelector('slot');
            expect(slotted.assignedSlot).toBe(assignedSlot);
        });
    });
});
