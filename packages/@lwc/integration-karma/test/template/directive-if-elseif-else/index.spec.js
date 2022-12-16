import { createElement } from 'lwc';
import XNested from 'x/nested';
import XTest from 'x/test';
import XForEach from 'x/forEach';
import XparentWithSlot from 'x/parentWithSlot';
import XparentWithNamedSlot from 'x/parentWithNamedSlot';
import XSlottedForEach from 'x/slottedForEach';

describe('lwc:if, lwc:elseif, lwc:else directives', () => {
    it('should render if branch if the value for lwc:if is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showIf = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();
    });

    it('should render elseif branch if the value for lwc:if is falsy and the value for lwc:elseif is truthy', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showElseif = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.elseif')).not.toBeNull();
    });

    it('should render else branch if the values for lwc:if and lwc:elseif are all falsy', () => {
        const elm = createElement('x-test', { is: XTest });
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.else')).not.toBeNull();
    });

    it('should update which branch is rendered if the value changes', () => {
        const elm = createElement('x-test', { is: XTest });
        elm.showIf = true;
        document.body.appendChild(elm);

        expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();

        elm.showIf = false;
        return Promise.resolve()
            .then(() => {
                expect(elm.shadowRoot.querySelector('.else')).not.toBeNull();
                elm.showElseif = true;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.elseif')).not.toBeNull();
                elm.showIf = true;
            })
            .then(() => {
                expect(elm.shadowRoot.querySelector('.if')).not.toBeNull();
            });
    });

    it('should render content when nested inside another if branch', () => {
        const element = createElement('x-nested', { is: XNested });
        element.showContent = true;
        element.showNestedContent = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.nestedContent')).not.toBeNull();
    });

    it('should rerender content when nested inside another if branch', () => {
        const element = createElement('x-nested', { is: XNested });
        element.showContent = true;
        document.body.appendChild(element);

        expect(element.shadowRoot.querySelector('.nestedElse')).not.toBeNull();

        element.showNestedContent = true;
        return Promise.resolve().then(() => {
            expect(element.shadowRoot.querySelector('.nestedContent')).not.toBeNull();
        });
    });

    describe('foreach', () => {
        it('should render list content properly', () => {
            const element = createElement('x-for-each', { is: XForEach });
            element.showList = true;
            document.body.appendChild(element);

            expect(element.shadowRoot.querySelector('.if').textContent).toBe('h123f');
        });

        it('should rerender list content when updated', () => {
            const element = createElement('x-for-each', { is: XForEach });
            element.showList = true;
            document.body.appendChild(element);

            expect(element.shadowRoot.querySelector('.if').textContent).toBe('h123f');

            element.appendToList({
                value: 4,
                show: true,
            });

            return Promise.resolve()
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if').textContent).toBe('h1234f');

                    element.showList = false;
                    element.appendToList({
                        value: 5,
                        show: true,
                    });
                    element.prependToList({
                        value: 0,
                        show: true,
                    });
                })
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if')).toBeNull();

                    element.showList = true;
                })
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if').textContent).toBe('h012345f');
                });
        });

        it('should rerender list items when conditional expressions change', () => {
            const element = createElement('x-for-each', { is: XForEach });
            element.showList = true;
            document.body.appendChild(element);

            expect(element.shadowRoot.querySelector('.if').textContent).toBe('h123f');

            element.appendToList({
                value: 4,
                show: false,
            });

            return Promise.resolve()
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if').textContent).toBe('h123f');

                    element.show(4);
                })
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if').textContent).toBe('h1234f');

                    element.hide(1);
                    element.hide(3);
                    element.prependToList({
                        value: 0,
                        show: true,
                    });
                })
                .then(() => {
                    expect(element.shadowRoot.querySelector('.if').textContent).toBe('h024f');
                });
        });
    });

    describe('slots', () => {
        /**
         * Utility function to verify that slot content is properly assigned in XparentWithSlot
         *
         * @param {Element} child Child element to verify.
         * @param {Boolean} condition Whether slot content is expected or not expected.
         */
        function verifyExpectedSlotContent(child, condition) {
            const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();
            if (condition) {
                expect(assignedNodes.length).toBe(2);
                expect(assignedNodes[0].innerHTML).toBe('static slot header');
                expect(assignedNodes[1].innerHTML).toBe('conditional slot content');
            } else {
                expect(assignedNodes.length).toBe(1);
                expect(assignedNodes[0].innerHTML).toBe('static slot header');
            }
        }

        it('should properly assign content for slots', () => {
            const element = createElement('x-parent', { is: XparentWithSlot });
            document.body.appendChild(element);

            const child = element.shadowRoot.querySelector('x-child-with-slot');

            // When if condition is false, no slot content is provided by parent
            verifyExpectedSlotContent(child, false);
            element.condition = true;
            return Promise.resolve().then(() => {
                // Slot content should be provided when condition is true
                verifyExpectedSlotContent(child, true);
            });
        });

        it('should properly rerender content for slots', () => {
            const element = createElement('x-parent', { is: XparentWithSlot });
            element.condition = true;
            document.body.appendChild(element);

            const child = element.shadowRoot.querySelector('x-child-with-slot');

            verifyExpectedSlotContent(child, true);

            element.condition = false;
            return Promise.resolve()
                .then(() => {
                    verifyExpectedSlotContent(child, false);

                    element.condition = true;
                })
                .then(() => {
                    verifyExpectedSlotContent(child, true);
                });
        });

        it('should properly rerender list content nested inside slots', () => {
            const element = createElement('x-slotted-for-each', { is: XSlottedForEach });
            element.showList = true;
            document.body.appendChild(element);

            const child = element.shadowRoot.querySelector('x-child-with-slot');

            expect(child.textContent).toBe('Hh123fF');

            element.appendToList({
                value: 4,
                show: false,
            });

            return Promise.resolve()
                .then(() => {
                    expect(child.textContent).toBe('Hh123fF');

                    element.show(4);
                })
                .then(() => {
                    expect(child.textContent).toBe('Hh1234fF');
                    element.hide(1);
                })
                .then(() => {
                    expect(child.textContent).toBe('Hh234fF');

                    element.hide(3);
                    element.prependToList({
                        value: 0,
                        show: true,
                    });
                })
                .then(() => {
                    expect(child.textContent).toBe('Hh024fF');
                });
        });

        describe('named slots', () => {
            /**
             * Utility function to verify that named slot content is properly assigned in XparentWithNamedSlot.
             *
             * @param {Element} child Child element to verify.
             * @param {Boolean} condition Whether slot content is expected or not expected.
             */
            function verifyExpectedNamedSlotContent(child, condition) {
                const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();
                if (condition) {
                    expect(assignedNodes.length).toBe(3);
                    expect(assignedNodes[0].innerHTML).toBe('static slot header');
                    expect(assignedNodes[1].innerHTML).toBe('conditional slot content');
                    expect(assignedNodes[2].innerHTML).toBe('static slot footer');
                } else {
                    expect(assignedNodes.length).toBe(2);
                    expect(assignedNodes[0].innerHTML).toBe('static slot header');
                    expect(assignedNodes[1].innerHTML).toBe('static slot footer');
                }
            }

            /**
             * Utility function to verify that default slot content is properly assigned in XparentWithNamedSlot.
             *
             * @param {Element} child Child element to verify.
             */
            function verifyDefaultSlotContent(child) {
                const assignedNodes = child.shadowRoot.querySelectorAll('slot')[1].assignedNodes();

                expect(assignedNodes.length).toBe(0);
                expect(child.shadowRoot.querySelector('.defaultSlot')).not.toBeNull();
            }

            it('should properly assign content for named slots', () => {
                const element = createElement('x-parent', { is: XparentWithNamedSlot });
                document.body.appendChild(element);

                const child = element.shadowRoot.querySelector('x-child-with-named-slot');

                // When if condition is false, no slot content is provided by parent
                verifyExpectedNamedSlotContent(child, false);
                element.condition = true;
                return Promise.resolve().then(() => {
                    verifyExpectedNamedSlotContent(child, true);
                });
            });

            it('should properly rerender content for named slots', () => {
                const element = createElement('x-parent', { is: XparentWithNamedSlot });
                element.condition = true;

                document.body.appendChild(element);
                const child = element.shadowRoot.querySelector('x-child-with-named-slot');

                verifyExpectedNamedSlotContent(child, true);
                verifyDefaultSlotContent(child);

                element.condition = false;
                return Promise.resolve()
                    .then(() => {
                        verifyExpectedNamedSlotContent(child, false);
                        verifyDefaultSlotContent(child);
                        element.condition = true;
                    })
                    .then(() => {
                        verifyExpectedNamedSlotContent(child, true);
                        verifyDefaultSlotContent(child);
                    });
            });

            it('should not override default slot content when no elements are explicitly passed to the default slot', () => {
                const element = createElement('x-parent', { is: XparentWithNamedSlot });
                element.condition = true;
                document.body.appendChild(element);

                const child = element.shadowRoot.querySelector('x-child-with-named-slot');
                verifyDefaultSlotContent(child);

                element.nestedNamedSlot = true;
                return Promise.resolve().then(() => {
                    verifyDefaultSlotContent(child);
                });
            });

            it('should override default slot content when nested conditional elements are passed to the default slot', () => {
                const element = createElement('x-parent', { is: XparentWithNamedSlot });
                element.condition = true;
                element.nestedDefaultSlot = true;
                document.body.appendChild(element);

                const child = element.shadowRoot.querySelector('x-child-with-named-slot');
                const assignedNodes = child.shadowRoot.querySelectorAll('slot')[1].assignedNodes();

                expect(assignedNodes.length).toBe(2);
                expect(assignedNodes[0].innerHTML).toBe('nested default slot content');
                expect(assignedNodes[1].innerHTML).toBe('additional default slot content');
            });

            it('should properly rerender nested conditional slot content', () => {
                const element = createElement('x-parent', { is: XparentWithNamedSlot });
                element.condition = true;
                element.nestedDefaultSlot = true;
                document.body.appendChild(element);

                const child = element.shadowRoot.querySelector('x-child-with-named-slot');
                const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();

                expect(assignedNodes.length).toBe(3);

                element.nestedNamedSlot = true;
                element.nestedDefaultSlot = false;
                return Promise.resolve().then(() => {
                    const assignedNodes = child.shadowRoot.querySelector('slot').assignedNodes();
                    expect(assignedNodes.length).toBe(4);
                    expect(assignedNodes[2].innerHTML).toBe('nested slot content');
                });
            });
        });
    });
});
