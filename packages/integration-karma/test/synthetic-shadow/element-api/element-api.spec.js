import { createElement } from 'lwc';

import Container from 'x/container';

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
        const elm = createElement('x-container', { is: Container });

        const elementOutsideLWC = document.createElement('div');
        elementOutsideLWC.appendChild(elm);

        document.body.appendChild(elementOutsideLWC);

        const rootLwcElement = elm;
        const lwcElementInsideShadow = elm;
        const divManuallyApendedToShadow = elm.shadowRoot.querySelector('div.manual-ctx');
        const cmpShadow = elm.shadowRoot.querySelector('x-slot-container').shadowRoot;
        const slottedComponent = cmpShadow.querySelector('x-with-slot');
        const slottedNode = cmpShadow.querySelector('.slotted');

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
                // f
                // limiting this may be tricky! but pushing it forward
                // expect(rootLwcElement.getElementsByTagName('p').length).toBe(8);

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
                // f: inside shadow.
                // expect(rootLwcElement.getElementsByClassName('slotted').length).toBe(2);

                // f: inside shadow
                // const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
                // expect(elemInShadow.getElementsByClassName('slotted').length).toBe(2);

                // getElementsByTagName is not supported in the shadowRoot
                // expect(cmpShadow.getElementsByTagName('p').length).toBe(2);

                expect(slottedComponent.getElementsByClassName('slotted').length).toBe(1);

                expect(divManuallyApendedToShadow.getElementsByClassName('slotted').length).toBe(1);
            });
        });
    });
}
// describe('synthetic shadow with patch flags ON', () => {
//     const elm = createElement('x-container', { is: Container });
//
//     const elementOutsideLWC = document.createElement('div');
//     elementOutsideLWC.appendChild(elm);
//
//     document.body.appendChild(elementOutsideLWC);
//
//     const rootLwcElement = elm;
//     const lwcElementInsideShadow = elm;
//     const divManuallyApendedToShadow = elm.shadowRoot.querySelector('div.manual-ctx');
//     const cmpShadow = elm.shadowRoot.querySelector('x-slot-container').shadowRoot;
//     const slottedComponent = cmpShadow.querySelector('x-with-slot');
//     const slottedNode = cmpShadow.querySelector('.slotted');
//
//     describe('Element.prototype API', () => {
//         it('should keep behavior for innerHTML', () => {
//             expect(elementOutsideLWC.innerHTML.length).toBe(455);
//             expect(rootLwcElement.innerHTML.length).toBe(0);
//             expect(lwcElementInsideShadow.innerHTML.length).toBe(0);
//
//             expect(divManuallyApendedToShadow.innerHTML.length).toBe(176); // <x-manually-inserted><p>slot-container text</p><x-with-slot><p>with
//
//             expect(cmpShadow.innerHTML.length).toBe(99);
//
//             expect(slottedComponent.innerHTML.length).toBe(46);
//             expect(slottedNode.innerHTML.length).toBe(19);
//         });
//
//         it('should keep behavior for outerHTML', () => {
//             expect(elementOutsideLWC.outerHTML.length).toBe(466);
//             expect(rootLwcElement.outerHTML.length).toBe(27);
//             expect(lwcElementInsideShadow.outerHTML.length).toBe(27);
//
//             expect(divManuallyApendedToShadow.outerHTML.length).toBe(206); // <div class="manual-ctx"><x-manually-inserted><p>slot-container text</p><x-with-slot><p>wi ....
//
//             expect(cmpShadow.outerHTML).toBe(undefined);
//
//             expect(slottedComponent.outerHTML.length).toBe(73);
//             expect(slottedNode.outerHTML.length).toBe(46);
//         });
//
//         it('should keep behavior for children', () => {
//             expect(elementOutsideLWC.children.length).toBe(1);
//             expect(rootLwcElement.children.length).toBe(0);
//             expect(lwcElementInsideShadow.children.length).toBe(0);
//
//             expect(divManuallyApendedToShadow.children.length).toBe(1);
//
//             expect(cmpShadow.children.length).toBe(2);
//
//             expect(slottedComponent.children.length).toBe(1);
//             expect(slottedNode.children.length).toBe(1);
//         });
//
//         it('should keep behavior for firstElementChild', () => {
//             expect(elementOutsideLWC.firstElementChild.tagName).toBe('X-CONTAINER');
//             expect(rootLwcElement.firstElementChild).toBe(null);
//             expect(lwcElementInsideShadow.firstElementChild).toBe(null);
//
//             expect(divManuallyApendedToShadow.firstElementChild.tagName).toBe(
//                 'X-MANUALLY-INSERTED'
//             );
//
//             expect(cmpShadow.firstElementChild.tagName).toBe('P');
//
//             expect(slottedComponent.firstElementChild.tagName).toBe('DIV');
//             expect(slottedNode.firstElementChild.tagName).toBe('P');
//         });
//
//         it('should keep behavior for lastElementChild', () => {
//             expect(elementOutsideLWC.lastElementChild.tagName).toBe('X-CONTAINER');
//             expect(rootLwcElement.lastElementChild).toBe(null);
//             expect(lwcElementInsideShadow.lastElementChild).toBe(null);
//
//             expect(divManuallyApendedToShadow.lastElementChild.tagName).toBe('X-MANUALLY-INSERTED');
//
//             expect(cmpShadow.lastElementChild.tagName).toBe('X-WITH-SLOT');
//
//             expect(slottedComponent.lastElementChild.tagName).toBe('DIV');
//             expect(slottedNode.lastElementChild.tagName).toBe('P');
//         });
//
//         describe('querySelector', () => {
//             it('should preserve element outside lwc boundary behavior', () => {
//                 expect(elementOutsideLWC.querySelector('p').innerText).toBe('ctx first text');
//                 expect(elementOutsideLWC.querySelector('x-with-slot p').innerText).toBe(
//                     'with-slot text'
//                 );
//                 expect(elementOutsideLWC.querySelector('.manual-ctx x-with-slot p').innerText).toBe(
//                     'with-slot text'
//                 );
//                 expect(elementOutsideLWC.querySelector('div.slotted')).not.toBe(null);
//             });
//
//             it('should preserve root custom element behavior', () => {
//                 expect(rootLwcElement.querySelector('p')).toBe(null);
//                 expect(rootLwcElement.querySelector('x-with-slot p')).toBe(null);
//                 expect(rootLwcElement.querySelector('.manual-ctx x-with-slot p')).toBe(null);
//             });
//
//             it('should preserve behavior for element inside shadow', () => {
//                 const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
//
//                 expect(elemInShadow.querySelector('x-slot-container')).not.toBe(null);
//                 expect(elemInShadow.querySelector('x-with-slot p')).toBe(null);
//             });
//
//             it('should preserve behavior for shadowRoot', () => {
//                 expect(cmpShadow.querySelector('p').innerText).toBe('slot-container text');
//                 expect(cmpShadow.querySelector('x-with-slot p').innerText).toBe('slotted text'); // skipped the one in the shadow of x-with-slot.
//             });
//
//             it('should preserve behavior for manually inserted element in shadow and with lwc components', () => {
//                 expect(divManuallyApendedToShadow.querySelector('p').innerText).toBe(
//                     'slot-container text'
//                 );
//                 expect(divManuallyApendedToShadow.querySelector('x-with-slot p').innerText).toBe(
//                     'with-slot text'
//                 );
//                 expect(divManuallyApendedToShadow.querySelector('div.slotted')).not.toBe(null);
//             });
//         });
//
//         it('should preserve behavior for querySelectorAll', () => {
//             expect(elementOutsideLWC.querySelectorAll('p').length).toBe(8);
//             expect(rootLwcElement.querySelectorAll('p').length).toBe(0);
//
//             const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
//
//             // everything is inside a shadow, :+1:
//             expect(elemInShadow.querySelectorAll('p').length).toBe(0);
//
//             expect(cmpShadow.querySelectorAll('p').length).toBe(2); // slotted elements
//             expect(slottedComponent.querySelectorAll('p').length).toBe(1);
//             expect(divManuallyApendedToShadow.querySelectorAll('p').length).toBe(3);
//         });
//
//         it('should preserve behavior for getElementsByTagName', () => {
//             expect(elementOutsideLWC.getElementsByTagName('p').length).toBe(8);
//             // f
//             expect(rootLwcElement.getElementsByTagName('p').length).toBe(8);
//
//             const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
//
//             // f
//             expect(elemInShadow.getElementsByTagName('p').length).toBe(6);
//
//             // getElementsByTagName is not supported in the shadowRoot
//             // expect(cmpShadow.getElementsByTagName('p').length).toBe(2);
//
//             // f
//             expect(slottedComponent.getElementsByTagName('p').length).toBe(2);
//
//             expect(divManuallyApendedToShadow.getElementsByTagName('p').length).toBe(3);
//         });
//
//         it('should preserve behavior for getElementsByClassName', () => {
//             expect(elementOutsideLWC.getElementsByClassName('slotted').length).toBe(2);
//             // f
//             expect(rootLwcElement.getElementsByClassName('slotted').length).toBe(2);
//
//             const elemInShadow = rootLwcElement.shadowRoot.querySelector('div');
//
//             // f
//             expect(elemInShadow.getElementsByClassName('slotted').length).toBe(2);
//
//             // getElementsByTagName is not supported in the shadowRoot
//             // expect(cmpShadow.getElementsByTagName('p').length).toBe(2);
//
//             // f
//             expect(slottedComponent.getElementsByClassName('slotted').length).toBe(1);
//
//             expect(divManuallyApendedToShadow.getElementsByClassName('slotted').length).toBe(1);
//         });
//     });
// });
